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

const Timeframes = () => {
  const { t, i18n } = useTranslation();
  const toast = useRef(null);
  const exportMenu = useRef(null);
  const [timeframes, setTimeframes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allowEdit, setAllowEdit] = useState(true);
  const dt = useRef(null);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    timeframe_group_id: { value: null, matchMode: FilterMatchMode.EQUALS },
    service_id: { value: null, matchMode: FilterMatchMode.EQUALS }
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
    timeframe_group_id: "",
    start_time: "",
    end_time: "",
    service_id: "",
    feed_id: Cookies.get('feed_id')
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const response = await ApiService.post('/api/0/v1/gtfs/timeframes/save', formData);
      if (response?.result?.code == "0") {
        setAddNewVisible(false);
        getTimeframes();
        toast.current.show({
          severity: 'success',
          summary: t('Success'),
          detail: t('New timeframe added!'),
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
    getTimeframes();
  }, []);

  async function getTimeframes() {
    setLoading(true);
    try {
      const url = `/api/0/v1/gtfs/timeframes/get?feed_id=${Cookies.get('feed_id')}`;
      const response = await ApiService.get(url);
      setTimeframes(response.data.data);
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
      timeframe_group_id: { value: null, matchMode: FilterMatchMode.EQUALS },
      start_time: { value: null, matchMode: FilterMatchMode.EQUALS },
      end_time: { value: null, matchMode: FilterMatchMode.EQUALS },
      service_id: { value: null, matchMode: FilterMatchMode.EQUALS }
    });
  };

  const onRowEditComplete = async (e) => {
    let { newData, index } = e;
    try {
      const response = await ApiService.post('/api/0/v1/gtfs/timeframes/save', {
        id: newData.id,
        timeframe_group_id: newData.timeframe_group_id,
        start_time: newData.start_time,
        end_time: newData.end_time,
        service_id: newData.service_id
      });
      const updatedTimeframes = [...timeframes];
      updatedTimeframes[index] = {
        ...updatedTimeframes[index],
        timeframe_group_id: newData.timeframe_group_id,
        start_time: newData.start_time,
        end_time: newData.end_time,
        service_id: newData.service_id
      };
      setTimeframes(updatedTimeframes);
      toast.current.show({
        severity: 'success',
        summary: t('Success'),
        detail: t('Timeframe informations edited!'),
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
    const worksheet = XLSX.utils.json_to_sheet(timeframes);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('Timeframes'));
    XLSX.writeFile(workbook, 'timeframes.xlsx');
  };

  // PDF Export
  const exportPdf = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Timeframe Group ID', 'Start Time', 'End Time', 'Service ID']],
      body: timeframes.map((frame) => [frame.timeframe_group_id, frame.start_time, frame.end_time, frame.service_id]),
    });
    doc.save('timeframes.pdf');
  };

  const header = (
    <div className="flex justify-content-between align-items-center">
      <h5 className="m-0">{t('Timeframes')}</h5>
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
      const response = await ApiService.delete('/api/0/v1/gtfs/timeframes/delete', {
        data: {
          id: selectedRow.id
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const updatedTimeframes = timeframes.filter((item) => item.id !== selectedRow.id);
      setTimeframes(updatedTimeframes);
      setSelectedRow(null);
      toast.current.show({
        severity: 'success',
        summary: t('Success'),
        detail: t('Timeframe deleted!'),
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

  return (
    <div className="datatable-doc-demo">
      <Toast ref={toast} />
      {timeframes.length > 0 ? (
        <DataTable scrollable ref={dt} value={timeframes.map(item => ({
          ...item,
          created_at: new Date(item.created_at)
        }))} virtualScrollerOptions={{ itemSize: 39 }} stripedRows showGridlines loading={loading} dataKey="id"
          filters={filters} globalFilterFields={['timeframe_group_id', 'service_id']} header={header}
          emptyMessage={t('No timeframe found.')} onFilter={(e) => setFilters(e.filters)}
          editMode="row" onRowEditComplete={onRowEditComplete} selection={selectedRow} onSelectionChange={(e) => setSelectedRow(e.value)}>
          <Column selectionMode="single" style={{ width: '5%', textAlign: 'center' }}></Column>
          <Column rowEditor={allowEdit} bodyStyle={{ textAlign: 'center' }} style={{ minWidth: '20px' }}></Column>
          <Column field="id" header="ID" filter filterPlaceholder={t('Search by ID')} style={{ display: 'none' }} />
          <Column field="timeframe_group_id" header={t('Timeframe Group')} editor={(options) => textEditor(options)} filter filterPlaceholder={t('Search by timeframe group id')} style={{ minWidth: '30px' }} />
          <Column field="start_time" header={t('Start Time')} editor={(options) => textEditor(options)} style={{ minWidth: '300px' }} />
          <Column field="end_time" header={t('End Time')} editor={(options) => textEditor(options)} style={{ minWidth: '300px' }} />
          <Column field="service_id" header={t('Service ID')} editor={(options) => textEditor(options)} filter filterPlaceholder={t('Search by service id')} style={{ minWidth: '300px' }} />
        </DataTable>
      ) : (
        <DataTable
          header={header}
          value={[]}
          emptyMessage={
            <div style={{ padding: '1rem 0', textAlign: 'center' }}>
              {t('No timeframe found.')}
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
        header={t('Add New Timeframe')}
        visible={addNewVisible}
        style={{ width: "50vw" }}
        onHide={() => setAddNewVisible(false)}
        footer={footerContent}
      >
        <div className="row p-fluid">
          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
            <label htmlFor="timeframe-group-id">{t('Timeframe Group')}</label>
            <InputText id="timeframe-group-id" name="timeframe_group_id" value={formData.timeframe_group_id} onChange={handleChange} />
          </div>

          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
            <label htmlFor="start-time">{t('Start Time')}</label>
            <InputText id="start-time" name="start_time" value={formData.start_time} onChange={handleChange} />
          </div>

          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
            <label htmlFor="end-time">{t('End Time')}</label>
            <InputText id="end-time" name="end_time" value={formData.end_time} onChange={handleChange} />
          </div>

          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
            <label htmlFor="service-id">{t('Service ID')}</label>
            <InputText id="service-id" name="service_id" value={formData.service_id} onChange={handleChange} />
          </div>

        </div>
      </Dialog>
    </div>
  );
};

export default Timeframes;