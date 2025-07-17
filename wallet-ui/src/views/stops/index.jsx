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
import { ColorPicker } from 'primereact/colorpicker';
import { Sidebar } from 'primereact/sidebar';
import ApiService from '../../services/ApiService';
//import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
//import 'primeflex/primeflex.css';
import { Map, Marker, Popup } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import Cookies from 'js-cookie';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import options from '../../constants/options.json';
import { useTranslation } from 'react-i18next';

const Stops = () => {
  const { t, i18n } = useTranslation();
  const toast = useRef(null);
  const exportMenu = useRef(null);
  const [stops, setStops] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allowEdit, setAllowEdit] = useState(true);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState(null)
  const [showMap, setShowMap] = useState(false);
  const [popupInfo, setPopupInfo] = useState(null);
  const dt = useRef(null);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    stop_id: { value: null, matchMode: FilterMatchMode.EQUALS },
    stop_code: { value: null, matchMode: FilterMatchMode.EQUALS },
    stop_name: { value: null, matchMode: FilterMatchMode.EQUALS },
    stop_desc: { value: null, matchMode: FilterMatchMode.EQUALS }
  });
  const exportButtons = [
    { label: t('Csv Export'), icon: 'pi pi-fw pi-file', command: () => { exportCSV(false) } },
    { label: t('Excel Export'), icon: 'pi pi-fw pi-file-excel', command: () => { exportExcel() } },
    { label: t('Pdf Export'), icon: 'pi pi-fw pi-file-pdf', command: () => { exportPdf() } }
  ];
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [addNewVisible, setAddNewVisible] = useState(false);
  const [formErrors, setFormErrors] = useState({
    stop_id: false,
    stop_name: false,
    stop_lat: false,
    stop_lon: false,
    stop_url: false
  });

  const [formData, setFormData] = useState({
    stop_id: "",
    stop_code: "",
    stop_name: "",
    stop_desc: "",
    stop_lat: "",
    stop_lon: "",
    zone_id: null,
    stop_url: "",
    location_type: null,
    parent_station: "",
    stop_timezone: "",
    wheelchair_boarding: null,
    level_id: null,
    platform_code: "",
    feed_id: Cookies.get('feed_id')
  });

  useEffect(() => {
    if (visible) {
      setTimeout(() => setShowMap(true), 100); // 100ms sonra mount
    } else {
      setShowMap(false);
    }
  }, [visible]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValidUrl = (url) => {
    if (!url) return true; // Empty is valid since it's not required
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const validateForm = () => {
    const errors = {
      stop_id: !formData.stop_id.trim(),
      stop_name: !formData.stop_name.trim(),
      stop_lat: !formData.stop_lat || isNaN(Number(formData.stop_lat)),
      stop_lon: !formData.stop_lon || isNaN(Number(formData.stop_lon)),
      stop_url: formData.stop_url ? !isValidUrl(formData.stop_url) : false
    };
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.current.show({
        severity: 'error',
        summary: t('Error'),
        detail: t('Please fill in all required fields correctly'),
        life: 3000,
      });
      return;
    }

    try {
      const response = await ApiService.post('/api/0/v1/gtfs/stops/save', formData);
      if (response?.result?.code == "0") {
        setAddNewVisible(false);
        getStops();
        toast.current.show({
          severity: 'success',
          summary: t('Success'),
          detail: t('New stop added!'),
          life: 2000,
        });
        closeSidebar();
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

  useEffect(() => {
    getStops();
    getAgencies();
  }, []);

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

  async function getAgencies() {
    try {
      const url = `/api/0/v1/gtfs/agencies/get?feed_id=${Cookies.get('feed_id')}`;
      const response = await ApiService.get(url);
      setAgencies(response.data.data);
    } catch (error) {
      console.error('GET request error:', error);
      throw error;
    }
  }

  const clearFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      stop_id: { value: null, matchMode: FilterMatchMode.EQUALS },
      stop_code: { value: null, matchMode: FilterMatchMode.EQUALS },
      stop_name: { value: null, matchMode: FilterMatchMode.EQUALS },
      stop_desc: { value: null, matchMode: FilterMatchMode.EQUALS }
    });
  };

  const onRowEditComplete = async (e) => {
    let { newData, index } = e;
    try {
      const response = await ApiService.post('/api/0/v1/gtfs/stops/save', {
        id: newData.id,
        stop_id: newData.stop_id,
        stop_code: newData.stop_code,
        stop_name: newData.stop_name,
        stop_desc: newData.stop_desc,
        stop_lat: newData.stop_lat,
        stop_lon: newData.stop_lon,
        zone_id: newData.zone_id,
        stop_url: newData.stop_url,
        location_type: newData.location_type,
        parent_station: newData.parent_station,
        stop_timezone: newData.stop_timezone,
        wheelchair_boarding: newData.wheelchair_boarding,
        level_id: newData.level_id,
        platform_code: newData.platform_code,
        feed_id: Cookies.get('feed_id')
      });
      const updatedStops = [...stops];
      updatedStops[index] = {
        ...updatedStops[index],
        stop_id: newData.stop_id,
        stop_code: newData.stop_code,
        stop_name: newData.stop_name,
        stop_desc: newData.stop_desc,
        stop_lat: newData.stop_lat,
        stop_lon: newData.stop_lon,
        zone_id: newData.zone_id,
        stop_url: newData.stop_url,
        location_type: newData.location_type,
        parent_station: newData.parent_station,
        stop_timezone: newData.stop_timezone,
        wheelchair_boarding: newData.wheelchair_boarding,
        level_id: newData.level_id,
        platform_code: newData.platform_code,
      };
      setStops(updatedStops);
      toast.current.show({
        severity: 'success',
        summary: t('Success'),
        detail: t('Stop informations edited!'),
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
    const worksheet = XLSX.utils.json_to_sheet(stops);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('Stops'));
    XLSX.writeFile(workbook, 'stops.xlsx');
  };

  // PDF Export
  const exportPdf = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['stop ID', 'Stop Code', 'Stop Name', 'Stop Desc', 'Stop Lat', 'Stop Lon', 'Zone ID', 'Stop Url', 'Location Type', 'Parent Station', 'Stop Timezone', 'Wheelchair Boarding', 'Level ID', 'Platform Code']],
      body: stops.map((stop) => [stop.stop_id, stop.stop_code, stop.stop_name, stop.stop_desc, stop.stop_lat, stop.stop_lon, stop.zone_id, stop.stop_url, stop.location_type, stop.parent_station, stop.stop_timezone, stop.wheelchair_boarding, stop.level_id, stop.platform_code]),
    });
    doc.save('stops.pdf');
  };

  const header = (
    <div className="flex justify-content-between align-items-center">
      <h5 className="m-0">{t('Stops')}</h5>
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
        <Button icon="pi pi-plus" label={t('Add New')} onClick={() => openSidebar()} severity="secondary" text className='light-text' />
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
      const response = await ApiService.delete('/api/0/v1/gtfs/stops/delete', {
        data: {
          id: selectedRow.id
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const updatedStops = stops.filter((item) => item.id !== selectedRow.id);
      setStops(updatedStops);
      setSelectedRow(null);
      toast.current.show({
        severity: 'success',
        summary: t('Success'),
        detail: t('Stop deleted!'),
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

  const closeSidebar = async () => {
    setVisible(false);
    setFormData({
      stop_id: "",
      stop_code: "",
      stop_name: "",
      stop_desc: "",
      stop_lat: "",
      stop_lon: "",
      zone_id: null,
      stop_url: "",
      location_type: null,
      parent_station: "",
      stop_timezone: "",
      wheelchair_boarding: null,
      level_id: null,
      platform_code: "",
      feed_id: Cookies.get('feed_id')
    });
  }

  const openSidebar = async (stopData = null) => {
    setPopupInfo(null);
    if (stopData) {
      setFormData({
        id: stopData.id,
        stop_id: stopData.stop_id,
        stop_code: stopData.stop_code,
        stop_name: stopData.stop_name,
        stop_desc: stopData.stop_desc,
        stop_lat: stopData.stop_lat,
        stop_lon: stopData.stop_lon,
        zone_id: stopData.zone_id,
        stop_url: stopData.stop_url,
        location_type: stopData.location_type,
        parent_station: stopData.parent_station,
        stop_timezone: stopData.stop_timezone,
        wheelchair_boarding: stopData.wheelchair_boarding,
        level_id: stopData.level_id,
        platform_code: stopData.platform_code,
        feed_id: Cookies.get('feed_id')
      });
    } else {
      setFormData({
        stop_id: "",
        stop_code: "",
        stop_name: "",
        stop_desc: "",
        stop_lat: "",
        stop_lon: "",
        zone_id: null,
        stop_url: "",
        location_type: null,
        parent_station: "",
        stop_timezone: "",
        wheelchair_boarding: null,
        level_id: null,
        platform_code: "",
        feed_id: Cookies.get('feed_id')
      });
    }

    setVisible(true);
  }

  const buttonColumnTemplate = (rowData) => {
    return (
      <div className="justify-center">
        <Button className='grid-icon-button' icon="pi pi-pencil" onClick={() => openSidebar(rowData)} rounded text severity="secondary" aria-label={t('Details')} tooltip={t('Show Details')} tooltipOptions={{ position: "top" }} />
      </div>
    );
  };

  const handleMarkerDragEnd = (e) => {
    const marker = e.target;
    const newPos = marker.getLatLng();
    setFormData(prev => ({
      ...prev,
      stop_lat: newPos.lat,
      stop_lon: newPos.lng
    }));
    console.log("ddd");
  };

  const AddMarkerOnClick = ({ setPosition }) => {
    useMapEvents({
      click(e) {
        setPosition({ lat: e.latlng.lat, lon: e.latlng.lng });
        setFormData(prev => ({
          ...prev,
          stop_lat: e.latlng.lat,
          stop_lon: e.latlng.lng
        }));
      }
    });
    return null;
  };

  const handleDragEnd = (e) => {
    const { lng, lat } = e.target.getLngLat();
    setFormData((prev) => ({
      ...prev,
      stop_lat: lat,
      stop_lon: lng
    }));
  };

  const handleMapClick = (e) => {
    const { lngLat } = e;
    setFormData((prev) => ({
      ...prev,
      stop_lat: lngLat.lat,
      stop_lon: lngLat.lng
    }));
  };

  const locationTypeBodyTemplate = (rowData) => {
    const currentLocationTypeObj = options.locationTypes.find((r) => r.value === rowData.location_type);
    return currentLocationTypeObj ? currentLocationTypeObj.label : null;
  };


  const locationTypeEditor = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={options.locationTypes}
        onChange={(e) => options.editorCallback(e.value)}
        optionLabel="label"
        optionValue="value"
        placeholder={t('Choose Location Type')}
        className='dropdown-edit-mode'
      />
    );
  };

  const timezoneBodyTemplate = (rowData) => {
    const currentTimezoneObj = options.timezones.find((r) => r.value === rowData.stop_timezone);
    return currentTimezoneObj ? currentTimezoneObj.label : null;
  };


  const timezoneEditor = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={options.timezones}
        onChange={(e) => options.editorCallback(e.value)}
        optionLabel="label"
        optionValue="value"
        placeholder={t('Choose Timezone')}
        className='dropdown-edit-mode'
      />
    );
  };

  const wheelchairBoardingBodyTemplate = (rowData) => {
    const currentWheelchairBoardingObj = options.wheelchairBoardings.find((r) => r.value === rowData.wheelchair_boarding);
    return currentWheelchairBoardingObj ? currentWheelchairBoardingObj.label : null;
  };


  const wheelchairBoardingEditor = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={options.wheelchairBoardings}
        onChange={(e) => options.editorCallback(e.value)}
        optionLabel="label"
        optionValue="value"
        placeholder={t('Choose Wheelchair Boarding')}
        className='dropdown-edit-mode'
      />
    );
  };

  return (
    <div className="datatable-doc-demo">
      <Toast ref={toast} />
      {stops.length > 0 ? (
        <DataTable scrollable ref={dt} value={stops.map(item => ({
          ...item,
          created_at: new Date(item.created_at)
        }))} virtualScrollerOptions={{ itemSize: 39 }} stripedRows showGridlines loading={loading} dataKey="id"
          filters={filters} globalFilterFields={['stop_id', 'stop_code', 'stop_name', 'stop_desc']} header={header}
          emptyMessage={t('No stop found.')} onFilter={(e) => setFilters(e.filters)} autolayout="true"
          editMode="row" onRowEditComplete={onRowEditComplete} selection={selectedRow} onSelectionChange={(e) => setSelectedRow(e.value)}>
          <Column selectionMode="single" style={{ width: '5%', textAlign: 'center' }}></Column>
          {/*<Column rowEditor={allowEdit} bodyStyle={{ textAlign: 'center' }}></Column>*/}
          <Column body={buttonColumnTemplate} />
          <Column field="id" header="ID" filter filterPlaceholder="Search by ID" style={{ display: 'none' }} />
          <Column field="stop_id" header={t('Stop ID')} editor={(options) => textEditor(options)} filter filterPlaceholder="Search by stop id" style={{ minWidth: '100px' }} />
          <Column field="stop_code" header={t('Stop Code')} editor={(options) => textEditor(options)} filter filterPlaceholder="Search by stop code" style={{ minWidth: '100px' }} />
          <Column field="stop_name" header={t('Stop Name')} editor={(options) => textEditor(options)} filter filterPlaceholder="Search by stop name" style={{ minWidth: '300px' }} />
          <Column field="stop_desc" header={t('Stop Desc')} editor={(options) => textEditor(options)} filter filterPlaceholder="Search by stop desc" style={{ minWidth: '200px' }} />
          <Column field="stop_lat" header={t('Stop Lat')} editor={(options) => textEditor(options)} style={{ minWidth: '200px' }} />
          <Column field="stop_lon" header={t('Stop Lon')} editor={(options) => textEditor(options)} style={{ minWidth: '200px' }} />
          <Column field="zone_id" header={t('Zone ID')} editor={(options) => textEditor(options)} style={{ minWidth: '200px' }} />
          <Column field="stop_url" header={t('Stop Url')} editor={(options) => textEditor(options)} style={{ minWidth: '200px' }} />
          <Column field="location_type" header={t('Location Type')} editor={locationTypeEditor} body={locationTypeBodyTemplate} style={{ minWidth: '200px' }} />
          <Column field="parent_station" header={t('Parent Station')} editor={(options) => textEditor(options)} style={{ minWidth: '200px' }} />
          <Column field="stop_timezone" header={t('Stop Timezone')} editor={timezoneEditor} body={timezoneBodyTemplate} style={{ minWidth: '200px' }} />
          <Column field="wheelchair_boarding" header={t('Wheelchair Boarding')} editor={wheelchairBoardingEditor} body={wheelchairBoardingBodyTemplate} style={{ minWidth: '400px' }} />
          <Column field="level_id" header={t('Level ID')} editor={(options) => textEditor(options)} style={{ minWidth: '100px' }} />
          <Column field="platform_code" header={t('Platform Code')} editor={(options) => textEditor(options)} style={{ minWidth: '200px' }} />
        </DataTable>
      ) : (
        <DataTable
          header={header}
          value={[]}
          emptyMessage={
            <div style={{ padding: '1rem 0', textAlign: 'center' }}>
              {t('No stop found.')}
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
            {/* Harita Alanı */}
            <div style={{ height: '300px', overflow: 'hidden' }}>
              {showMap && <Map
                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                initialViewState={{
                  longitude: formData.stop_lon ? formData.stop_lon : 28.979530,
                  latitude: formData.stop_lat ? formData.stop_lat : 41.015137,
                  zoom: 15
                }}
                onClick={handleMapClick}
                style={{ height: '300px', width: '100%' }}
              //onClick={handleMapClick}
              >
                {formData.stop_lat && <Marker
                  longitude={Number(formData.stop_lon)}
                  latitude={Number(formData.stop_lat)}
                  draggable
                  offset={[0, -30]} // yukarı hizalama
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    if (
                      popupInfo &&
                      popupInfo.lat === Number(formData.stop_lat) &&
                      popupInfo.lon === Number(formData.stop_lon)
                    ) {
                      setPopupInfo(null); // açık popup varsa kapat
                    } else {
                      setPopupInfo({
                        lat: Number(formData.stop_lat),
                        lon: Number(formData.stop_lon),
                        name: formData.stop_name,
                        id: formData.stop_id
                      });
                    }
                  }}
                >
                  <img
                    src="assets/images/maps/stoppin.png"
                    alt="marker"
                    style={{ width: '30px', height: '30px' }}
                  />
                </Marker>}
                {popupInfo && (
                  <Popup
                    longitude={popupInfo.lon}
                    latitude={popupInfo.lat}
                    closeOnClick={false}
                    onClose={() => setPopupInfo(null)}
                    anchor="top"
                  >
                    <div style={{ fontSize: '14px' }}>
                      <strong>{popupInfo.name}</strong><br />
                      ID: {popupInfo.id}<br />
                      ({popupInfo.lat.toFixed(6)}, {popupInfo.lon.toFixed(6)})
                    </div>
                  </Popup>
                )}
              </Map>}
            </div>

            {/* Alt İçerik */}
            <div style={{ flex: 1, padding: '1rem' }}>
              <div className="row p-fluid">
                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="stop-id" className={formErrors.stop_id ? 'required-field error' : 'required-field'}>
                    {t('Stop ID')} <span className="required-asterisk">*</span>
                  </label>
                  <InputText 
                    id="stop-id" 
                    name="stop_id" 
                    value={formData.stop_id} 
                    onChange={handleChange} 
                    className={formErrors.stop_id ? 'p-invalid' : ''}
                  />
                  {formErrors.stop_id && <small className="p-error">{t('This field is required')}</small>}
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="stop-code">{t('Stop Code')}</label>
                  <InputText id="stop-code" name="stop_code" value={formData.stop_code} onChange={handleChange} />
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="stop-name" className={formErrors.stop_name ? 'required-field error' : 'required-field'}>
                    {t('Stop Name')} <span className="required-asterisk">*</span>
                  </label>
                  <InputText 
                    id="stop-name" 
                    name="stop_name" 
                    value={formData.stop_name} 
                    onChange={handleChange} 
                    className={formErrors.stop_name ? 'p-invalid' : ''}
                  />
                  {formErrors.stop_name && <small className="p-error">{t('This field is required')}</small>}
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="stop-desc">{t('Stop Desc')}</label>
                  <InputText id="stop-desc" name="stop_desc" value={formData.stop_desc} onChange={handleChange} />
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="stop-lat" className={formErrors.stop_lat ? 'required-field error' : 'required-field'}>
                    {t('Stop Lat')} <span className="required-asterisk">*</span>
                  </label>
                  <InputText 
                    id="stop-lat" 
                    name="stop_lat" 
                    value={formData.stop_lat} 
                    onChange={handleChange} 
                    keyfilter="num"
                    className={formErrors.stop_lat ? 'p-invalid' : ''}
                  />
                  {formErrors.stop_lat && <small className="p-error">{t('A valid latitude is required')}</small>}
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="stop-lon" className={formErrors.stop_lon ? 'required-field error' : 'required-field'}>
                    {t('Stop Lon')} <span className="required-asterisk">*</span>
                  </label>
                  <InputText 
                    id="stop-lon" 
                    name="stop_lon" 
                    value={formData.stop_lon} 
                    onChange={handleChange} 
                    keyfilter="num"
                    className={formErrors.stop_lon ? 'p-invalid' : ''}
                  />
                  {formErrors.stop_lon && <small className="p-error">{t('A valid longitude is required')}</small>}
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="zone-id">{t('Zone ID')}</label>
                  <InputText id="zone-id" name="zone_id" value={formData.zone_id} onChange={handleChange} />
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="stop-url">{t('Stop Url')}</label>
                  <InputText 
                    id="stop-url" 
                    name="stop_url" 
                    value={formData.stop_url} 
                    onChange={handleChange}
                    className={formErrors.stop_url ? 'p-invalid' : ''}
                    placeholder="https://example.com"
                  />
                  {formErrors.stop_url && (
                    <small className="p-error">
                      {t('Please enter a valid URL (e.g., https://example.com)')}
                    </small>
                  )}
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="friday">{t('Location Type')}</label>
                  <Dropdown
                    id="location-type"
                    name="location_type"
                    value={formData.location_type}
                    options={options.locationTypes}
                    onChange={handleChange}
                    placeholder={t('Choose Location Type')}
                  />
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="parent-station">{t('Parent Station')}</label>
                  <InputText id="parent-station" name="parent_station" value={formData.parent_station} onChange={handleChange} />
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="friday">{t('Stop Timezone')}</label>
                  <Dropdown
                    id="stop-timezone"
                    name="stop_timezone"
                    value={formData.stop_timezone}
                    options={options.timezones}
                    onChange={handleChange}
                    placeholder={t('Choose Timezone')}
                  />
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="friday">{t('Wheelchair Boarding')}</label>
                  <Dropdown
                    id="wheelchair-boarding"
                    name="wheelchair_boarding"
                    value={formData.wheelchair_boarding}
                    options={options.wheelchairBoardings}
                    onChange={handleChange}
                    placeholder={t('Choose Wheelchair Boarding')}
                  />
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="level-id" className={formErrors.level_id ? 'required-field error' : 'required-field'}>
                    {t('Level ID')} <span className="required-asterisk">*</span>
                  </label>
                  <InputText 
                    id="level-id" 
                    name="level_id" 
                    value={formData.level_id} 
                    onChange={handleChange} 
                    className={formErrors.level_id ? 'p-invalid' : ''}
                  />
                  {formErrors.level_id && <small className="p-error">{t('This field is required')}</small>}
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="platform-code">{t('Platform Code')}</label>
                  <InputText id="platform-code" name="platform_code" value={formData.platform_code} onChange={handleChange} />
                </div>

              </div>
            </div>
          </div>
        )}
      </Sidebar>
    </div>
  );
}

export default Stops;