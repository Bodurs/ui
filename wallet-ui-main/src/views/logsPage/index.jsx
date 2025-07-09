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
import moment from 'moment';
import ApiService from '../../services/ApiService';

const LogPage = () => {
  const toast = useRef(null);
  const dt = useRef(null);
  const exportMenu = useRef(null);

  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    user_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    action: { value: null, matchMode: FilterMatchMode.CONTAINS },
    created_at: { value: null, matchMode: FilterMatchMode.DATE_IS }
  });

  const getLogs = async () => {
    setLoading(true);
    try {
      const res = await ApiService.get('/api/0/v1/acc/accauditlog/get');
      const logsData = res.data.data || [];
      setLogs(logsData);
      setFilteredLogs(logsData);
    } catch (error) {
      console.error('Log fetch error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Hata',
        detail: 'Log verileri alınamadı',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const filterByDate = () => {
    let filtered = [...logs];
    if (startDate && endDate) {
      filtered = logs.filter(log => {
        if (!log.created_at) return false;
        const logDate = new Date(log.created_at);
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return logDate >= start && logDate <= end;
      });
    } else {
      filtered = logs;
    }
    setFilteredLogs(filtered);
  };

  useEffect(() => {
    getLogs();
  }, []);

  useEffect(() => {
    filterByDate();
  }, [startDate, endDate, logs]);

  const clearFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      id: { value: null, matchMode: FilterMatchMode.CONTAINS },
      user_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
      action: { value: null, matchMode: FilterMatchMode.CONTAINS },
      created_at: { value: null, matchMode: FilterMatchMode.DATE_IS }
    });
    setStartDate(null);
    setEndDate(null);
    toast.current?.show({
      severity: 'success',
      summary: 'Başarılı',
      detail: 'Filtreler temizlendi',
      life: 2000
    });
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  const exportExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(filteredLogs);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');
      XLSX.writeFile(workbook, 'logs.xlsx');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Hata',
        detail: 'Excel export işlemi başarısız',
        life: 3000
      });
    }
  };

  const exportPdf = () => {
    try {
      const doc = new jsPDF();
      doc.autoTable({
        head: [['ID', 'User ID', 'Action', 'Details', 'Created At']],
        body: filteredLogs.map(log => [
          log.id,
          log.user_id,
          log.action,
          log.details,
          log.created_at
        ])
      });
      doc.save('logs.pdf');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Hata',
        detail: 'PDF export işlemi başarısız',
        life: 3000
      });
    }
  };

  const exportButtons = [
    { label: 'CSV Export', icon: 'pi pi-file', command: exportCSV },
    { label: 'Excel Export', icon: 'pi pi-file-excel', command: exportExcel },
    { label: 'PDF Export', icon: 'pi pi-file-pdf', command: exportPdf }
  ];

  const dateFilterTemplate = (options) => {
    return (
      <Calendar
        value={options.value}
        onChange={(e) => {
          options.filterCallback(e.value);
          setStartDate(e.value);
          setEndDate(e.value);
        }}
        dateFormat="mm/dd/yy"
        placeholder="mm/dd/yyyy"
        showIcon
        className="p-inputtext-sm"
      />
    );
  };

  const header = (
    <div className="flex justify-content-between align-items-center">
      <h5 className="m-0">Audit Logs</h5>
      <div className="flex align-items-center gap-2">
        <Menu model={exportButtons} popup ref={exportMenu} id="export_menu" />
        <Button
          icon="pi pi-download"
          tooltip="Dışa Aktar"
          tooltipOptions={{ position: 'top' }}
          onClick={(e) => exportMenu.current?.toggle(e)}
          rounded
          text
          severity="secondary"
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
        value={filteredLogs}
        paginator
        rows={10}
        loading={loading}
        filters={filters}
        onFilter={(e) => setFilters(e.filters)}
        globalFilterFields={['id', 'user_id', 'action']}
        header={header}
        emptyMessage="Log bulunamadı."
        showGridlines
        stripedRows
        scrollable
      >
        <Column
          field="id"
          header="ID"
          filter
          filterPlaceholder="ID ile Ara"
          sortable
          style={{ minWidth: '120px' }}
        />
        <Column
          field="user_id"
          header="User ID"
          filter
          filterPlaceholder="User ID ile Ara"
          sortable
          style={{ minWidth: '150px' }}
        />
        <Column
          field="action"
          header="Action"
          filter
          filterPlaceholder="Action ile Ara"
          sortable
          style={{ minWidth: '120px' }}
        />
        <Column
          field="details"
          header="Details"
          sortable
          style={{ minWidth: '200px' }}
        />
        <Column
          field="created_at"
          header="Created At"
          dataType="date"
          filterField="created_at"
          filter
          filterElement={dateFilterTemplate}
          sortable
          body={(rowData) => moment(rowData.created_at).format('DD.MM.YYYY')}
          style={{ minWidth: '250px' }}
        />
      </DataTable>
    </div>
  );
};

export default LogPage;
