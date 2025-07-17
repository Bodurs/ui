import React, { useState, useEffect, useRef } from 'react';
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
import ApiService from '../../services/ApiService';
import Cookies from 'js-cookie';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useTranslation } from 'react-i18next';

const StopAreas = () => {
  const { t, i18n } = useTranslation();
  const toast = useRef(null);
  const exportMenu = useRef(null);
  const [stopAreas, setStopAreas] = useState([]);
  const [areas, setAreas] = useState([]);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allowEdit, setAllowEdit] = useState(true);
  const dt = useRef(null);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    area_id: { value: null, matchMode: FilterMatchMode.EQUALS },
    stop_id: { value: null, matchMode: FilterMatchMode.EQUALS }
  });
  const exportButtons = [
    { label: t('Csv Export'), icon: 'pi pi-fw pi-file', command: () => { exportCSV(false) } },
    { label: t('Excel Export'), icon: 'pi pi-fw pi-file-excel', command: () => { exportExcel() } },
    { label: t('Pdf Export'), icon: 'pi pi-fw pi-file-pdf', command: () => { exportPdf() } }
  ];
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [addNewVisible, setAddNewVisible] = useState(false);
  const [formData, setFormData] = useState({
    area_id: "",
    stop_id: "",
    feed_id: Cookies.get('feed_id')
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const response = await ApiService.post('/api/0/v1/gtfs/stopareas/save', formData);
      if (response?.result?.code == "0") {
        setAddNewVisible(false);
        getStopAreas();
        toast.current.show({
          severity: 'success',
          summary: t('Success'),
          detail: t('New stop area added!'),
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
    getStopAreas();
    getAreas();
    getStops();
  }, []);

  async function getStopAreas() {
    setLoading(true);
    try {
      const url = `/api/0/v1/gtfs/stopareas/get?feed_id=${Cookies.get('feed_id')}`;
      const response = await ApiService.get(url);
      setStopAreas(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('GET request error:', error);
      setLoading(false);
      throw error;
    }
  }

  async function getAreas() {
    setLoading(true);
    try {
      const url = `/api/0/v1/gtfs/areas/get?feed_id=${Cookies.get('feed_id')}`;
      const response = await ApiService.get(url);
      setAreas(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('GET request error:', error);
      setLoading(false);
      throw error;
    }
  }

  async function getStops() {
    setLoading(true);
    try {
      const url = `/api/0/v1/gtfs/stops/get?feed_id=${Cookies.get('feed_id')}`;
      const response = await ApiService.get(url);
      setStops(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('GET request error:', error);
      setLoading(false);
      throw error;
    }
  }

  const clearFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      area_id: { value: null, matchMode: FilterMatchMode.EQUALS },
      stop_id: { value: null, matchMode: FilterMatchMode.EQUALS }
    });
  };

  const onRowEditComplete = async (e) => {
    let { newData, index } = e;
    try {
      const response = await ApiService.post('/api/0/v1/gtfs/stopareas/save', {
        id: newData.id,
        area_id: newData.area_id,
        stop_id: newData.stop_id
      });
      const updatedStopAreas = [...stopAreas];
      updatedStopAreas[index] = {
        ...updatedStopAreas[index],
        area_id: newData.area_id,
        stop_id: newData.stop_id
      };
      setStopAreas(updatedStopAreas);
      toast.current.show({
        severity: 'success',
        summary: t('Success'),
        detail: t('Stop area informations edited!'),
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
    const worksheet = XLSX.utils.json_to_sheet(stopAreas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('Stop Areas'));
    XLSX.writeFile(workbook, 'stopareas.xlsx');
  };

  // PDF Export
  const exportPdf = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Area ID', 'Stop ID']],
      body: stopAreas.map((area) => [area.area_id, area.stop_id]),
    });
    doc.save('stopareas.pdf');
  };

  const header = (
    <div className="flex justify-content-between align-items-center">
      <h5 className="m-0">{t('Stop Areas')}</h5>
      <div className="flex align-items-center">
        {selectedRow && <Button
          type="button"
          icon="pi pi-trash"
          className="p-button-danger mr-2"
          label={t('Delete')}
          onClick={() => setDialogVisible(true)}
          size="small"
        />}
        <Menu model={exportButtons} popup ref={exportMenu} id="popup_menu_left" />
        <Button icon="pi pi-plus" label={t('Add New')} onClick={() => setAddNewVisible(true)} severity="secondary" text className='light-text' />
        <Button icon="pi pi-download" tooltip={t('Export')} tooltipOptions={{ position: "top" }} onClick={(event) => exportMenu.current.toggle(event)} rounded text severity="secondary" aria-label={t('Export')} />
        <Button icon="pi pi-sort-alt-slash" tooltip={t('Clear Filters')} tooltipOptions={{ position: "top" }} onClick={clearFilters} rounded text severity="danger" aria-label={t('Clear Filters')} className='right-10' />
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search"> </InputIcon>
          <InputText
            placeholder={t('Global Search')}
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
      const response = await ApiService.delete('/api/0/v1/gtfs/stopareas/delete', {
        data: {
          id: selectedRow.id
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const updatedStopAreas = stopAreas.filter((item) => item.id !== selectedRow.id);
      setStopAreas(updatedStopAreas);
      setSelectedRow(null);
      toast.current.show({
        severity: 'success',
        summary: t('Success'),
        detail: t('Stop area deleted!'),
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


  const areaBodyTemplate = (rowData) => {
    const currentAreaObj = areas.find((r) => r.area_id === rowData.area_id);
    return currentAreaObj ? currentAreaObj.area_name : null;
  };


  const areaEditor = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={areas}
        onChange={(e) => options.editorCallback(e.value)}
        optionLabel="area_name"
        optionValue="area_id"
        placeholder={t('Choose Area')}
        className='dropdown-edit-mode'
      />
    );
  };

  const stopBodyTemplate = (rowData) => {
    const currentStopObj = stops.find((r) => r.stop_id === rowData.stop_id);
    return currentStopObj ? currentStopObj.stop_name : null;
  };


  const stopEditor = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={stops}
        onChange={(e) => options.editorCallback(e.value)}
        optionLabel="stop_name"
        optionValue="stop_id"
        placeholder={t('Choose Stop')}
        className='dropdown-edit-mode'
      />
    );
  };

  return (
    <div className="datatable-doc-demo">
      <Toast ref={toast} />
      {stopAreas.length > 0 ? (
        <DataTable scrollable ref={dt} value={stopAreas.map(item => ({
          ...item,
          created_at: new Date(item.created_at)
        }))} virtualScrollerOptions={{ itemSize: 39 }} stripedRows showGridlines loading={loading} dataKey="id"
          filters={filters} globalFilterFields={['network_id', 'network_name']} header={header}
          emptyMessage={t('No stop area found.')} onFilter={(e) => setFilters(e.filters)}
          editMode="row" onRowEditComplete={onRowEditComplete} selection={selectedRow} onSelectionChange={(e) => setSelectedRow(e.value)}>
          <Column selectionMode="single" style={{ width: '5%', textAlign: 'center' }}></Column>
          <Column rowEditor={allowEdit} bodyStyle={{ textAlign: 'center' }} style={{ minWidth: '20px' }}></Column>
          <Column field="id" header="ID" filter filterPlaceholder={t('Search by ID')} style={{ display: 'none' }} />
          <Column field="area_id" header={t('Area')} editor={areaEditor} body={areaBodyTemplate} filter filterPlaceholder={t('Search by network id')} style={{ minWidth: '30px' }} />
          <Column field="stop_id" header={t('Stop')} editor={stopEditor} body={stopBodyTemplate} filter filterPlaceholder={t('Search by route id')} style={{ minWidth: '300px' }} />
        </DataTable>
      ) : (
        <DataTable
          header={header}
          value={[]}
          emptyMessage={
            <div style={{ padding: '1rem 0', textAlign: 'center' }}>
              {t('No stop area found.')}
            </div>
          }
          style={{ minHeight: '150px' }}
        />
      )}
      <ConfirmDialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        message={t('Are you sure you want to delete this item?')}
        header={t('Confirmation')}
        icon="pi pi-exclamation-triangle"
        acceptLabel={t('Yes')}
        rejectLabel={t('No')}
        acceptClassName="p-button-danger"
        accept={accept}
        reject={() => setDialogVisible(false)}
      />
      <Dialog
        header={t('Add New Stop Area')}
        visible={addNewVisible}
        style={{ width: "50vw" }}
        onHide={() => setAddNewVisible(false)}
        footer={footerContent}
      >
        <div className="row p-fluid">
          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
            <label htmlFor="area-id">{t('Area')}</label>
            <Dropdown
              id="area-id"
              name="area_id"
              value={formData.area_id}
              options={areas}
              optionLabel="area_name"
              optionValue="area_id"
              onChange={handleChange}
              placeholder={t('Choose Area')}
            />
          </div>

          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
            <label htmlFor="stop-id">{t('Stop')}</label>
            <Dropdown
              id="stop-id"
              name="stop_id"
              value={formData.stop_id}
              options={stops}
              optionLabel="stop_name"
              optionValue="stop_id"
              onChange={handleChange}
              placeholder={t('Choose Stop')}
            />
          </div>

        </div>
      </Dialog>
    </div>
  );
};

export default StopAreas;