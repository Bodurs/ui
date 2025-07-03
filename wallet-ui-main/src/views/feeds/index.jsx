import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Sidebar } from 'primereact/sidebar';
import { Dialog } from "primereact/dialog";
import { Menu } from 'primereact/menu';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Badge } from 'primereact/badge'
import ApiService from './../../services/ApiService';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';


const Feeds = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toast = useRef(null);
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFeedId, setSelectedFeedId] = useState(null);
  const [metaKey, setMetaKey] = useState(true);
  const [visible, setVisible] = useState(false);
  const dt = useRef(null);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { value: null, matchMode: FilterMatchMode.EQUALS },
    name: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [dialogVisible, setDialogVisible] = useState(false);
  const [exportZipDialogVisible, setExportZipDialogVisible] = useState(false);
  const [exportSqlDialogVisible, setExportSqlDialogVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [addNewVisible, setAddNewVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: ""
  });
  const fileUploadRef = useRef(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileContent, setFileContent] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const footerContent = (
    fileUploaded ? <div>
      <Button label={t('Close')} icon="pi pi-times" onClick={() => setAddNewVisible(false)} className="p-button-text" />
    </div> : ''
  );

  useEffect(() => {
    getFeeds();
  }, []);

  async function getFeeds() {
    setLoading(true);
    try {
      const response = await ApiService.get('/api/0/v1/gtfs/feeds/get');
      setFeeds(response.data.data);
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
      id: { value: null, matchMode: FilterMatchMode.EQUALS },
      name: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    toast.current.show({
      severity: 'success',
      summary: t('Success'),
      detail: t('Data table filters cleared!'),
      life: 2000,
    });
  };

  const header = (
    <div className="flex justify-content-between align-items-center">
      <h5 className="m-0">{t('Feeds')}</h5>
      <div className="flex align-items-center">
        {selectedRow && <Button
          type="button"
          icon="pi pi-trash"
          className="p-button-danger mr-2"
          label={t('Delete')}
          onClick={() => setDialogVisible(true)}
          size="small"
        />}
        
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

  const handleRowDoubleClick = (event) => {
    const clickedRow = event.data;
    navigate(`/feed/${clickedRow.id}`);
  };

  const textEditor = (options) => {
    return <InputText type="text" className='editor-input' value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
  };

  const onRowEditComplete = async (e) => {
    let { newData, index } = e;
    try {
      const response = await ApiService.post('/api/0/v1/gtfs/feed/save', {
        name: newData.name,
        id: newData.id
      });
      const updateFeeds = [...feeds];
      updateFeeds[index] = {
        ...updateFeeds[index],
        name: newData.name
      };
      setFeeds(updateFeeds);
      toast.current.show({
        severity: 'success',
        summary: t('Success'),
        detail: t('Feed informations edited!'),
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

  const exportFeed = async (type) => {
    try {
      exportFile(type);
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

  const accept = async () => {
    try {

      const response = await ApiService.delete('/api/0/v1/gtfs/feeds/delete', {
        data: {
          id: selectedRow.id
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const updatedFeedList = feeds.filter((item) => item.id !== selectedRow.id);
      setFeeds(updatedFeedList);
      setSelectedRow(null);
      if (selectedRow.id == Cookies.get('feed_id')) {
        Cookies.remove('feed_id', { path: '/' });
        window.location.reload();
      }
      toast.current.show({
        severity: 'success',
        summary: t('Success'),
        detail: t('Feed informations deleted!'),
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

  const handleSubmit = async () => {
    try {
      const response = await ApiService.post('/api/0/v1/gtfs/feedinfo/save', formData);
      if (response?.result?.code == "0") {
        setAddNewVisible(false);
        toast.current.show({
          severity: 'success',
          summary: t('Success'),
          detail: t('New feed added!'),
          life: 2000,
        });
        closeSidebar();
        location.reload();
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

  const onCustomUpload = async (event) => {
    setUploading(true);
    const file = event.files[0];

    const isZipByMime = file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.type === 'application/octet-stream';
    const isZipByExtension = file.name.toLowerCase().endsWith('.zip');

    if (!isZipByMime && !isZipByExtension) {
      alert(t('Please upload ZIP file only.'));
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('zipFile', file);

    try {
      const response = await ApiService.upload('/api/0/v1/gtfs/feeds/save', formData);
      if(!response || response.success == true) {
        toast.current.show({
          severity: 'success',
          summary: t('Success'),
          detail: t('New feed uploaded!'),
          life: 2000,
        });
        setFileUploaded(true);
        setFileContent(response.insertResults);
        setAddNewVisible(false);
        getFeeds();
        setUploading(false);
        window.location.reload();
      } 
      
    } catch (error) {
      console.error('Yükleme hatası:', error);
      setUploading(false);
      toast.current.show({
        severity: 'error',
        summary: t('Error'),
        detail: t('Feeds limit exceeded!'),
        life: 2000,
      });
    }
    if(fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
  };

  const openSidebar = async (feedData = null) => {
    if (feedData) {
      setFormData({
        id: feedData.info_id,
        feed_publisher_name: feedData.feed_publisher_name,
        feed_publisher_url: feedData.feed_publisher_url,
        feed_lang: feedData.feed_lang,
        feed_start_date: feedData.feed_start_date,
        feed_end_date: feedData.feed_end_date,
        feed_version: feedData.feed_version,
        feed_contact_email: feedData.feed_contact_email,
        feed_contact_url: feedData.feed_contact_url,
        feed_id: feedData.id
      });
    } else {
      setFormData({
        feed_publisher_name: "",
        feed_publisher_url: "",
        feed_lang: "",
        feed_start_date: "",
        feed_end_date: "",
        feed_version: "",
        feed_contact_email: "",
        feed_contact_url: "",
        feed_id: Cookies.get('feed_id')
      });
    }

    setVisible(true);
  }

  const closeSidebar = async () => {
    setVisible(false);
    setFormData({
      feed_publisher_name: "",
      feed_publisher_url: "",
      feed_lang: "",
      feed_start_date: "",
      feed_end_date: "",
      feed_version: "",
      feed_contact_email: "",
      feed_contact_url: "",
      feed_id: Cookies.get('feed_id')
    });
  }

  const buttonColumnTemplate = (rowData) => {
    return (
      <div className="justify-center">
        <Button className='grid-icon-button' icon="pi pi-pencil" onClick={() => openSidebar(rowData)} rounded text severity="secondary" aria-label={t('Details')} tooltip={t('Show Details')} tooltipOptions={{ position: "top" }} />
      </div>
    );
  };

  const exportFile = (type) => {
      if(type == "zip") {
        let baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3002' : '';
        const url = `${baseUrl}/api/0/v1/gtfs/export/zip?feed_id=${selectedFeedId}`;
        window.open(url, '_blank');
      } else {
        let baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3002' : '';
        const url = `${baseUrl}/api/0/v1/gtfs/export/db?feed_id=${selectedFeedId}`;
        window.open(url, '_blank');
      }
      
    };

  const buttonExportTemplate = (rowData) => {
    return (
      <div className="justify-center">
        <Button className='grid-icon-button' icon="pi pi-exclamation-triangle" rounded text severity="secondary" aria-label="Export Zip" tooltip={t('Show Warnings')} tooltipOptions={{ position: "top" }} />
        <Button className='grid-icon-button' icon="pi pi-folder" onClick={() => {setExportZipDialogVisible(true); setSelectedFeedId(rowData.id)}} rounded text severity="secondary" aria-label="Export Zip" tooltip={t('Export Zip')} tooltipOptions={{ position: "top" }} />
        <Button className='grid-icon-button' icon="pi pi-database" onClick={() => {setExportSqlDialogVisible(true); setSelectedFeedId(rowData.id)}} rounded text severity="secondary" aria-label="Export SQL" tooltip={t('Export Sql')} tooltipOptions={{ position: "top" }} />
      </div>
    );
  };

  return (
    <div className="datatable-doc-demo">
      <Toast ref={toast} />
      {feeds.length > 0 ? (
        <DataTable scrollable stripedRows ref={dt} value={feeds.map(item => ({
          ...item,
          created_at: new Date(item.created_at)
        }))} showGridlines loading={loading} dataKey="id" virtualScrollerOptions={{ itemSize: 39 }}
          filters={filters} globalFilterFields={['id', 'name', 'created_at', 'updated_at']} header={header} autolayout="true"
          emptyMessage={t('No feed found.')} onFilter={(e) => setFilters(e.filters)}
          selectionMode="multiple"
          selection={selectedRow} onSelectionChange={(e) => setSelectedRow(e.value)}
          metaKeySelection={metaKey}
          dragSelection
          editMode="row" onRowEditComplete={onRowEditComplete}>
          <Column selectionMode="single" style={{ width: '5%', textAlign: 'center' }}></Column>
          <Column body={buttonColumnTemplate} style={{ width: '5%' }} />
          <Column field="id" header="ID" filter filterPlaceholder={t('Search by ID')} />
          <Column field="name" header={t('Name')} sortable editor={(options) => textEditor(options)} filter filterPlaceholder="Search by name" />
          <Column field="feed_version" header={t('Feed Version')} />
          <Column field="feed_publisher_name" header={t('Publisher Name')} />
          <Column
            field="created_at"
            header={t('Created At')}
            dataType="date"
            sortable
            body={(rowData) => moment(rowData.created_at).format('DD.MM.YYYY')}
          />
          <Column body={buttonExportTemplate} header={t('Export')}/>
          {/*<Column
                    field="updated_at"
                    header={t('Updated At')}
                    dataType="date"
                    sortable
                    body={(rowData) => moment(rowData.updated_at).format('DD.MM.YYYY')}
                />*/}
        </DataTable>
      ) : (
        <DataTable
          header={header}
          value={[]}
          emptyMessage={
            <div style={{ padding: '1rem 0', textAlign: 'center' }}>
              {t('No feed found.')}
            </div>
          }
          style={{ minHeight: '150px' }}
        />
      )}
      

      <ConfirmDialog
        visible={exportZipDialogVisible}
        onHide={() => setExportZipDialogVisible(false)}
        message={t('A new version will be created for the GTFS file and the export process will be started. Do you approve?')}
        header={t('Confirmation')}
        icon="pi pi-exclamation-triangle"
        acceptLabel={t('Yes')}
        rejectLabel={t('No')}
        acceptClassName="p-button-danger"
        accept={() => exportFeed("zip")}
        reject={() => setExportZipDialogVisible(false)}
      />
      
      <ConfirmDialog
        visible={exportSqlDialogVisible}
        onHide={() => setExportSqlDialogVisible(false)}
        message={t('A new version will be created for the GTFS file and the export process will be started. Do you approve?')}
        header={t('Confirmation')}
        icon="pi pi-exclamation-triangle"
        acceptLabel={t('Yes')}
        rejectLabel={t('No')}
        acceptClassName="p-button-danger"
        accept={() => exportFeed("sql")}
        reject={() => setExportSqlDialogVisible(false)}
      />

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
        header={t('Add New Feed')}
        visible={addNewVisible}
        style={{ width: "50vw" }}
        onHide={() => setAddNewVisible(false)}
        footer={footerContent}
      >
        <div className="row p-fluid">
          <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 p-field add-form-input">
            {uploading ? t('Uploading...') : <FileUpload
              ref={fileUploadRef}
              name="zipFile"
              accept=".zip"
              customUpload
              uploadHandler={onCustomUpload}
              multiple={false}
              emptyTemplate={<p className="m-0">{t('Drag and drop or select a zip file.')}<br />{t('You need to throw the entire GTFS TXT files into the zip.')}</p>}
              chooseLabel={t('Choose File')}
              uploadLabel={t('Upload')}
              cancelLabel={t('Cancel')}
            />}
          </div>

        </div>
      </Dialog>
      <Sidebar
        visible={visible}
        position="right"
        onHide={() => closeSidebar()}
        style={{ width: '50vw', padding: 0 }}
        showCloseIcon
        header={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              label={t('Save')}
              icon="pi pi-check"
              onClick={handleSubmit}
              className="p-button-success p-button-sm"
            />
            <span></span>
          </div>
        }
      >
        {visible && (
          <div >
            <div style={{ flex: 1, padding: '1rem' }}>
              <div className="row p-fluid">
                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="feed-publisher-name">{t('Feed Publisher Name')}</label>
                  <InputText id="feed-publisher-name" name="feed_publisher_name" value={formData.feed_publisher_name} onChange={handleChange} />
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="feed-publisher-url">{t('Feed Publisher URL')}</label>
                  <InputText id="feed-publisher-url" name="feed_publisher_url" value={formData.feed_publisher_url} onChange={handleChange} />
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="feed-lang">{t('Feed Lang')}</label>
                  <InputText id="feed-lang" name="feed_lang" value={formData.feed_lang} onChange={handleChange} />
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="feed-start-date">{t('Feed Start Date')}</label>
                  <InputText id="feed-start-date" name="feed_start_date" value={formData.feed_start_date} onChange={handleChange} />
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="feed-end-date">{t('Feed End Date')}</label>
                  <InputText id="feed-end-date" name="feed_end_date" value={formData.feed_end_date} onChange={handleChange} />
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="feed-version">{t('Feed Version')}</label>
                  <InputText id="feed-version" name="feed_version" value={formData.feed_version} disabled />
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="feed-contact-email">{t('Feed Contact Email')}</label>
                  <InputText id="feed-contact-email" name="feed_contact_email" value={formData.feed_contact_email} onChange={handleChange} />
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="feed-contact-url">{t('Feed Contact URL')}</label>
                  <InputText id="feed-contact-url" name="feed_contact_url" value={formData.feed_contact_url} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>
        )}
      </Sidebar>
    </div>
  );
};

export default Feeds;