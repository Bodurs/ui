import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dialog } from "primereact/dialog";
import { Dropdown } from 'primereact/dropdown';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Menu } from 'primereact/menu';
import { Toast } from 'primereact/toast';
import ApiService from '../../../services/ApiService';
import { useAuth } from '../../../services/AuthContext';
import ConfigDialog from '../../../components/ConfigDialog';
import Cookies from 'js-cookie';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const TerminalList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useRef(null);
  const exportMenu = useRef(null);
  const [terminals, setTerminals] = useState([]);
  const [regions, setRegions] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerminalId, setSelectedTerminalId] = useState(null);
  const [selectedTerminalConfig, setSelectedTerminalConfig] = useState([]);
  const [allowEdit, setAllowEdit] = useState(true);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const dt = useRef(null);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { value: null, matchMode: FilterMatchMode.EQUALS },
    terminal_name: { value: null, matchMode: FilterMatchMode.EQUALS },
    region_id: { value: null, matchMode: FilterMatchMode.EQUALS },
    org_merchant_id: { value: null, matchMode: FilterMatchMode.EQUALS },
    serial_number: { value: null, matchMode: FilterMatchMode.EQUALS },
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
  const [selectedRow, setSelectedRow] = useState(null);
  const [addNewVisible, setAddNewVisible] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    terminal_name: "",
    region_id: "",
    org_merchant_id: "",
    serial_number: "",
    lat: "",
    lon: "",
    organization_id: Cookies.get('organization_id')
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const response = await ApiService.post('/api/0/v1/ev/terminal/save', formData);
      if (response?.result?.code == "0") {
        setAddNewVisible(false);
        getTerminals();
        toast.current.show({
          severity: 'success',
          summary: t('Success'),
          detail: t('New terminal added!'),
          life: 2000,
        });
      } else {
        toast.current.show({
          severity: 'error',
          summary: t('Error'),
          detail: t('An error occurred!'),
          life: 2000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: t('Error'),
        detail: t('An error occurred!'),
        life: 2000,
      });
    }
  };

  const footerContent = (
    <div>
      <Button label={t('Cancel')} icon="pi pi-times" onClick={() => setAddNewVisible(false)} className="p-button-text" />
      <Button label={t('Save')} icon="pi pi-check" onClick={handleSubmit} autoFocus />
    </div>
  );



  useEffect(() => {
    getTerminals();
    getRegions();
    getMerchants();
  }, []);

  async function getTerminals() {
    setLoading(true);
    try {
      const url = user.role === 'systemadmin' ? `/api/0/v1/ev/terminal/get?organization_id=${Cookies.get('organization_id')}` : '/api/0/v1/ev/terminal/get';
      const response = await ApiService.get(url);
      setTerminals(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('GET request error:', error);
      setLoading(false);
      throw error;
    }
  }

  async function getRegions() {
    try {
      const url = user.role === 'systemadmin' ? `/api/0/v1/base/organization/regions?organization_id=${Cookies.get('organization_id')}` : '/api/0/v1/base/organization/regions';
      const response = await ApiService.get(url);
      setRegions(response.data.data);
    } catch (error) {
      console.error('GET request error:', error);
      throw error;
    }
  }

  async function getMerchants() {
    try {
      const url = user.role === 'systemadmin' ? `/api/0/v1/base/organization/merchants?organization_id=${Cookies.get('organization_id')}` : '/api/0/v1/base/organization/merchants';
      const response = await ApiService.get(url);
      setMerchants(response.data.data);
    } catch (error) {
      console.error('GET request error:', error);
      throw error;
    }
  }

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
      id: { value: null, matchMode: FilterMatchMode.EQUALS },
      terminal_name: { value: null, matchMode: FilterMatchMode.EQUALS },
      company_id: { value: null, matchMode: FilterMatchMode.EQUALS },
      station_id: { value: null, matchMode: FilterMatchMode.EQUALS },
      ev_device_id: { value: null, matchMode: FilterMatchMode.EQUALS },
      lat: { value: null, matchMode: FilterMatchMode.EQUALS },
      lon: { value: null, matchMode: FilterMatchMode.EQUALS },
      created_at: { value: null, matchMode: FilterMatchMode.DATE_IS }
    });
  };

  const onRowEditComplete = async (e) => {
    let { newData, index } = e;
    try {
      const response = await ApiService.post('/api/0/v1/ev/terminal/save', {
        terminal_name: newData.terminal_name,
        region_id: newData.region_id,
        org_merchant_id: newData.org_merchant_id,
        serial_number: newData.serial_number,
        lat: newData.lat,
        lon: newData.lon,
        id: newData.id,
        organization_id: Cookies.get('organization_id')
      });
      const updatedTerminals = [...terminals];
      updatedTerminals[index] = {
        ...updatedTerminals[index],
        terminal_name: newData.terminal_name,
        region_id: newData.region_id,
        org_merchant_id: newData.org_merchant_id,
        serial_number: newData.serial_number,
        lat: newData.lat,
        lon: newData.lon
      };
      setTerminals(updatedTerminals);
      toast.current.show({
        severity: 'success',
        summary: t('Success'),
        detail: t('Terminal informations edited!'),
        life: 2000,
      });
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: t('Error'),
        detail: t('An error occurred!'),
        life: 2000,
      });
    }
  };

  const regionBodyTemplate = (rowData) => {
    const currentRegionObj = regions.find((r) => r.id === rowData.region_id);
    return currentRegionObj ? currentRegionObj.name : null;
  };


  const regionEditor = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={regions}
        onChange={(e) => options.editorCallback(e.value)}
        optionLabel="name"
        optionValue="id"
        placeholder="Choose Region"
        className='dropdown-edit-mode'
      />
    );
  };

  const merchantBodyTemplate = (rowData) => {
    const currentMerchantObj = merchants.find((r) => r.id == rowData.org_merchant_id);
    return currentMerchantObj ? currentMerchantObj.name : null;
  };


  const merchantEditor = (options) => {
    return (
      <Dropdown
        value={options.value ? options.value.toString() : '' }
        options={merchants}
        onChange={(e) => options.editorCallback(e.value)}
        optionLabel="name"
        optionValue="id"
        placeholder="Choose Merchant"
        className='dropdown-edit-mode'
      />
    );
  };

  // Metin alanı için düzenleme bileşeni
  const textEditor = (options) => {
    return <InputText type="text" className='editor-input' value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
  };

  // CSV Export
  const exportCSV = () => {
    dt.current.exportCSV();
  };

  // Excel Export
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(terminals);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Terminal List');
    XLSX.writeFile(workbook, 'terminallist.xlsx');
  };

  // PDF Export
  const exportPdf = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Terminal ID', 'Terminal Name', 'Region ID', 'Merchant Name', 'Serial Number', 'Latitude', 'Longitude', 'Create Date']],
      body: terminals.map((terminal) => [terminal.id, terminal.terminal_name, terminal.region_id, terminal.org_merchant_name, terminal.serial_number, terminal.lat, terminal.lon, terminal.created_at]),
    });
    doc.save('terminallist.pdf');
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

  const header = (
    <div className="flex justify-content-between align-items-center">
      <h5 className="m-0">Terminal</h5>
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
        <Button icon="pi pi-plus" label="Add New" onClick={() => setAddNewVisible(true)} severity="secondary" text className='light-text' />
        <Button icon="pi pi-cog" tooltip="Default Terminal Configs" tooltipOptions={{ position: "top" }} onClick={() => navigate('/configs')} severity="secondary" text className='light-text' />
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

  const accept = async () => {
    try {
      const response = await ApiService.delete('/api/0/v1/ev/terminal/delete', {
        data: {
          id: selectedRow.id
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const updatedTerminalList = terminals.filter((item) => item.id !== selectedRow.id);
      setTerminals(updatedTerminalList);
      setSelectedRow(null);
      toast.current.show({
        severity: 'success',
        summary: t('Success'),
        detail: t('Terminal deleted!'),
        life: 2000,
      });
    } catch (error) {
      console.log("error", error);
      toast.current.show({
        severity: 'error',
        summary: t('Error'),
        detail: t('An error occurred!'),
        life: 2000,
      });
    }
  }

  const showConfigs = (id) => {
    setSelectedTerminalId(id);
    setShowConfigDialog(true);
  };

  const showTransactions = (id) => {
    navigate(`/transactions?terminal_id=${id}`);
  };

  const showLogs = (id) => {
    navigate(`/logs?terminal_id=${id}`);
  };

  const buttonColumnTemplate = (rowData) => {
    return (
      <div className="justify-center">
        <Button className='grid-icon-button' icon="pi pi-cog" onClick={() => showConfigs(rowData.id)} rounded text severity="secondary" aria-label="Configs" tooltip="Terminal Configs" tooltipOptions={{ position: "top" }} />
        <Button className='grid-icon-button' icon="pi pi-credit-card" onClick={() => showTransactions(rowData.id)} rounded text severity="secondary" aria-label="Transactions" tooltip="Show Transactions" tooltipOptions={{ position: "top" }} />
        <Button className='grid-icon-button' icon="pi pi-wave-pulse" onClick={() => showLogs(rowData.id)} rounded text severity="secondary" aria-label="Logs" tooltip="Show Logs" tooltipOptions={{ position: "top" }} />
      </div>
    );
  };

  const padValue = (rowData, column) => {
    const value = rowData[column.field];
    return String(value).padStart(8, '0'); // değeri 8 karaktere tamamlamak için başına 0 ekler
};

  return (
    <div className="datatable-doc-demo">
      <Toast ref={toast} />
      <DataTable scrollable ref={dt} value={terminals.map(item => ({
        ...item,
        created_at: new Date(item.created_at)
      }))} paginatorTemplate={myPaginatorTemplate} paginator stripedRows showGridlines rows={20} rowsPerPageOptions={[20, 50, 100, 500, 1000]} loading={loading} dataKey="id"
        filters={filters} globalFilterFields={['id', 'terminal_name', 'ev_device_id']} header={header}
        emptyMessage="No terminal found." onFilter={(e) => setFilters(e.filters)} autolayout="true"
        editMode="row" onRowEditComplete={onRowEditComplete} selection={selectedRow} onSelectionChange={(e) => setSelectedRow(e.value)}>
        <Column selectionMode="single" style={{ width: '5%', textAlign: 'center' }}></Column>
        <Column rowEditor={allowEdit} bodyStyle={{ textAlign: 'center' }} style={{ width: '10%' }}></Column>
        <Column field="id" header="Terminal ID" body={padValue} filter filterPlaceholder="Search by terminal id" />
        <Column field="terminal_name" editor={(options) => textEditor(options)} header="Terminal Name" filter filterPlaceholder="Search by terminal name" />
        <Column field="region_id" header="Region ID" style={{ display: 'none' }} />
        <Column field="region_id" editor={regionEditor} body={regionBodyTemplate} header="Region Name" filter filterPlaceholder="Search by region name" />
        <Column field="org_merchant_id" header="Merchant ID" style={{ display: 'none' }} />
        <Column field="org_merchant_id" editor={merchantEditor} body={merchantBodyTemplate} header="Merchant Name" filter filterPlaceholder="Search by merchant name" />
        <Column field="serial_number" editor={(options) => textEditor(options)} header="Serial Number" filter filterPlaceholder="Search by serial number" />
        <Column field="lat" editor={(options) => textEditor(options)} header="Latitude" filter filterPlaceholder="Search by latitude" />
        <Column field="lon" editor={(options) => textEditor(options)} header="Longitude" filter filterPlaceholder="Search by longitude" />
        <Column
          field="created_at"
          header="Created At"
          dataType="date"
          filterField="created_at"
          filter filterElement={dateFilterTemplate}
          sortable
          body={(rowData) => moment(rowData.created_at).format('DD.MM.YYYY')}
        />
        <Column body={buttonColumnTemplate} />
      </DataTable>
      <ConfirmDialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        message="Are you sure you want to delete this item?"
        header="Confirmation"
        icon="pi pi-exclamation-triangle"
        acceptLabel="Yes"
        rejectLabel="No"
        acceptClassName="p-button-danger"
        accept={accept}
        reject={() => setDialogVisible(false)}
      />
      <Dialog
        header="Add New Terminal"
        visible={addNewVisible}
        style={{ width: "50vw" }}
        onHide={() => setAddNewVisible(false)}
        footer={footerContent}
      >
        <div className="row p-fluid">
          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
            <label htmlFor="terminal-name">Terminal Name</label>
            <InputText id="terminal-name" name="terminal_name" value={formData.terminal_name} onChange={handleChange} />
          </div>

          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
            <label htmlFor="region-id">Region ID</label>
            <Dropdown value={formData.region_id} name="region_id" onChange={handleChange} options={regions}
              optionLabel="name" optionValue="id" placeholder="Select a region" className="w-full" />
          </div>

          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
            <label htmlFor="merchant-id">Merchant</label>
            <Dropdown value={formData.org_merchant_id} name="org_merchant_id" onChange={handleChange} options={merchants}
              optionLabel="name" optionValue="id" placeholder="Select a merchant" className="w-full" />
          </div>

          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
            <label htmlFor="serial-number">Serial Number</label>
            <InputText id="serial-number" name="serial_number" value={formData.serial_number} onChange={handleChange} />
          </div>

          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
            <label htmlFor="lat">Latitude</label>
            <InputText id="lat" name="lat" value={formData.lat} onChange={handleChange} />
          </div>

          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
            <label htmlFor="longitude">Longitue</label>
            <InputText id="longitude" name="lon" value={formData.lon} onChange={handleChange} />
          </div>
        </div>
      </Dialog>
      <ConfigDialog title={"Edit Terminal Config"} terminalId={selectedTerminalId} visible={showConfigDialog} setVisible={setShowConfigDialog}></ConfigDialog>
    </div>
  );
};

export default TerminalList;