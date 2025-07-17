import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Menu } from 'primereact/menu';
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import ApiService from './../../services/ApiService';
import { useAuth } from './../../services/AuthContext';
import { buildQueryParams } from './../../hooks/buildQueryParams';
import ServerSideHeader from './../../components/ServerSideHeader';
import Cookies from 'js-cookie';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Logs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const terminalId = searchParams.get('terminal_id') || '';
  const toast = useRef(null);
  const exportMenu = useRef(null);
  const [logs, setLogs] = useState([]);
  const [filterOpen, setFilterOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [allowEdit, setAllowEdit] = useState(true);
  const [terminals, setTerminals] = useState([]);
  const dt = useRef(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const pdfColumns = ['ID', 'Terminal ID', 'Level', 'Subject', 'Description', 'Pdate', 'Time Stamp'];
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogContent, setDialogContent] = useState(null);

  // İlk açılışta tüm filtre anahtarlarını tanımlıyoruz.
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 50,
    sortField: 'time_stamp',
    sortOrder: -1,
    filters: {
      terminal_id: { value: null, matchMode: FilterMatchMode.EQUALS },
      level: { value: null, matchMode: FilterMatchMode.EQUALS },
      subject: { value: null, matchMode: FilterMatchMode.CONTAINS },
      description: { value: null, matchMode: FilterMatchMode.CONTAINS },
      time_stamp: { value: new Date(), matchMode: FilterMatchMode.EQUALS }
    }
  });

  useEffect(() => {
    getLogs();
  }, [lazyParams]);

  // Level dropdown seçenekleri
  const levelOptions = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 }
  ];

  useEffect(() => {
    getTerminals();
  }, []);

  async function getTerminals() {
    setLoading(true);
    try {
      const url = user.role === 'systemadmin'
        ? `/api/0/v1/ev/terminal/get?organization_id=${Cookies.get('organization_id')}`
        : '/api/0/v1/ev/terminal/get';
      const response = await ApiService.get(url);
      setTerminals(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('GET request error:', error);
      setLoading(false);
      throw error;
    }
  }

  async function getLogs() {
    const queryParams = buildQueryParams(lazyParams, 'time_stamp');
    if (queryParams.includes('filters=')) {
      setLoading(true);
      try {
        const response = await ApiService.get(`/api/0/v1/ev/terminallog/get?${queryParams}`);
        setLogs(response.data.data);
        setTotalRecords(response.data.recordsTotal);
        setLoading(false);
      } catch (error) {
        console.error('GET request error:', error);
        setLoading(false);
        throw error;
      }
    }
  }

  const refreshLogs = () => {
    getLogs();
  };

  const dateBodyTemplate = (rowData) => {
    return moment(rowData.time_stamp).format('DD.MM.YYYY HH:mm:ss.SSS');
  };

  const dateStringTemplate = (rowData) => {
    return moment(rowData.pdate).format('DD.MM.YYYY');
  };

  const clearFilters = () => {
    setLazyParams((prev) => ({
      ...prev,
      first: 0,
      sortField: 'time_stamp',
      sortOrder: -1,
      filters: {
        terminal_id: { value: null, matchMode: FilterMatchMode.EQUALS },
        level: { value: null, matchMode: FilterMatchMode.EQUALS },
        subject: { value: null, matchMode: FilterMatchMode.CONTAINS },
        description: { value: null, matchMode: FilterMatchMode.CONTAINS },
        time_stamp: { value: new Date(), matchMode: FilterMatchMode.EQUALS }
      }
    }));
    toast.current.show({
      severity: 'success',
      summary: t('Success'),
      detail: t('Data table filters cleared!'),
      life: 2000,
    });
  };

  const myPaginatorTemplate = {
    layout: 'RowsPerPageDropdown PrevPageLink PageLinks NextPageLink CurrentPageReport',
    RowsPerPageDropdown: (options) => {
      return <div className="my-paginator-left">{options.element}</div>;
    },
    CurrentPageReport: (options) => {
      options.element = `Showing ${options.first} to ${options.last} of ${options.totalRecords} entries`;
      return <div className="my-paginator-right">{options.element}</div>;
    }
  };

  const cellTemplate = (rowData, field) => {
    return (
      <span
        onClick={() => {
          let jsonContent = rowData[field];
          console.log("jsonContent", jsonContent);
          jsonContent = jsonContent.replace(/\\\"/g, '\"');
          try {
            // Eğer gelen veri string ise parse edip biçimlendiriyoruz.
            const parsed = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
            jsonContent = JSON.stringify(parsed, null, 2);
          } catch (error) {
            // Hatalı JSON ise olduğu gibi bırakıyoruz
            console.error("JSON parse error:", error);
          }
          setDialogContent(jsonContent);
          setDialogVisible(true);
        }}
        style={{ cursor: 'pointer' }}
      >
        {rowData[field].replace(/\\\"/g, '\"')}
      </span>
    );
  };

  const padValue = (rowData, column) => {
    const value = rowData[column.field];
    return String(value).padStart(8, '0'); // değeri 8 karaktere tamamlamak için başına 0 ekler
};

  return (
    <div className='datatable-doc-demo logs-datatable'>
      <Toast ref={toast} />
      <DataTable
        header={
          <ServerSideHeader
            dtRef={dt}
            data={logs}
            title="Logs"
            fileName="logs"
            pdfColumns={pdfColumns}
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            lazyParams={lazyParams}
            setLazyParams={setLazyParams}
            clearFilters={clearFilters}
            showRefresh={true}
            refresh={refreshLogs}
          />
        }
        scrollable
        stripedRows
        lazy
        ref={dt}
        value={logs}
        paginator
        showGridlines
        rows={lazyParams.rows}
        rowsPerPageOptions={[50, 100, 500, 1000]}
        loading={loading}
        dataKey="id"
        filterDisplay="row"
        filters={lazyParams.filters}  // DataTable’ın dahili filtre state'ini kullanıyoruz
        emptyMessage="No logs found."
        onPage={(e) => setLazyParams((prev) => ({ ...prev, first: e.first, rows: e.rows }))}
        paginatorTemplate={myPaginatorTemplate}
        totalRecords={totalRecords}
        first={lazyParams.first}
        sortField={lazyParams.sortField}
        sortOrder={lazyParams.sortOrder}
        onSort={(e) =>
          setLazyParams((prev) => ({ ...prev, sortField: e.sortField, sortOrder: e.sortOrder }))
        }
        onFilter={(e) =>
          setLazyParams((prev) => ({ ...prev, filters: e.filters, first: 0 }))
        }
      >
        <Column field="id" header="ID" style={{ display: 'none' }} />

        <Column
          field="terminal_id"
          header="Terminal ID"
          body={padValue}
          filter
          filterPlaceholder="Search by Terminal ID"
          showFilterMenu={false}
          style={{ width: '10rem' }}
        />

        <Column
          field="level"
          header="Level"
          filter
          filterPlaceholder="Search by Level"
          showFilterMenu={false}
          style={{ width: '10rem' }}
        />

        <Column
          field="subject"
          header="Subject"
          filter
          filterPlaceholder="Search by Subject"
          showFilterMenu={false}
          
        />

        <Column
          field="description"
          header="Description"
          style={{ width: '50rem', maxWidth: '50rem' }}
          bodyStyle={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          body={(rowData) => cellTemplate(rowData, 'description')}
          filter
          filterPlaceholder="Search by Description"
          showFilterMenu={false}
        />

        <Column
          field="time_stamp"
          header="Timestamp"
          dataType="date"
          sortable
          body={dateBodyTemplate}
          style={{ maxWidth: '1200px' }}
          bodyStyle={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          filter
          showFilterMenu={false}
          filterElement={
            <Calendar
              value={lazyParams.filters?.time_stamp?.value || null}
              onChange={(e) => {
                dt.current.filter(e.value, 'time_stamp', 'equals');
                setLazyParams((prev) => ({
                  ...prev,
                  filters: {
                    ...prev.filters,
                    time_stamp: { value: e.value, matchMode: FilterMatchMode.EQUALS }
                  }
                }));
              }}
              dateFormat="dd.mm.yy"
              placeholder="Select Date"
              showIcon
            />
          }
        />
      </DataTable>
      <Dialog header="Description" visible={dialogVisible} onHide={() => setDialogVisible(false)} style={{ width: '50vw' }}>
        <pre>{dialogContent}</pre>
      </Dialog>
    </div>
  );
};

export default Logs;
