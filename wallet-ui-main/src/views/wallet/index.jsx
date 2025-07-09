import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Menu } from 'primereact/menu';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import ApiService from '../../services/ApiService';
import { Color } from 'maplibre-gl';

const Wallet = () => {
  const toast = useRef(null);
  const dt = useRef(null);
  const exportMenu = useRef(null);

  const [wallets, setWallets] = useState([]);
  const [balanceRange, setBalanceRange] = useState({ min: '', max: '' });

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { value: null, matchMode: FilterMatchMode.EQUALS },
    account_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    currency: { value: null, matchMode: FilterMatchMode.EQUALS },
    balance: { value: null, matchMode: FilterMatchMode.BETWEEN },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
    iban: { value: null, matchMode: FilterMatchMode.CONTAINS },
    label: { value: null, matchMode: FilterMatchMode.CONTAINS }
    
  }
);

  const currencyOptions = [
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'TRY', value: 'TRY' }
  ];

  const statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  const currencyFilterTemplate = (options) => (
    <Dropdown
      value={options.value}
      options={currencyOptions}
      onChange={(e) => options.filterCallback(e.value)}
      placeholder="Currency"
      className="p-column-filter"
      showClear
    />
  );

  const formatCurrency = (value, currency = 'USD') => {
    try {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 2
      }).format(value);
    } catch {
      return value;
    }
  };

  const clearFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      id: { value: null, matchMode: FilterMatchMode.EQUALS },
      account_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
      currency: { value: null, matchMode: FilterMatchMode.EQUALS },
      balance: { value: null, matchMode: FilterMatchMode.BETWEEN },
      status: { value: null, matchMode: FilterMatchMode.EQUALS },
      iban: { value: null, matchMode: FilterMatchMode.CONTAINS },
      label: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });

    setBalanceRange({ min: '', max: '' });

    toast.current?.show({
      severity: 'success',
      summary: 'Başarılı',
      detail: 'Filtreler temizlendi',
      life: 2000
    });
  };

  const balanceFilterTemplate = (options) => (
    <div className="flex gap-2">
      <InputText
        type="number"
        value={balanceRange.min}
        onChange={(e) => {
          const min = e.target.value;
          const max = balanceRange.max;
          setBalanceRange({ ...balanceRange, min });
          options.filterApplyCallback([min, max]);
        }}
        placeholder="Min"
      />
      <InputText
        type="number"
        value={balanceRange.max}
        onChange={(e) => {
          const max = e.target.value;
          const min = balanceRange.min;
          setBalanceRange({ ...balanceRange, max });
          options.filterApplyCallback([min, max]);
        }}
        placeholder="Max"
      />
    </div>
  );

  const statusFilterTemplate = (options) => (
    <Dropdown
      value={options.value}
      options={statusOptions}
      onChange={(e) => options.filterCallback(e.value)}
      placeholder="Status"
      className="p-column-filter"
      showClear
    />
  );

  // Export Fonksiyonları
  const exportCSV = () => {
    dt.current.exportCSV();
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(wallets);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Wallets');
    XLSX.writeFile(workbook, 'wallets.xlsx');
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['ID', 'Account ID', 'Balance', 'Currency', 'IBAN', 'Label', 'Status']],
      body: wallets.map(w => [
      
        w.id,
        w.account_id,
        w.balance,
        w.currency,
        w.iban,
        w.label,
        w.status
        
      ])
    });
    doc.save('wallets.pdf');
  };

  const exportButtons = [
    { label: 'CSV Export', icon: 'pi pi-file', command: () => exportCSV() },
    { label: 'Excel Export', icon: 'pi pi-file-excel', command: () => exportExcel() },
    { label: 'PDF Export', icon: 'pi pi-file-pdf', command: () => exportPdf() }
  ];

  const header = (
    <div className="flex justify-content-between align-items-center">
      <h5 className="m-0">Wallets</h5>
      <div className="flex align-items-center gap-2">
        <Menu model={exportButtons} popup ref={exportMenu} id="export_menu" />
        <Button
          icon="pi pi-download"
          tooltip="Dışa Aktar"
          tooltipOptions={{ position: 'top' }}
          onClick={(e) => exportMenu.current.toggle(e)}
          rounded
          text
          severity="secondary"
          aria-label="Dışa Aktar"
        />
        <Button
          icon="pi pi-filter-slash"
          tooltip="Filtreleri Temizle"
          tooltipOptions={{ position: 'top' }}
          onClick={clearFilters}
          rounded
          text
          severity="danger"
        />
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            placeholder="Genel Arama"
            type="search"
            value={filters.global.value || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                global: {
                  value: e.target.value,
                  matchMode: FilterMatchMode.CONTAINS
                }
              })
            }
          />
        </IconField>
      </div>
    </div>
  );

  useEffect(() => {
    ApiService.get('/api/0/v1/acc/accwallet/get')
      .then((res) => {
        if (res.data.success && res.data.data.length > 0) {
          setWallets(res.data.data);
        } else {
       
          setWallets([
            {
              id: 1,
              account_id: '001',
              balance: 1000,
              currency: 'USD',
              iban: 'US1234567890',
              label: 'Wallet',
              status: 'Active'
            },
            {
              id: 2,
              account_id: '002',
              balance: 500,
              currency: 'EUR',
              iban: 'EU0987654321',
              label: 'Wallet',
              status: 'Inactive'
            }
          ]);
        }
      })
      .catch((err) => {
        console.error('API error:', err);
      
        setWallets([
          {
            id: 1,
            account_id: '001',
            balance: 1000,
            currency: 'USD',
            iban: 'US1234567890',
            label: 'Wallet',
            status: 'Active'
          }
        ]);
      });
  }, []);

  return (
    <div>
      <Toast ref={toast} />
      <DataTable
        ref={dt}
        value={wallets}
        paginator
        rows={10}
        filters={filters}
        globalFilterFields={['id', 'account_id', 'balance', 'currency', 'iban', 'label', 'status']}
        header={header}
        emptyMessage="No wallets found"
        onFilter={(e) => setFilters(e.filters)}
      >
        <Column field="id" header="ID" filter filterPlaceholder="ID ile Ara" />
        <Column field="account_id" header="Account ID" filter filterPlaceholder="Account ID ile Ara" />
        <Column
          field="balance"
          header="Balance"
          body={(rowData) => formatCurrency(rowData.balance, rowData.currency)}
          filter
          filterElement={balanceFilterTemplate}
          filterMatchMode="between"
          showFilterMenuOptions={false}
        />
        <Column field="currency" header="Currency" filter filterElement={currencyFilterTemplate} showFilterMenuOptions={false} />
        <Column field="iban" header="IBAN" filter filterPlaceholder="IBAN ile Ara" showFilterMenuOptions={false} />
        <Column field="label" header="Label" filter filterPlaceholder="Label ile Ara" showFilterMenuOptions={false} />
        <Column field="status" header="Status" filter filterField="status" filterElement={statusFilterTemplate} showFilterMenuOptions={false} />
      </DataTable>
    </div>
  );
};

export default Wallet;
