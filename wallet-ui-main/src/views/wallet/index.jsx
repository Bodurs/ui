import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import ApiService from '../../services/ApiService';

const Wallet = () => {
  const toast = useRef(null);

  const [wallets, setWallets] = useState([]);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { value: null, matchMode: FilterMatchMode.EQUALS },
    account_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    currency: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });

  const clearFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      id: { value: null, matchMode: FilterMatchMode.EQUALS },
      account_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
      currency: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });

    toast.current.show({
      severity: 'success',
      summary: 'Başarılı',
      detail: 'Filtreler temizlendi',
      life: 2000,
    });
  };

  const header = (
    <div className="flex justify-content-between align-items-center">
      <h5 className="m-0">Wallets</h5>
      <div className="flex align-items-center">
        <Button
          icon="pi pi-filter-slash"
          tooltip="Filtreleri Temizle"
          tooltipOptions={{ position: 'top' }}
          onClick={clearFilters}
          rounded
          text
          severity="danger"
          aria-label="Filtreleri Temizle"
          className="mr-2"
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
                  matchMode: FilterMatchMode.CONTAINS,
                },
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
      <h3>Wallet List</h3>
      <DataTable
        value={wallets}
        paginator
        rows={10}
        filters={filters}
        globalFilterFields={[
          'id',
          'account_id',
          'balance',
          'currency',
          'iban',
          'label',
          'status'
        ]}
        header={header}
        emptyMessage="No wallets found"
        onFilter={(e) => setFilters(e.filters)}
      >
        <Column field="id" header="ID" filter filterPlaceholder="ID ile Ara" />
        <Column
          field="account_id"
          header="Account ID"
          filter
          filterPlaceholder="Account ID ile Ara"
        />
        <Column
          field="balance"
          header="Balance"
          filter
          filterPlaceholder="Balance ile Ara"
        />
        <Column
          field="currency"
          header="Currency"
          filter
          filterPlaceholder="Currency ile Ara"
        />
        <Column field="iban" header="IBAN" filter filterPlaceholder="IBAN ile Ara" />
        <Column field="label" header="Label" filter filterPlaceholder="Label ile Ara" />
        <Column field="status" header="Status" filter filterPlaceholder="Status ile Ara" />
      </DataTable>
    </div>
  );
};

export default Wallet;
