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
import { FloatLabel } from 'primereact/floatlabel';
import ApiService from '../../services/ApiService';
import { useAuth } from '../../services/AuthContext';
import ConfigDialog from '../../components/ConfigDialog';
import Cookies from 'js-cookie';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Configs = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const toast = useRef(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [addNewVisible, setAddNewVisible] = useState(true);

    return (
        <div className="dialog-page-container">
            <Toast ref={toast} />
            <ConfigDialog showDialog={false} title={"Add New Config"} terminalId={-1} visible={addNewVisible} setVisible={setAddNewVisible}></ConfigDialog>
        </div>
    );
};

export default Configs;