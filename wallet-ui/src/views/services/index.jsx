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

const Services = () => {
    const { t, i18n } = useTranslation();
    const toast = useRef(null);
    const exportMenu = useRef(null);
    const [calendar, setCalendar] = useState([]);
    const [regions, setRegions] = useState([]);
    const [merchants, setMerchants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allowEdit, setAllowEdit] = useState(true);
    const dt = useRef(null);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
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
    const [formErrors, setFormErrors] = useState({
        service_id: false,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
        start_date: false,
        end_date: false
    });

    const [formData, setFormData] = useState({
        service_id: "",
        monday: "",
        tuesday: "",
        wednesday: "",
        thursday: "",
        friday: "",
        saturday: "",
        sunday: "",
        start_date: "",
        end_date: "",
        feed_id: Cookies.get('feed_id')
    });
    const choices = [
        { label: t('Yes'), value: 1 },
        { label: t('No'), value: 0 }
    ];


    const validateField = (name, value) => {
        if (name === 'service_id') {
            return !!value.trim();
        }
        if (['start_date', 'end_date'].includes(name)) {
            return !!value;
        }
        // For day checkboxes (0/1 values)
        return value !== "" && value !== undefined && value !== null;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Clear error when user starts typing/selecting
        if (formErrors[name] === true) {
            setFormErrors({ ...formErrors, [name]: false });
        }
    };

    const validateForm = () => {
        const errors = {};
        let isValid = true;
        
        Object.keys(formData).forEach(key => {
            if (key !== 'feed_id') { // Skip feed_id in validation
                errors[key] = !validateField(key, formData[key]);
                if (errors[key]) isValid = false;
            }
        });
        
        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.current.show({
                severity: 'error',
                summary: t('Error'),
                detail: t('Please fill in all required fields'),
                life: 3000,
            });
            return;
        }

        try {
            const response = await ApiService.post('/api/0/v1/gtfs/calendar/save', formData);
            if (response?.result?.code == "0") {
                setAddNewVisible(false);
                getCalendar();
                toast.current.show({
                    severity: 'success',
                    summary: t('Success'),
                    detail: t('New service added!'),
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
        getCalendar();
    }, []);

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

    async function getRegions() {
        try {
            const url = `/api/0/v1/base/organization/regions?organization_id=${Cookies.get('organization_id')}`;
            const response = await ApiService.get(url);
            setRegions(response.data.data);
        } catch (error) {
            console.error('GET request error:', error);
            throw error;
        }
    }

    async function getMerchants() {
        try {
            const url = `/api/0/v1/base/organization/merchants?organization_id=${Cookies.get('organization_id')}`;
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
            service_id: { value: null, matchMode: FilterMatchMode.EQUALS }
        });
    };

    const onRowEditComplete = async (e) => {
        let { newData, index } = e;
        
        // Validate all fields in row edit
        const requiredFields = ['service_id', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'start_date', 'end_date'];
        const hasEmptyFields = requiredFields.some(field => {
            const value = newData[field];
            return value === "" || value === null || value === undefined;
        });
        
        if (hasEmptyFields) {
            toast.current.show({
                severity: 'error',
                summary: t('Error'),
                detail: t('Please fill in all required fields'),
                life: 3000,
            });
            return;
        }
        
        try {
            console.log("new", newData);
            const response = await ApiService.post('/api/0/v1/gtfs/calendar/save', {
                id: newData.id,
                service_id: newData.service_id,
                monday: newData.monday,
                tuesday: newData.tuesday,
                wednesday: newData.wednesday,
                thursday: newData.thursday,
                friday: newData.friday,
                saturday: newData.saturday,
                sunday: newData.sunday,
                start_date: newData.start_date,
                end_date: newData.end_date
            });
            const updatedCalendar = [...calendar];
            updatedCalendar[index] = {
                ...updatedCalendar[index],
                service_id: newData.service_id,
                monday: newData.monday,
                tuesday: newData.tuesday,
                wednesday: newData.wednesday,
                thursday: newData.thursday,
                friday: newData.friday,
                saturday: newData.saturday,
                sunday: newData.sunday,
                start_date: newData.start_date,
                end_date: newData.end_date
            };
            setCalendar(updatedCalendar);
            toast.current.show({
                severity: 'success',
                summary: t('Success'),
                detail: t('Service informations edited!'),
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
                placeholder={t('Choose Region')}
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
                value={options.value ? options.value.toString() : ''}
                options={merchants}
                onChange={(e) => options.editorCallback(e.value)}
                optionLabel="name"
                optionValue="id"
                placeholder={t('Choose Merchant')}
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
        const worksheet = XLSX.utils.json_to_sheet(calendar);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, t('Services'));
        XLSX.writeFile(workbook, 'services.xlsx');
    };

    // PDF Export
    const exportPdf = () => {
        const doc = new jsPDF();
        doc.autoTable({
            head: [['Service ID', 'Monday', 'Tuesday', 'Wednesday', 'Thursay', 'Friday', 'Saturday', 'Sunday', 'Start Date', 'End Date']],
            body: calendar.map((c) => [c.service_id, c.monday, c.tuesday, c.wednesday, c.thursay, c.friday, c.saturday, c.sunday, c.start_date, c.end_date]),
        });
        doc.save('services.pdf');
    };

    const header = (
        <div className="flex justify-content-between align-items-center">
            <h5 className="m-0">{t('Services')}</h5>
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
            const response = await ApiService.delete('/api/0/v1/gtfs/calendar/delete', {
                data: {
                    id: selectedRow.id
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const updatedCalendar = calendar.filter((item) => item.id !== selectedRow.id);
            setCalendar(updatedCalendar);
            setSelectedRow(null);
            toast.current.show({
                severity: 'success',
                summary: t('Success'),
                detail: t('Service deleted!'),
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

    const booleanIconTemplate = (rowData, column) => {
        const value = rowData[column.field];
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                {value === 1 ? (
                    <i className="pi pi-check text-green-500" />
                ) : (
                    <i className="pi pi-times text-gray-500" />
                )}
            </div>
        );
    };

    const booleanEditor = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={choices}
                onChange={(e) => options.editorCallback(e.value)}
                optionLabel="label"
                optionValue="value"
                placeholder={t('Choose')}
                className='dropdown-edit-mode'
            />
        );
    };

    const handleDateChange = (e) => {
        const selectedDate = e.target.value; // JS Date objesi
        const formatted = moment(selectedDate).format('YYYYMMDD'); // örn: 20250425

        setFormData({ ...formData, [e.target.name]: formatted });

    };

    return (
        <div className="datatable-doc-demo">
            <Toast ref={toast} />
            {calendar.length > 0 ? (
                <DataTable scrollable ref={dt} value={calendar.map(item => ({
                    ...item,
                    created_at: new Date(item.created_at)
                }))} virtualScrollerOptions={{ itemSize: 39 }} stripedRows showGridlines loading={loading} dataKey="id"
                    filters={filters} globalFilterFields={['service_id']} header={header}
                    emptyMessage={t('No service found.')} onFilter={(e) => setFilters(e.filters)}
                    editMode="row" onRowEditComplete={onRowEditComplete} selection={selectedRow} onSelectionChange={(e) => setSelectedRow(e.value)}>
                    <Column selectionMode="single" style={{ width: '5%', textAlign: 'center' }}></Column>
                    <Column rowEditor={allowEdit} bodyStyle={{ textAlign: 'center' }} style={{ minWidth: '20px' }}></Column>
                    <Column field="id" header="ID" filter filterPlaceholder={t('Search by ID')} style={{ display: 'none' }} />
                    <Column field="service_id" header={t('Service ID')} editor={(options) => textEditor(options)} filter filterPlaceholder="Search by service id" style={{ minWidth: '100px' }} />
                    <Column field="monday" header={t('Monday')} body={booleanIconTemplate} editor={(options) => booleanEditor(options)} style={{ minWidth: '100px' }} />
                    <Column field="tuesday" header={t('Tuesday')} body={booleanIconTemplate} editor={(options) => booleanEditor(options)} style={{ minWidth: '100px' }} />
                    <Column field="wednesday" header={t('Wednesday')} body={booleanIconTemplate} editor={(options) => booleanEditor(options)} style={{ minWidth: '100px' }} />
                    <Column field="thursday" header={t('Thursday')} body={booleanIconTemplate} editor={(options) => booleanEditor(options)} style={{ minWidth: '100px' }} />
                    <Column field="friday" header={t('Friday')} body={booleanIconTemplate} editor={(options) => booleanEditor(options)} style={{ minWidth: '100px' }} />
                    <Column field="saturday" header={t('Saturday')} body={booleanIconTemplate} editor={(options) => booleanEditor(options)} style={{ minWidth: '100px' }} />
                    <Column field="sunday" header={t('Sunday')} body={booleanIconTemplate} editor={(options) => booleanEditor(options)} style={{ minWidth: '100px' }} />
                    <Column field="start_date" header={t('Start Date')} style={{ minWidth: '100px' }} />
                    <Column field="end_date" header={t('End Date')} style={{ minWidth: '100px' }} />
                </DataTable>
            ) : (
                <DataTable
                    header={header}
                    value={[]}
                    emptyMessage={
                        <div style={{ padding: '1rem 0', textAlign: 'center' }}>
                            {t('No service found.')}
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
                header={t('Add New Service')}
                visible={addNewVisible}
                style={{ width: "50vw" }}
                onHide={() => setAddNewVisible(false)}
                footer={footerContent}
            >
                <div className="row p-fluid">
                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                        <label htmlFor="service-id" className={formErrors.service_id ? 'required-field error' : 'required-field'}>
                            {t('Service ID')} <span className="required-asterisk">*</span>
                        </label>
                        <InputText 
                            id="service-id" 
                            name="service_id" 
                            value={formData.service_id} 
                            onChange={handleChange} 
                            className={`dropdown-edit-mode ${formErrors.service_id ? 'p-invalid' : ''}`}
                            placeholder={t('Choose')}
                            aria-required="true"
                        />
                        {formErrors.service_id && <small className="p-error">{t('This field is required')}</small>}
                    </div>

                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                        <label htmlFor="monday" className={formErrors.monday ? 'required-field error' : 'required-field'}>
                            {t('Monday')} <span className="required-asterisk">*</span>
                        </label>
                        <Dropdown
                            id="monday"
                            name="monday"
                            value={formData.monday}
                            options={choices}
                            onChange={handleChange}
                            placeholder={t('Choose')}
                        />
                        {formErrors.monday && <small className="p-error">{t('This field is required')}</small>}
                    </div>

                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                        <label htmlFor="tuesday" className={formErrors.tuesday ? 'required-field error' : 'required-field'}>
                            {t('Tuesday')} <span className="required-asterisk">*</span>
                        </label>
                        <Dropdown
                            id="tuesday"
                            name="tuesday"
                            value={formData.tuesday}
                            options={choices}
                            onChange={handleChange}
                            placeholder={t('Choose')}
                        />
                        {formErrors.tuesday && <small className="p-error">{t('This field is required')}</small>}
                    </div>

                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                        <label htmlFor="wednesday" className={formErrors.wednesday ? 'required-field error' : 'required-field'}>
                            {t('Wednesday')} <span className="required-asterisk">*</span>
                        </label>
                        <Dropdown
                            id="wednesday"
                            name="wednesday"
                            value={formData.wednesday}
                            options={choices}
                            onChange={handleChange}
                            placeholder={t('Choose')}
                        />
                        {formErrors.wednesday && <small className="p-error">{t('This field is required')}</small>}
                    </div>

                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                        <label htmlFor="thursday" className={formErrors.thursday ? 'required-field error' : 'required-field'}>
                            {t('Thursday')} <span className="required-asterisk">*</span>
                        </label>
                        <Dropdown
                            id="thursday"
                            name="thursday"
                            value={formData.thursday}
                            options={choices}
                            onChange={handleChange}
                            placeholder={t('Choose')}
                        />
                        {formErrors.thursday && <small className="p-error">{t('This field is required')}</small>}
                    </div>

                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                        <label htmlFor="friday" className={formErrors.friday ? 'required-field error' : 'required-field'}>
                            {t('Friday')} <span className="required-asterisk">*</span>
                        </label>
                        <Dropdown
                            id="friday"
                            name="friday"
                            value={formData.friday}
                            options={choices}
                            onChange={handleChange}
                            placeholder={t('Choose')}
                        />
                        {formErrors.friday && <small className="p-error">{t('This field is required')}</small>}
                    </div>

                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                        <label htmlFor="saturday" className={formErrors.saturday ? 'required-field error' : 'required-field'}>
                            {t('Saturday')} <span className="required-asterisk">*</span>
                        </label>
                        <Dropdown
                            id="saturday"
                            name="saturday"
                            value={formData.saturday}
                            options={choices}
                            onChange={handleChange}
                            placeholder={t('Choose')}
                        />
                        {formErrors.saturday && <small className="p-error">{t('This field is required')}</small>}
                    </div>

                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                        <label htmlFor="sunday" className={formErrors.sunday ? 'required-field error' : 'required-field'}>
                            {t('Sunday')} <span className="required-asterisk">*</span>
                        </label>
                        <Dropdown
                            id="sunday"
                            name="sunday"
                            value={formData.sunday}
                            options={choices}
                            onChange={handleChange}
                            placeholder={t('Choose')}
                        />
                        {formErrors.sunday && <small className="p-error">{t('This field is required')}</small>}
                    </div>

                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                        <label htmlFor="start_date" className={formErrors.start_date ? 'required-field error' : 'required-field'}>
                            {t('Start Date')} <span className="required-asterisk">*</span>
                        </label>
                        <Calendar
                            id="start_date"
                            name="start_date"
                            value={formData.start_date ? new Date(
                                formData.start_date.slice(0, 4),
                                formData.start_date.slice(4, 6) - 1,
                                formData.start_date.slice(6, 8)
                            ) : null}
                            onChange={handleDateChange}
                            dateFormat="dd/mm/yy"
                            showIcon
                            showButtonBar
                            placeholder={t('Choose Start Date')}
                        />
                        {formErrors.start_date && <small className="p-error">{t('This field is required')}</small>}
                    </div>

                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-field add-form-input">
                        <label htmlFor="end_date" className={formErrors.end_date ? 'required-field error' : 'required-field'}>
                            {t('End Date')} <span className="required-asterisk">*</span>
                        </label>
                        <Calendar
                            id="end_date"
                            name="end_date"
                            value={formData.end_date ? new Date(
                                formData.end_date.slice(0, 4),
                                formData.end_date.slice(4, 6) - 1,
                                formData.end_date.slice(6, 8)
                            ) : null}
                            onChange={handleDateChange}
                            dateFormat="dd/mm/yy"
                            showIcon
                            showButtonBar
                            placeholder={t('Choose End Date')}
                        />
                        {formErrors.end_date && <small className="p-error">{t('This field is required')}</small>}
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default Services;