import React, { useState, useEffect, useRef } from 'react';
import ApiService from '../../../../services/ApiService';
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { RadioButton } from "primereact/radiobutton";
import { FileUpload } from 'primereact/fileupload';
import { Tooltip } from "primereact/tooltip";
import { Tag } from "primereact/tag";
import CustomFileUpload from '../../../../components/CustomFileUpload';

const ConfigContent = ({ id, config }) => {

    const toast = useRef(null);
    const fileUploadRef = useRef(null);
    const [terminalId, setTerminalId] = useState("");
    const [terminalName, setTerminalName] = useState("");
    const [pageHeader, setPageHeader] = useState("");
    const [fastSelections, setFastSelections] = useState([
        { display: "", value: "" }
    ]);
    const [defaultSelection, setDefaultSelection] = useState({});
    const [selectionIndex, setSelectionIndex] = useState(0);

    const [footerLogo1, setFooterLogo1] = useState(null);
    const [footerLogo2, setFooterLogo2] = useState(null);
    const [footerLogo3, setFooterLogo3] = useState(null);

    const addRow = () => {        
        const hasEmptyField = fastSelections.some(row => row.display.trim() === "" || row.value.trim() === "");

        if (hasEmptyField) {
            toast.current.show({
                severity: 'error',
                summary: t('Error'),
                detail: t('Fill in all the lines first!'),
                life: 2000,
            });
            return;
        }

        setFastSelections([...fastSelections, { display: "", value: "" }]);
    };

    const removeRow = (index) => {
        const updatedFastSelections = fastSelections.filter((_, i) => i !== index);
        setFastSelections(updatedFastSelections);
    };

    const updateRow = (index, field, value) => {
        const updatedFastSelections = [...fastSelections];
        updatedFastSelections[index][field] = value;
        setFastSelections(updatedFastSelections);
    };

    useEffect(() => {
        if (config.length > 0) {
            setTerminalId(config[0].terminal_id);
            setTerminalName(config[0].terminal_name);
            setPageHeader(config[0].page_header);
            setFastSelections(JSON.parse(config[0].fast_selections));
            setDefaultSelection(JSON.parse(config[0].default_selection));
            setSelectionIndex(JSON.parse(config[0].fast_selections).findIndex(item => item.display === JSON.parse(config[0].default_selection).display && item.value === JSON.parse(config[0].default_selection).value) | 0);
            //setFooterLogo1(config[0].footer_logo1);
            //setFooterLogo2(config[0].footer_logo2);
            //setFooterLogo3(config[0].footer_logo3);
        }
    }, [config]);

    const handleUpdate = async (e) => {

        e.preventDefault();

        const hasEmptyField = fastSelections.some(row => row.display.trim() === "" || row.value.trim() === "");

        if (hasEmptyField) {
            toast.current.show({
                severity: 'error',
                summary: t('Error'),
                detail: t('Fill in all the lines first!'),
                life: 2000,
            });
            return;
        }

        try {
            const response = await ApiService.post('/api/0/v1/ev/posconfigs/save', {
                terminal_name: terminalName,
                page_header: pageHeader,
                fast_selections: JSON.stringify(fastSelections),
                default_selection: JSON.stringify(fastSelections[selectionIndex]),
                footer_logo1: footerLogo1,
                footer_logo2: footerLogo2,
                footer_logo3: footerLogo3,
                terminal_id: terminalId
            });
            toast.current.show({
                severity: 'success',
                summary: t('Success'),
                detail: t('Terminal configs edited!'),
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


    const onTemplateSelect = (event) => {
        console.log("Selected Files:", event.files);
    };

    const onTemplateClear = () => {
        toast.current.show({ severity: "warn", summary: t('Cleared'), detail: t('Files Removed'), life: 3000 });
        console.log("Cleared Files");
    };

    // Özel başlık (header) şablonu
    const headerTemplate = (options) => {
        const { className, chooseButton } = options;
        return (
            <div className={`${className} flex justify-content-between align-items-center`} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}>
                <span className="text-gray-600">Footer Logo 1</span>
                <Tooltip target=".choose-btn" content="Choose" position="bottom" />
                <div className="flex gap-2">
                    {chooseButton}
                </div>
                
            </div>
        );
    };

    // Dosya listeleme şablonu
    const itemTemplate = (file, props) => {
        return (
            <div className="flex align-items-center p-3 border-round-md border-1 surface-border">
                <img
                    alt={file.name}
                    role="presentation"
                    src={file.objectURL}
                    width={60}
                    className="border-round"
                />
                <div className="ml-3">
                    <div className="text-lg font-medium">{file.name}</div>
                    <small className="text-gray-600">{new Date().toLocaleDateString()}</small>
                </div>
                <Tag className="ml-auto" severity="warning" value={`${(file.size / 1024).toFixed(3)} KB`} />
                <Button
                    type="button"
                    icon="pi pi-times"
                    className="p-button-rounded p-button-danger ml-3"
                    onClick={() => props.onRemove(file)}
                />
            </div>
        );
    };
    return (
        <>
            <form onSubmit={handleUpdate}>
                <div className="row">
                    <div className="col-lg-4 col-md-6 col-sm-12 prime-input">
                        <FloatLabel>
                            <InputText id="terminal_id" value={terminalId} disabled />
                            <label htmlFor="terminal_id">Terminal ID</label>
                        </FloatLabel>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12 prime-input">
                        <FloatLabel>
                            <InputText id="terminal_name" value={terminalName} onChange={(e) => setTerminalName(e.target.value)} />
                            <label htmlFor="terminal_name">Terminal Name</label>
                        </FloatLabel>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12 prime-input">
                        <FloatLabel>
                            <InputText id="terminal_name" value={pageHeader} onChange={(e) => setPageHeader(e.target.value)} />
                            <label htmlFor="pageheader">Terminal Name</label>
                        </FloatLabel>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12 prime-input">
                        <CustomFileUpload title="Footer Logo 1" onFileSelect={setFooterLogo1} />
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12 prime-input">
                        <CustomFileUpload title="Footer Logo 2" onFileSelect={setFooterLogo2} />
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12 prime-input">
                        <CustomFileUpload title="Footer Logo 3" onFileSelect={setFooterLogo3} />
                    </div>
                </div>
                {fastSelections.map((row, index) => (
                <div key={index} className="p-d-flex p-ai-center p-mb-2" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: '40px' }}>
                    {/* Radio Button */}
                    <RadioButton
                        inputId={`rb-${index}`}
                        name="selectedRow"
                        value={index}
                        onChange={() => setSelectionIndex(index)}
                        checked={selectionIndex === index}
                        className='radioButton'
                    />

                    {/* Display Input */}
                    <FloatLabel>
                        <InputText id={`display-${index}`} value={row.display} onChange={(e) => updateRow(index, "display", e.target.value)}/>
                        <label htmlFor="display">Display</label>
                    </FloatLabel>

                    {/* Value Input */}
                    <FloatLabel>
                        <InputText id={`value-${index}`} value={row.value} onChange={(e) => updateRow(index, "value", e.target.value)}/>
                        <label htmlFor="value">Value</label>
                    </FloatLabel>

                    {/* Add Button */}
                    {index == 0 && (
                        <Button icon="pi pi-plus" className="p-button-success add-button" type="button" onClick={(e) => {
                            e.preventDefault();
                            addRow();
                        }}  />
                    )}

                    {/* Remove Button (Sadece 1 satır kalınca kaldırılmaz) */}
                    {index > 0 && (
                        <Button icon="pi pi-minus" className="p-button-danger remove-button" type="button" onClick={() => removeRow(index)} />
                    )}
                </div>
            ))}
                <br />
                <div className="row">
                    <div className="col-md-6 col-sm-12">
                        <Button type="submit" label="Submit" className="p-mt-3" />
                    </div>
                </div>
            </form>
            <Toast ref={toast} />
        </>
    );
};

export default ConfigContent;