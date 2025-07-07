import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Calendar } from 'primereact/calendar';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import ApiService from '../../services/ApiService';

const LogPage = () => {
  const toast = useRef(null);
  const dt = useRef(null);
  const exportMenu = useRef(null);

  const [logs, setLogs] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    user_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    action: { value: null, matchMode: FilterMatchMode.CONTAINS },
    created_at: { value: null, matchMode: FilterMatchMode.BETWEEN }
  });

  const getLogs = async () => {
    try {
      const res = await ApiService.get('/api/0/v1/acc/accauditlog/get');
      setLogs(res.data.data || []);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Hata',
        detail: 'Log verileri alınamadı',
        life: 3000
      });
    }
  };

  useEffect(() => {
    getLogs();
  }, []);

  const clearFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      id: { value: null, matchMode: FilterMatchMode.CONTAINS },
      user_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
      action: { value: null, matchMode: FilterMatchMode.CONTAINS },
      created_at: { value: null, matchMode: FilterMatchMode.BETWEEN }
    });
    setDateRange([null, null]);

    toast.current?.show({
      severity: 'success',
      summary: 'Başarılı',
      detail: 'Filtreler temizlendi',
      life: 2000
    });
  };

  const exportCSV = () => {
    dt.current.exportCSV();
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(logs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');
    XLSX.writeFile(workbook, 'logs.xlsx');
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['ID', 'User ID', 'Action', 'Details', 'Created At']],
      body: logs.map(log => [
        log.id,
        log.user_id,
        log.action,
        log.details,
        log.created_at
      ])
    });
    doc.save('logs.pdf');
  };

  const exportButtons = [
    { label: 'CSV Export', icon: 'pi pi-file', command: exportCSV },
    { label: 'Excel Export', icon: 'pi pi-file-excel', command: exportExcel },
    { label: 'PDF Export', icon: 'pi pi-file-pdf', command: exportPdf }
  ];

  const dateRangeFilterTemplate = (options) => (
    <Calendar
      value={dateRange}
      onChange={(e) => {
        setDateRange(e.value);
        options.filterApplyCallback(e.value);
      }}
      selectionMode="range"
      placeholder="Tarih aralığı seç"
      dateFormat="yy-mm-dd"
      showIcon
      className="p-column-filter"
    />
  );

  const header = (
    <div className="flex justify-content-between align-items-center">
      <h5 className="m-0">Audit Logs</h5>
      <div className="flex align-items-center gap-2">
        <Menu model={exportButtons} popup ref={exportMenu} id="export_menu" />
        <Button
          icon="pi pi-download"
          tooltip="Dışa Aktar"
          tooltipOptions={{ position: 'top' }}
          onClick={(e) => exportMenu.current.toggle(e)}
          rounded
          text
          severity="info"
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

  return (
    <div className="card">
      <Toast ref={toast} />
      <DataTable
        ref={dt}
        value={logs}
        paginator
        rows={10}
        filters={filters}
        onFilter={(e) => setFilters(e.filters)}
        globalFilterFields={['id', 'user_id', 'action', 'created_at']}
        header={header}
        emptyMessage="Log bulunamadı."
        showGridlines
        stripedRows
        scrollable
      >
        <Column field="id" header="ID" filter filterPlaceholder="ID ile Ara" sortable />
        <Column field="user_id" header="User ID" filter filterPlaceholder="User ID ile Ara" sortable />
        <Column field="action" header="Action" filter filterPlaceholder="Action ile Ara" sortable />
        <Column field="details" header="Details" sortable />
        <Column
          field="created_at"
          header="Created At"
          filter
          sortable
          dataType="date"
          filterMatchMode="between"
          filterElement={dateRangeFilterTemplate}
        />
      </DataTable>
    </div>
  );
};

export default LogPage;
