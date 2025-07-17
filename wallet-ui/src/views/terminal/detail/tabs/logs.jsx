import React, { useState, useEffect, useRef } from 'react';
import ApiService from '../../../../services/ApiService';
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { FilterMatchMode } from 'primereact/api';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';
import { Menu } from 'primereact/menu';
import { ConfirmDialog } from 'primereact/confirmdialog';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const LogsContent = ({ id, logs, loading, selectedRow, setSelectedRow }) => {

  const toast = useRef(null);
  const exportMenu = useRef(null);
  const [allowEdit, setAllowEdit] = useState(true);
  const dt = useRef(null);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    terminal_name: { value: null, matchMode: FilterMatchMode.EQUALS },
    company_id: { value: null, matchMode: FilterMatchMode.EQUALS },
    station_id: { value: null, matchMode: FilterMatchMode.EQUALS },
    ev_device_id: { value: null, matchMode: FilterMatchMode.EQUALS },
    lat: { value: null, matchMode: FilterMatchMode.EQUALS },
    lon: { value: null, matchMode: FilterMatchMode.EQUALS },
    created_at: { value: null, matchMode: FilterMatchMode.DATE_IS }
  });
  const exportButtons = [
    { label: 'Csv Export', icon: 'pi pi-fw pi-file', command: () => { exportCSV(false) } },
    { label: 'Excel Export', icon: 'pi pi-fw pi-file-excel', command: () => { exportExcel() } },
    { label: 'Pdf Export', icon: 'pi pi-fw pi-file-pdf', command: () => { exportPdf() } }
  ];
  const [dialogVisible, setDialogVisible] = useState(false);


  const dateBodyTemplate = (rowData) => {
    //return new Date(rowData.created_at).toLocaleDateString();
    return moment(rowData.created_at).format('DD.MM.YYYY');
  };

  const dateFilterTemplate = (options) => {
    return <Calendar value={options.value} onChange={(e) => options.filterCallback(e.value)} dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" />;
  };

  const clearFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      level: { value: null, matchMode: FilterMatchMode.EQUALS },
      subject: { value: null, matchMode: FilterMatchMode.EQUALS },
      description: { value: null, matchMode: FilterMatchMode.EQUALS },
      pdate: { value: null, matchMode: FilterMatchMode.DATE_IS },
      created_at: { value: null, matchMode: FilterMatchMode.DATE_IS }
    });
  };
  
  // CSV Export
  const exportCSV = () => {
    dt.current.exportCSV();
  };

  // Excel Export
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(poss);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pos Logs');
    XLSX.writeFile(workbook, 'poslogs.xlsx');
  };

  // PDF Export
  const exportPdf = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['POS Number', 'Timestamp', 'Level', 'Subject', 'Description', 'Date', 'Create Date']],
      body: logs.map((log) => [log.terminal_name, log.level, log.subject, log.description, log.pdate, log.created_at]),
    });
    doc.save('poslist.pdf');
  };

  const header = (
    <div className="flex justify-content-between align-items-center">
      <h5 className="m-0">POS Logs #{id}</h5>
      <div className="flex align-items-center">
        {selectedRow && <Button
          type="button"
          icon="pi pi-trash"
          className="p-button-danger mr-2"
          label="Delete"
          onClick={() => setDialogVisible(true)}
          size="small"
        />}
        <Menu model={exportButtons} popup ref={exportMenu} id="popup_menu_left" />
        <Button icon="pi pi-download" tooltip="Export" tooltipOptions={{ position: "top" }} onClick={(event) => exportMenu.current.toggle(event)} rounded text severity="secondary" aria-label="Export" />
        <Button icon="pi pi-sort-alt-slash" tooltip="Clear Filters" tooltipOptions={{ position: "top" }} onClick={clearFilters} rounded text severity="danger" aria-label="Clear Filter" className='right-10'/>
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search"> </InputIcon>
          <InputText
            placeholder="Global Search"
            type="search"
            value={filters.global.value || ''}
            onChange={(e) => setFilters({ ...filters, global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS } })}
          />
        </IconField>
      </div>
    </div>
  );

  return (
    <div className="datatable-doc-demo">
      <Toast ref={toast} />
      <DataTable scrollable stripedRows ref={dt} rowsPerPageOptions={[20, 50, 100, 500, 1000]} value={logs} paginator showGridlines rows={20} loading={loading} dataKey="id"
        filters={filters} globalFilterFields={['terminal_name', 'ev_device_id']} header={header}
        emptyMessage="No POS found." onFilter={(e) => setFilters(e.filters)} autolayout="true">
        <Column field="terminal_name" header="POS Number" filter filterPlaceholder="Search by POS number" />
        <Column field="level" header="Level" filter filterPlaceholder="Search by level" />
        <Column field="subject" header="Subject" filter filterPlaceholder="Search by subject" />
        <Column field="description" header="Description" filter filterPlaceholder="Search by description" />
        <Column header="Date" filterField="pdate" dataType="date" body={dateBodyTemplate} filter filterElement={dateFilterTemplate} />
        <Column header="Create Date" filterField="created_at" dataType="date" body={dateBodyTemplate} filter filterElement={dateFilterTemplate} />
      </DataTable>
    </div>
  );
};

export default LogsContent;