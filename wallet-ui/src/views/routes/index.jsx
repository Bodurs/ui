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
import { DataView } from 'primereact/dataview';
import { Tag } from 'primereact/tag';
import ApiService from '../../services/ApiService';
//import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
//import 'leaflet/dist/leaflet.css';
import { Map, Marker, Popup, Source, Layer } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import Cookies from 'js-cookie';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import options from '../../constants/options.json';
import { useTranslation } from 'react-i18next';

const Routes = () => {
  const { t, i18n } = useTranslation();
  const toast = useRef(null);
  const exportMenu = useRef(null);
  const [routes, setRoutes] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [shapes, setShapes] = useState([]);
  const [routeLineGeoJson, setRouteLineGeoJson] = useState([]);
  const [stops, setStops] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [calendar, setCalendar] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [stopTimes, setStopTimes] = useState([]);
  const [routeMaps, setRouteMaps] = useState([]);
  const [popupInfo, setPopupInfo] = useState(null);
  const dt = useRef(null);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    route_id: { value: null, matchMode: FilterMatchMode.EQUALS },
    agency_id: { value: null, matchMode: FilterMatchMode.EQUALS },
    route_short_name: { value: null, matchMode: FilterMatchMode.EQUALS },
    route_long_name: { value: null, matchMode: FilterMatchMode.EQUALS },
    route_desc: { value: null, matchMode: FilterMatchMode.EQUALS },
    route_type: { value: null, matchMode: FilterMatchMode.EQUALS }
  });
  const exportButtons = [
    { label: t('Csv Export'), icon: 'pi pi-fw pi-file', command: () => { exportCSV(false) } },
    { label: t('Excel Export'), icon: 'pi pi-fw pi-file-excel', command: () => { exportExcel() } },
    { label: t('Pdf Export'), icon: 'pi pi-fw pi-file-pdf', command: () => { exportPdf() } }
  ];
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteTripDialogVisible, setDeleteTripDialogVisible] = useState(false);
  const [deletingTripId, setDeletingTripId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [addNewVisible, setAddNewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [formData, setFormData] = useState({
    route_id: "",
    agency_id: "",
    route_short_name: "",
    route_long_name: "",
    route_desc: "",
    route_type: null,
    route_url: "",
    route_color: "000000",
    route_text_color: "000000",
    route_sort_order: "",
    continuous_pickup: "",
    continuous_drop_off: "",
    //network_id: "",
    //as_route: "",
    feed_id: Cookies.get('feed_id')
  });
  const [editFormData, setEditFormData] = useState({
    id: "",
    service_id: "",
    trip_headsign: "",
    trip_short_name: "",
    direction_id: "",
    bikes_allowed: "",
    wheelchair_accessible: "",
    feed_id: Cookies.get('feed_id')
  });

  const [formErrors, setFormErrors] = useState({
    route_id: false,
    agency_id: false,
    route_names: false,
    route_url: false,
    route_url_invalid: false,
    route_sort_order_invalid: false,
    route_type: false,
  });
  const routeTypes = [
    { type: 0, name: t('Tram/Light Rail') },
    { type: 1, name: t('Metro') },
    { type: 2, name: t('Railway') },
    { type: 3, name: t('Bus') },
    { type: 4, name: t('Ferry') },
    { type: 5, name: t('Cable car') },
    { type: 6, name: t('Cogwheel Train') },
    { type: 7, name: t('Aerial Cable Car') },
    { type: 11, name: t('Monorail') }
  ];
  const continuousTypes = [
    { type: 0 },
    { type: 1 },
    { type: 2 },
    { type: 3 }
  ];
  const pickupOptions = [
    { label: t('Regular'), value: 0 },
    { label: t('Not available'), value: 1 },
    { label: t('Arrange with agency'), value: 2 },
    { label: t('Phone agency'), value: 3 },
  ];

  useEffect(() => {
    if (detailVisible) {
      setTimeout(() => setShowMap(true), 100); // 100ms sonra mount
    } else {
      setShowMap(false);
    }
  }, [detailVisible]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing in a field
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: false
      });
    }
  };

  const handleColorChange = (e) => {
    setFormData(prev => ({ ...prev, route_color: e.value }));
  };

  const handleTextColorChange = (e) => {
    setFormData(prev => ({ ...prev, route_text_color: e.value }));
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEdit = async () => {
    try {
      const response = await ApiService.post('/api/0/v1/gtfs/trips/save', editFormData);
      if (response?.result?.code == "0") {
        setEditVisible(false);
        //getRoutes();
        toast.current.show({
          severity: 'success',
          summary: t('Success'),
          detail: t('Trip editing completed!'),
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

  const closeEdit = async () => {
    setEditVisible(false);
    setCalendar([]);
    setStopTimes([]);
    setBlocks([]);
    setEditFormData({
      id: "",
      service_id: "",
      trip_headsign: "",
      trip_short_name: "",
      direction_id: "",
      bikes_allowed: "",
      wheelchair_accessible: "",
      feed_id: Cookies.get('feed_id')
    })
  };

  const validateForm = () => {
    const errors = {
      route_id: !formData.route_id,
      route_type: formData.route_type == null,
      agency_id: !formData.agency_id,
      route_names: !formData.route_short_name && !formData.route_long_name,
      route_url_invalid: formData.route_url ? !isValidUrl(formData.route_url) : false,
      route_sort_order_invalid: formData.route_sort_order ? 
        !Number.isInteger(Number(formData.route_sort_order)) || Number(formData.route_sort_order) < 0 : false,
    };

    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleSubmit = async () => {

    console.log("formData", formData);
    if (!validateForm()) {
      return;
    }

    try {
      const response = await ApiService.post('/api/0/v1/gtfs/routes/save', formData);
      if (response?.result?.code == "0") {
        setAddNewVisible(false);
        closeSidebar();
        getRoutes();
        toast.current.show({
          severity: 'success',
          summary: t('Success'),
          detail: t('New route added!'),
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

  const editTrip = async (tripId) => {
    setEditVisible(true);
    await getCalendar();
    await getTripInfo(tripId);
    await getBlocks();
    await getRouteMaps();
    await getStopTimes(tripId);
  }

  const footerContent = (
    <div>
      <Button label={t('Cancel')} icon="pi pi-times" onClick={() => setAddNewVisible(false)} className="p-button-text" />
      <Button label={t('Save')} icon="pi pi-check" onClick={handleSubmit} autoFocus />
    </div>
  );

  const editFooterContent = (
    <div>
      <Button label={t('Cancel')} icon="pi pi-times" onClick={closeEdit} className="p-button-text" />
      <Button label={t('Save')} icon="pi pi-check" onClick={handleEdit} autoFocus />
    </div>
  );



  useEffect(() => {
    getRoutes();
    getAgencies();
  }, []);

  async function getRoutes() {
    setLoading(true);
    try {
      const url = `/api/0/v1/gtfs/routes/get?feed_id=${Cookies.get('feed_id')}`;
      const response = await ApiService.get(url);
      setRoutes(response.data.data);
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

  async function getTripInfo(tripId) {
    setLoading(true);
    try {
      const url = `/api/0/v1/gtfs/trips/get?feed_id=${Cookies.get('feed_id')}&trip_id=${tripId}`;
      const response = await ApiService.get(url);
      if (response.data.data.length > 0) {
        setEditFormData({
          ...editFormData,
          id: response.data.data[0].id,
          service_id: response.data.data[0].service_id,
          trip_headsign: response.data.data[0].trip_headsign,
          trip_short_name: response.data.data[0].trip_short_name,
          direction_id: response.data.data[0].direction_id,
          bikes_allowed: response.data.data[0].bikes_allowed,
          wheelchair_accessible: response.data.data[0].wheelchair_accessible,
          block_id: response.data.data[0].block_id,
          shape_id: response.data.data[0].shape_id
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('GET request error:', error);
      setLoading(false);
      throw error;
    }
  }

  async function getCalendar() {
    setLoading(true);
    try {
      const url = `/api/0/v1/gtfs/calendar/get?feed_id=${Cookies.get('feed_id')}`;
      const response = await ApiService.get(url);
      setCalendar(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('GET request error:', error);
      setLoading(false);
      throw error;
    }
  }

  async function getBlocks() {
    setLoading(true);
    try {
      const url = `/api/0/v1/gtfs/blocks/get?feed_id=${Cookies.get('feed_id')}`;
      const response = await ApiService.get(url);
      setBlocks(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('GET request error:', error);
      setLoading(false);
      throw error;
    }
  }

  async function getStopTimes(tripId) {
    setLoading(true);
    try {
      const url = `/api/0/v1/gtfs/stoptimes/get?feed_id=${Cookies.get('feed_id')}&trip_id=${tripId}`;
      const response = await ApiService.get(url);
      setStopTimes(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('GET request error:', error);
      setLoading(false);
      throw error;
    }
  }

  async function getRouteMaps() {
    setLoading(true);
    try {
      const url = `/api/0/v1/gtfs/shapes/get?fields=shape_id&eed_id=${Cookies.get('feed_id')}&groupBy=shape_id`;
      const response = await ApiService.get(url);
      setRouteMaps(response.data.data);
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
      route_id: { value: null, matchMode: FilterMatchMode.EQUALS },
      agency_id: { value: null, matchMode: FilterMatchMode.EQUALS },
      route_short_name: { value: null, matchMode: FilterMatchMode.EQUALS },
      route_long_name: { value: null, matchMode: FilterMatchMode.EQUALS },
      route_desc: { value: null, matchMode: FilterMatchMode.EQUALS },
      route_type: { value: null, matchMode: FilterMatchMode.EQUALS }
    });
  };

  const onStopTimesRowEditComplete = async (e) => {
    let { newData, index } = e;
    const updatedStopTimes = [...stopTimes];
    updatedStopTimes[index] = newData;

    console.log("newData", newData);
    setStopTimes(updatedStopTimes);
    const response = await ApiService.post('/api/0/v1/gtfs/stoptimes/save', newData);
    if (response?.result?.code == "0") {
      setAddNewVisible(false);
      getRoutes();
      toast.current.show({
        severity: 'success',
        summary: t('Success'),
        detail: t('Stop time information edited!'),
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
  };


  // Metin alanı için düzenleme bileşeni
  const textEditor = (options) => {
    return <InputText type="text" className='editor-input' value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
  };

  const colorTextEditor = (options) => {
    const handleInputChange = (e) => {
      options.editorCallback(e.target.value);
    };

    const handleColorChange = (e) => {
      options.editorCallback(e.value);
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <InputText
          value={options.value}
          onChange={handleInputChange}
          className="editor-input"
          style={{ width: '100%' }}
        />
        <ColorPicker
          value={(options.value || '').replace('#', '')}
          onChange={handleColorChange}
          inline={false}
        />
      </div>
    );
  };

  // CSV Export
  const exportCSV = () => {
    dt.current.exportCSV();
  };

  // Excel Export
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(routes);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('Routes'));
    XLSX.writeFile(workbook, 'routes.xlsx');
  };

  // PDF Export
  const exportPdf = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Route ID', 'Agency ID', 'Route Short Name', 'Route Long Name', 'Route Desc', 'Route Type']],
      body: routes.map((route) => [route.route_id, route.agency_id, route.route_short_name, route.route_long_name, route.route_desc, route.route_type]),
    });
    doc.save('routes.pdf');
  };

  const header = (
    <div className="flex justify-content-between align-items-center">
      <h5 className="m-0">{t('Routes')}</h5>
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
      const response = await ApiService.delete('/api/0/v1/gtfs/routes/delete', {
        data: {
          id: selectedRow.id
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const updatedRoutes = routes.filter((item) => item.id !== selectedRow.id);
      setRoutes(updatedRoutes);
      setSelectedRow(null);
      toast.current.show({
        severity: 'success',
        summary: t('Success'),
        detail: t('Route deleted!'),
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


  const showSidebar = async (routeData) => {
    setDetailVisible(true);
    setSelectedRoute(routeData);
    try {
      const response = await ApiService.post('/api/0/v1/gtfs/routes/detail', { feed_id: Cookies.get('feed_id'), route_id: routeData.route_id });
      setShapes(response.data.data.shapes);
      setRouteLineGeoJson({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: response.data.data.shapes.map(point => [Number(point.shape_pt_lon), Number(point.shape_pt_lat)])
        },
        properties: {}
      });
      setStops(response.data.data.stops);
      const tripResponse = await ApiService.get(`/api/0/v1/gtfs/routes/trips?feed_id=${Cookies.get('feed_id')}&route_id=${routeData.route_id}`);
      setTrips(tripResponse.data.data);
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: t('Error'),
        detail: t('An error occurred!'),
        life: 2000,
      });
    }
  }

  const buttonColumnTemplate = (rowData) => {
    return (
      <div className="justify-center">
        <Button className='grid-icon-button' icon="pi pi-pencil" onClick={() => openSidebar(rowData)} rounded text severity="secondary" aria-label={t('Edit')} tooltip={t('Edit')} tooltipOptions={{ position: "top" }} />
        <Button className='grid-icon-button' icon="pi pi-search" onClick={() => showSidebar(rowData)} rounded text severity="secondary" aria-label={t('Details')} tooltip={t('Show Details')} tooltipOptions={{ position: "top" }} />
      </div>
    );
  };

  const deleteTrip = async () => {
    try {
      const response = await ApiService.post('/api/0/v1/gtfs/routes/deletetrip', { feed_id: Cookies.get('feed_id'), trip_id: deletingTripId });
      if (response.result.code == "0") {
        const updatedTrips = trips.filter(trip => trip.trip_id !== deletingTripId);
        setTrips(updatedTrips);
      }
      setDeletingTripId(null);
      setDeleteTripDialogVisible(false);
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: t('Error'),
        detail: t('An error occurred!'),
        life: 2000,
      });
    }
  }

  const tripTemplate = (trip) => {
    if (!trip) return;

    return (
      <div className="p-card p-3 flex justify-content-between align-items-center mb-2" style={{ width: '100%', background: '#f5f5f5', borderRadius: '8px' }}>
        <div className="flex align-items-center">
          <i className="pi pi-map-marker text-green-500 mr-2" style={{ fontSize: '1.5rem' }}></i>
          <div>
            <div className="font-bold">{trip.stop_name}</div>
            <div className="text-sm text-gray-500">{trip.trip_id} - {trip.departure_time}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" tooltip={t('Delete Trip')} tooltipOptions={{ position: 'top' }} onClick={() => { setDeleteTripDialogVisible(true); setDeletingTripId(trip.trip_id) }} />
          {/*<Button icon="pi pi-copy" className="p-button-rounded p-button-text p-button-success" tooltip={t('Copy Trip')} tooltipOptions={{ position: 'top' }} />*/}
          <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-secondary" tooltip={t('Edit Trip')} tooltipOptions={{ position: 'top' }} onClick={() => editTrip(trip.trip_id)} />
        </div>
      </div>
    );
  };

  const getActiveDaysLabel = (calendarItem) => {
    const dayMap = {
      monday: t('Mon'),
      tuesday: t('Tue'),
      wednesday: t('Wed'),
      thursday: t('Thu'),
      friday: t('Fri'),
      saturday: t('Sat'),
      sunday: t('Sun')
    };

    return Object.entries(dayMap)
      .filter(([key]) => calendarItem[key] === 1)
      .map(([, label]) => label)
      .join(', ');
  };

  const isValidUrl = (url) => {
    try {
      // Check if the URL is valid
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const stopTimeTextEditor = (options) => {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    );
  };

  // Editable dropdown
  const stopTimeDropdownEditor = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={pickupOptions}
        onChange={(e) => options.editorCallback(e.value)}
        placeholder={t('Select')}
      />
    );
  };

  const openSidebar = async (routeData = null) => {
    if (routeData) {
      setFormData({
        id: routeData.id,
        agency_id: routeData.agency_id,
        route_id: routeData.route_id,
        route_short_name: routeData.route_short_name,
        route_long_name: routeData.route_long_name,
        route_desc: routeData.route_desc,
        route_type: routeData.route_type,
        route_url: routeData.route_url,
        route_color: routeData.route_color,
        route_text_color: routeData.route_text_color,
        route_sort_order: routeData.route_sort_order,
        continuous_pickup: routeData.continuous_pickup,
        continuous_drop_off: routeData.continuous_drop_off,
        //network_id: routeData.network_id,
        //as_route: routeData.as_route,
        feed_id: Cookies.get('feed_id')
      });
    } else {
      setFormData({
        agency_id: "",
        route_id: "",
        route_short_name: "",
        route_long_name: "",
        route_desc: "",
        route_type: null,
        route_url: "",
        route_color: "",
        route_text_color: "",
        route_sort_order: "",
        continuous_pickup: "",
        continuous_drop_off: "",
        //network_id: "",
        //as_route: "",
        feed_id: Cookies.get('feed_id')
      });
    }

    setVisible(true);
  }

  const closeSidebar = async () => {
    setVisible(false);
    setFormData({
      agency_id: "",
      route_id: "",
      route_short_name: "",
      route_long_name: "",
      route_desc: "",
      route_type: null,
      route_url: "",
      route_color: "",
      route_text_color: "",
      route_sort_order: "",
      continuous_pickup: "",
      continuous_drop_off: "",
      //network_id: "",
      //as_route: "",
      feed_id: Cookies.get('feed_id')
    });
  }

  const rowOrderComplete = (newList) => {
    const reordered = newList.map((item, index) => ({
      ...item,
      stop_sequence: index + 1,
    }));
    setStopTimes(reordered);
  };

  const stopTimeButtonColumnTemplate = (rowData) => {
    return (
      <div className="justify-center">
        <Button className='grid-icon-button' icon="pi pi-trash" onClick={() => deleteStopTime(rowData)} rounded text severity="secondary" aria-label={t('Edit')} tooltip={t('Edit')} tooltipOptions={{ position: "top" }} />
      </div>
    );
  };

  const deleteStopTime = (rowData) => {
    const updatedStopTimes = stopTimes.filter(stopTime => stopTime.stop_sequence !== rowData.stop_sequence);
    const reordered = updatedStopTimes.map((item, index) => ({
      ...item,
      stop_sequence: index + 1,
    }));
    setStopTimes(reordered);
  };

  return (
    <div className="datatable-doc-demo">
      <Toast ref={toast} />
      {routes.length > 0 ? (
        <DataTable
          ref={dt}
          value={routes.map(item => ({
            ...item,
            created_at: new Date(item.created_at)
          }))}
          scrollable
          virtualScrollerOptions={{ itemSize: 39 }}
          stripedRows
          showGridlines
          loading={loading}
          dataKey="id"
          filters={filters}
          globalFilterFields={['route_id', 'agency_id', 'route_short_name', 'route_long_name', 'route_desc', 'route_type']}
          header={header}
          emptyMessage={t('No route found.')}
          onFilter={(e) => setFilters(e.filters)}
          autoLayout={true}
          selection={selectedRow}
          onSelectionChange={(e) => setSelectedRow(e.value)}
        >
          <Column selectionMode="single" style={{ width: '5%', textAlign: 'center' }}></Column>
          <Column body={buttonColumnTemplate} />
          <Column field="id" header="ID" filter filterPlaceholder={t('Search by ID')} style={{ display: 'none' }} />
          <Column field="route_id" header={t('Route ID')} filter filterPlaceholder={t('Search by route id')} style={{ minWidth: '100px' }} />
          <Column field="agency_id" header={t('Agency ID')} filter filterPlaceholder={t('Search by agency id')} style={{ minWidth: '250px' }} />
          <Column field="route_short_name" header={t('Route Short Name')} filter filterPlaceholder={t('Search by route short name')} style={{ minWidth: '300px' }} />
          <Column field="route_long_name" header={t('Route Long Name')} filter filterPlaceholder={t('Search by route long name')} style={{ minWidth: '500px' }} />
          <Column field="route_desc" header={t('Route Desc')} filter filterPlaceholder={t('Search by route desc')} style={{ minWidth: '200px' }} />
          <Column field="route_type" header={t('Route Type')} filter filterPlaceholder={t('Search by route type')} style={{ minWidth: '200px' }} />
          <Column field="route_url" header={t('Route Url')} body={(rowData) => (
            <span className="column-ellipsis" title={rowData.route_url}>
              {rowData.route_url}
            </span>
          )} style={{ maxWidth: '300px' }} />
          <Column field="route_color" header={t('Route Color')} style={{ minWidth: '250px' }} />
          <Column field="route_text_color" header={t('Route Text Color')} style={{ minWidth: '250px' }} />
          <Column field="route_sort_order" header={t('Sort Order')} style={{ minWidth: '50px' }} />
          <Column field="continuous_pickup" header={t('Continuous Pickup')} style={{ minWidth: '50px' }} />
          <Column field="continuous_drop_off" header={t('Continuous Drop Off')} style={{ minWidth: '50px' }} />
          {/*<Column field="network_id" header={t('Network ID')} editor={(options) => textEditor(options)} style={{ minWidth: '50px' }} />
          <Column field="as_route" header={t('As Route')} editor={(options) => textEditor(options)} style={{ minWidth: '20px' }} />*/}
        </DataTable>
      ) : (
        <DataTable
          header={header}
          value={[]}
          emptyMessage={
            <div style={{ padding: '1rem 0', textAlign: 'center' }}>
              {t('No route found.')}
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
      <ConfirmDialog
        visible={deleteTripDialogVisible}
        onHide={() => setDialogVisible(false)}
        message={t('Are you sure you want to delete this item?')}
        header={t('Confirmation')}
        icon="pi pi-exclamation-triangle"
        acceptLabel={t('Yes')}
        rejectLabel={t('No')}
        acceptClassName="p-button-danger"
        accept={deleteTrip}
        reject={() => setDeleteTripDialogVisible(false)}
      />
      <Dialog
        header={t('Edit Trip')}
        visible={editVisible}
        style={{ width: "80vw" }}
        onHide={() => setEditVisible(false)}
        footer={editFooterContent}
      >
        <div className="row p-fluid stop-times-table">

          <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6 p-field add-form-input">
            <label htmlFor="friday">Service</label>
            <Dropdown
              id="service-id"
              name="service_id"
              value={editFormData.service_id}
              options={calendar}
              onChange={handleEditChange}
              optionValue="service_id"
              //optionLabel='service_id'
              itemTemplate={(option) =>
                option
                  ? `${option.service_id} - ${option.start_date} to ${option.end_date} (${getActiveDaysLabel(option)})`
                  : ''
              }
              valueTemplate={(selectedId) => {
                if (selectedId) {
                  const selected = calendar.find(opt => opt.service_id == selectedId.service_id);
                  return selected
                    ? `${selected.service_id} - ${selected.start_date} to ${selected.end_date} (${getActiveDaysLabel(selected)})`
                    : t('Choose Service');
                } else {
                  return t('Choose Service');
                }

              }}
              placeholder={t('Choose Service')}
            />
          </div>

          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
            <label htmlFor="route-long-name">{t('Block')}</label>
            <Dropdown
              id="block-id"
              name="block_id"
              value={editFormData.block_id}
              options={blocks}
              onChange={handleEditChange}
              optionLabel='block_id'
              optionValue='block_id'
              placeholder={t('Choose Block')}
            />
          </div>

          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
            <label htmlFor="trip-headsign">{t('Trip Headsign')}</label>
            <InputText id="trip-headsign" name="trip_headsign" value={editFormData.trip_headsign} onChange={handleEditChange} />
          </div>

          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
            <label htmlFor="short-name">{t('Short Name')}</label>
            <InputText id="short-name" name="trip_short_name" value={editFormData.trip_short_name} onChange={handleEditChange} />
          </div>

          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
            <label htmlFor="route-long-name">{t('Route Map')}</label>
            <Dropdown
              id="shape-id"
              name="shape_id"
              value={editFormData.shape_id}
              options={routeMaps}
              onChange={handleEditChange}
              optionLabel='shape_id'
              optionValue='shape_id'
              placeholder={t('Choose Shape ID')}
            />
          </div>

          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
            <label htmlFor="route-short-name">{t('Direction')}</label>
            <Dropdown
              id="direction"
              name="direction_id"
              value={editFormData.direction_id}
              options={options.directions}
              onChange={handleEditChange}
              placeholder={t('Choose Direction')}
            />
          </div>

          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
            <label htmlFor="route-long-name">{t('Bikes Allowed')}</label>
            <Dropdown
              id="bikes-allowed"
              name="bikes_allowed"
              value={editFormData.bikes_allowed}
              options={options.bikesAllowed}
              onChange={handleEditChange}
              placeholder={t('Choose')}
            />
          </div>

          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
            <label htmlFor="route-desc">{t('Wheelchair Accessible')}</label>
            <Dropdown
              id="wheelchair-accessible"
              name="wheelchair_accessible"
              value={editFormData.wheelchair_accessible}
              options={options.wheelchairAccessible}
              onChange={handleEditChange}
              placeholder={t('Choose')}
            />
          </div>
        </div>

        <div className="row p-fluid stop-times-table" style={{ marginTop: '20px' }}>
          <DataTable
            value={stopTimes}
            editMode="row"
            dataKey="stop_sequence"
            onRowEditComplete={onStopTimesRowEditComplete}
            reorderableRows onRowReorder={(e) => rowOrderComplete(e.value)}
            style={{ marginType: '20px' }}
          >
            <Column rowReorder style={{ width: '3rem' }} />
            <Column field="stop_sequence" header="#" style={{ width: '5%' }} />
            <Column field="stop_name" header={t('Stop Name')} style={{ width: '25%' }} />
            <Column field="arrival_time" header={t('Arrive')} editor={stopTimeTextEditor} />
            <Column field="departure_time" header={t('Depart')} editor={stopTimeTextEditor} />
            <Column field="stop_headsign" header={t('Stop Headsign')} editor={stopTimeTextEditor} />
            <Column field="pickup_type" header={t('Pickup Type')} editor={stopTimeDropdownEditor} />
            <Column field="drop_off_type" header={t('Drop off Type')} editor={stopTimeDropdownEditor} />
            <Column field="shape_dist_traveled" header={t('Distance Travelled')} editor={stopTimeTextEditor} />
            <Column rowEditor headerStyle={{ width: '5%', minWidth: '5rem' }} bodyStyle={{ textAlign: 'center' }} />
            <Column body={stopTimeButtonColumnTemplate} />
          </DataTable>
        </div>
      </Dialog>
      <Sidebar
        visible={detailVisible}
        position="right"
        onHide={() => setDetailVisible(false)}
        style={{ width: '50vw', padding: 0 }}
        showCloseIcon
      >
        {detailVisible && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Harita Alanı */}
            <div style={{ flex: '0 0 40%' }}>
              {showMap && shapes.length > 0 && <Map
                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                initialViewState={{
                  longitude: shapes.length > 0 ? shapes[0].shape_pt_lon : 28.979530,
                  latitude: shapes.length > 0 ? shapes[0].shape_pt_lat : 41.015137,
                  zoom: 10
                }}
                style={{ height: '300px', width: '100%' }}
              //onClick={handleMapClick}
              >
                <Source id="route-line" type="geojson" data={routeLineGeoJson}>
                  <Layer
                    id="route-line-layer"
                    type="line"
                    paint={{
                      'line-color': `#${selectedRoute.route_color ? selectedRoute.route_color : "000000"}`,
                      'line-width': 4
                    }}
                  />
                </Source>
                {stops.map((stop, idx) => (<Marker
                  longitude={Number(stop.stop_lon)}
                  latitude={Number(stop.stop_lat)}
                  draggable={false}
                  anchor="bottom"
                  key={`stop-${idx}`}
                  onClick={() => {
                    if (
                      popupInfo &&
                      popupInfo.stop_id === stop.stop_id
                    ) {
                      setPopupInfo(null);
                    } else {
                      setPopupInfo(stop);
                    }
                  }}
                >
                  <img
                    src="assets/images/maps/stoppin.png"
                    alt="marker"
                    style={{ width: '30px', height: '30px' }}
                  />
                </Marker>))}
                {popupInfo && (
                  <Popup
                    longitude={popupInfo.stop_lon}
                    latitude={popupInfo.stop_lat}
                    closeOnClick={false}
                    onClose={() => setPopupInfo(null)}
                    anchor="top"
                  >
                    <div style={{ fontSize: '14px' }}>
                      <strong>{popupInfo.stop_name}</strong><br />
                      ID: {popupInfo.stop_id}<br />
                      ({popupInfo.stop_lat.toFixed(6)}, {popupInfo.stop_lon.toFixed(6)})
                    </div>
                  </Popup>
                )}
              </Map>}
            </div>

            {/* Alt İçerik */}
            <div style={{ flex: 1, padding: '1rem' }}>
              <h3>{selectedRoute.route_long_name}</h3>
              <h5>({selectedRoute.route_short_name})</h5>
              <DataView
                style={{ marginTop: '20px' }}
                value={trips}
                layout="list"
                itemTemplate={tripTemplate}
              />
            </div>
          </div>
        )}
      </Sidebar>
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
            {/* Alt İçerik */}
            <div style={{ flex: 1, padding: '1rem' }}>
              <div className="row p-fluid">
                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="route-id" className={formErrors.route_id ? 'required-field error' : 'required-field'}>
                    {t('Route ID')} <span className="required-asterisk">*</span>
                  </label>
                  <InputText
                    id="route-id"
                    name="route_id"
                    value={formData.route_id}
                    onChange={handleChange}
                    className={formErrors.route_id ? 'p-invalid' : ''}
                  />
                  {formErrors.route_id && <small className="p-error">{t('This field is required')}</small>}
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="agency-id" className={formErrors.agency_id ? 'required-field error' : 'required-field'}>
                    {t('Agency')} <span className="required-asterisk">*{formData.agency_id}</span>
                  </label>
                  <Dropdown
                    id="agency-id"
                    name="agency_id"
                    value={formData.agency_id}
                    options={agencies}
                    onChange={handleChange}
                    optionLabel="agency_name"
                    optionValue="agency_id"
                    placeholder={t('Choose Agency')}
                  />
                  {formErrors.agency_id && <small className="p-error">{t('This field is required')}</small>}
                </div>

                <div className="col-12">
                  {formErrors.route_names && (
                    <div className="p-error" style={{ marginTop: '1rem' }}>
                      {t('At least one of Route Short Name or Route Long Name must be provided')}
                    </div>
                  )}
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="route-short-name">{t('Route Short Name')}</label>
                  <InputText id="route-short-name" name="route_short_name" value={formData.route_short_name} onChange={handleChange} />
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="route-long-name">{t('Route Long Name')}</label>
                  <InputText id="route-long-name" name="route_long_name" value={formData.route_long_name} onChange={handleChange} />
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="route-desc">{t('Route Desc')}</label>
                  <InputText id="route-desc" name="route_desc" value={formData.route_desc} onChange={handleChange} />
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="route-type">{t('Route Type')} <span className="required-asterisk">*</span></label>
                  <Dropdown
                    id="route-type"
                    name="route_type"
                    value={formData.route_type}
                    options={options.routeTypes}
                    onChange={handleChange}
                    placeholder={t('Choose Route Type')}
                  />
                  {formErrors.route_type && <small className="p-error">{t('This field is required')}</small>}
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="route-url">{t('Route Url')}</label>
                  <InputText id="route-url" name="route_url" value={formData.route_url} onChange={handleChange} />
                  {formErrors.route_url_invalid && <small className="p-error">{t('Please enter a valid URL')}</small>}
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="route-sort-order">{t('Route Sort Order')}</label>
                  <InputText 
                    id="route-sort-order" 
                    name="route_sort_order" 
                    value={formData.route_sort_order} 
                    onChange={handleChange}
                    className={formErrors.route_sort_order_invalid ? 'p-invalid' : ''}
                    keyfilter="int"
                  />
                  {formErrors.route_sort_order_invalid && (
                    <small className="p-error">{t('Please enter a non-negative integer')}</small>
                  )}
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="route-color">{t('Route Color')}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                    <InputText
                      id="route-color"
                      name="route_color"
                      value={formData.route_color}
                      onChange={handleChange}
                    />
                    <ColorPicker
                      value={formData.route_color?.replace('#', '') || '000000'} // hex'ten #'i çıkar
                      onChange={handleColorChange}
                      inline={false}
                    />
                  </div>
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="route-text-color">{t('Route Text Color')}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                    <InputText
                      id="route-text-color"
                      name="route_text_color"
                      value={formData.route_text_color}
                      onChange={handleChange}
                    />
                    <ColorPicker
                      value={formData.route_text_color?.replace('#', '') || '000000'} // hex'ten #'i çıkar
                      onChange={handleTextColorChange}
                      inline={false}
                    />
                  </div>
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="continuous-pickup">{t('Continuous Pickup')}</label>
                  <Dropdown
                    id="continuous-pickup"
                    name="continuous_pickup"
                    value={formData.continuous_pickup}
                    options={options.continuousPickups}
                    onChange={handleChange}
                    optionLabel="label"
                    optionValue="value"
                    placeholder={t('Choose Continuous Pickup')}
                  />
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="continuous-drop-off">{t('Continuos Drop Off')}</label>
                  <Dropdown
                    id="continuous-drop-off"
                    name="continuous_drop_off"
                    value={formData.continuous_drop_off}
                    options={options.continuousPickups}
                    onChange={handleChange}
                    optionLabel="label"
                    optionValue="value"
                    placeholder={t('Choose Continuous Drop Off')}
                  />
                </div>

                {/*<div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="network-id">{t('Network Id')}</label>
                  <InputText id="network-id" name="network_id" value={formData.network_id} onChange={handleChange} />
                </div>

                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                  <label htmlFor="as-route">{t('As Route')}</label>
                  <InputText id="as-route" name="as_route" value={formData.as_route} onChange={handleChange} />
                </div>*/}

              </div>
            </div>
          </div>
        )}
      </Sidebar>
    </div>
  );
};

export default Routes;