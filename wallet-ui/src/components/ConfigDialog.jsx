import React, { useRef, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { TabView, TabPanel } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import ApiService from './../services/ApiService';
import { useAuth } from './../services/AuthContext';

const ConfigDialog = ({ title, id = null, terminalId, visible, setVisible, showDialog = true }) => {

    const { user } = useAuth();
    const toast = useRef(null);
    const [capks, setCapks] = useState([
        { parameter: "", value: "" }
    ]);
    const [emvAppLists, setEmvAppLists] = useState([
        { parameter: "", value: "" }
    ]);
    const [screens, setScreens] = useState([
        { parameter: "", value: "" }
    ]);
    const [terminalParams, setTerminalParams] = useState([
        { parameter: "", value: "" }
    ]);
    const [configId, setConfigId] = useState(null);

    useEffect(() => {
        if (terminalId) {
            getTerminalConfig();
        }
    }, [terminalId]);

    function transformToArray(input) {
        const obj = typeof input === 'string' ? JSON.parse(input) : input;
        return Object.keys(obj).map(key => ({
            parameter: key,
            value: obj[key]
        }));
    }

    async function getTerminalConfig() {
        try {
            const url = user.role === 'systemadmin' ? `/api/0/v1/ev/terminalconfig/get?organization_id=${Cookies.get('organization_id')}` : '/api/0/v1/ev/terminalconfig/get?';
            const response = await ApiService.get(url + '&terminal_id=' + terminalId);
            if (response.data.data.length > 0) {
                setCapks(transformToArray(response.data.data[0].capk));
                setEmvAppLists(transformToArray(response.data.data[0].emv_app_list));
                setScreens(transformToArray(response.data.data[0].screen));
                setTerminalParams(transformToArray(response.data.data[0].terminal_param));
                setConfigId(parseInt(response.data.data[0].id));
            } else {
                setCapks([
                    { parameter: "", value: "" }
                ]);
                setEmvAppLists([
                    { parameter: "", value: "" }
                ]);
                setScreens([
                    { parameter: "", value: "" }
                ]);
                setTerminalParams([
                    { parameter: "", value: "" }
                ]);
            }
        } catch (error) {
            console.error('GET request error:', error);
            throw error;
        }
    }


    function arrayToObject(arr) {
        return arr.reduce((obj, item) => {
            obj[item.parameter] = item.value;
            return obj;
        }, {});
    }

    const addRow = (type) => {

        if (type == "capks") {
            const hasEmptyField = capks.some(row => row.parameter.trim() === "" || row.value.trim() === "");
            if (hasEmptyField) {
                toast.current.show({
                    severity: 'error',
                    summary: t('Error'),
                    detail: t('Fill in all the lines first!'),
                    life: 2000,
                });
                return;
            }
            setCapks([...capks, { parameter: "", value: "" }]);
        } else if (type == 'emvapplists') {
            const hasEmptyField = emvAppLists.some(row => row.parameter.trim() === "" || row.value.trim() === "");
            if (hasEmptyField) {
                toast.current.show({
                    severity: 'error',
                    summary: t('Error'),
                    detail: t('Fill in all the lines first!'),
                    life: 2000,
                });
                return;
            }
            setEmvAppLists([...emvAppLists, { parameter: "", value: "" }]);
        } else if (type == 'screens') {
            const hasEmptyField = screens.some(row => row.parameter.trim() === "" || row.value.trim() === "");
            if (hasEmptyField) {
                toast.current.show({
                    severity: 'error',
                    summary: t('Error'),
                    detail: t('Fill in all the lines first!'),
                    life: 2000,
                });
                return;
            }
            setScreens([...screens, { parameter: "", value: "" }]);
        } else if (type == 'terminalparams') {
            const hasEmptyField = terminalParams.some(row => row.parameter.trim() === "" || row.value.trim() === "");
            if (hasEmptyField) {
                toast.current.show({
                    severity: 'error',
                    summary: t('Error'),
                    detail: t('Fill in all the lines first!'),
                    life: 2000,
                });
                return;
            }
            setTerminalParams([...terminalParams, { parameter: "", value: "" }]);
        }



    };

    const removeRow = (type, index) => {
        if (type == 'capks') {
            const updatedCapks = capks.filter((_, i) => i !== index);
            setCapks(updatedCapks);
        } else if (type == 'emvapplists') {
            const updatedEmvAppLists = emvAppLists.filter((_, i) => i !== index);
            setEmvAppLists(updatedEmvAppLists);
        } else if (type == 'screens') {
            const updatedScreens = screens.filter((_, i) => i !== index);
            setScreens(updatedScreens);
        } else if (type == 'terminalparams') {
            const updatedTerminalParams = terminalParams.filter((_, i) => i !== index);
            setTerminalParams(updatedTerminalParams);
        }

    };

    const updateRow = (type, index, field, value) => {
        if (type == "capks") {
            const updatedCapks = [...capks];
            updatedCapks[index][field] = value;
            setCapks(updatedCapks);
        } else if (type == "emvapplists") {
            const updatedEmvAppLists = [...emvAppLists];
            updatedEmvAppLists[index][field] = value;
            setEmvAppLists(updatedEmvAppLists);
        } else if (type == "screens") {
            const updatedScreens = [...screens];
            updatedScreens[index][field] = value;
            setScreens(updatedScreens);
        } else if (type == "terminalparams") {
            const updatedTerminalParams = [...terminalParams];
            updatedTerminalParams[index][field] = value;
            setTerminalParams(updatedTerminalParams);
        }

    };


    const dialogFooterContent = (
        <div>
            <Button label="Cancel" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
            <Button label="Save" icon="pi pi-check" onClick={() => handleSubmit()} autoFocus />
        </div>
    );


    const footerContent = (
        <div className="config-save-button-container">
            <div className="config-save-button">
                <Button label="Save" icon="pi pi-check" onClick={() => handleSubmit()} autoFocus />
            </div>
        </div>
    );

    const handleSubmit = async () => {
        try {
            let obj = {
                terminal_id: terminalId,
                capk: arrayToObject(capks),
                emv_app_list: arrayToObject(emvAppLists),
                screen: arrayToObject(screens),
                terminal_param: arrayToObject(terminalParams),
                organization_id: Cookies.get('organization_id')
            }
            if (configId) {
                obj.id = configId;
            }
            const response = await ApiService.post('/api/0/v1/ev/terminalconfig/save', obj);
            if (response?.result?.code == "0") {
                getTerminalConfig();
                toast.current.show({
                    severity: 'success',
                    summary: t('Success'),
                    detail: t('New config added!'),
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

    const tabView = (
        <div className="row p-fluid">
                    <TabView>
                        <TabPanel header="Terminal Parameters">
                            {terminalParams.map((row, index) => (
                                <div key={index} className="p-d-flex p-ai-center p-mb-2" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: '30px', justifyContent: 'center' }}>

                                    <FloatLabel>
                                        <InputText id={`parameter-${index}`} value={row.parameter} onChange={(e) => updateRow("terminalparams", index, "parameter", e.target.value)} />
                                        <label htmlFor="parameter">Parameter</label>
                                    </FloatLabel>

                                    {/* Value Input */}
                                    <FloatLabel>
                                        <InputText id={`value-${index}`} value={row.value} onChange={(e) => updateRow("terminalparams", index, "value", e.target.value)} />
                                        <label htmlFor="value">Value</label>
                                    </FloatLabel>

                                    {/* Add Button */}
                                    {index == 0 && (
                                        <Button icon="pi pi-plus" className="p-button-success add-button" type="button" onClick={(e) => {
                                            e.preventDefault();
                                            addRow("terminalparams");
                                        }} />
                                    )}

                                    {/* Remove Button (Sadece 1 satır kalınca kaldırılmaz) */}
                                    {index > 0 && (
                                        <Button icon="pi pi-minus" className="p-button-danger remove-button" type="button" onClick={() => removeRow("terminalparams", index)} />
                                    )}
                                </div>
                            ))}
                        </TabPanel>
                        <TabPanel header="Capk">
                            {capks.map((row, index) => (
                                <div key={index} className="p-d-flex p-ai-center p-mb-2" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: '30px', justifyContent: 'center' }}>

                                    <FloatLabel>
                                        <InputText id={`parameter-${index}`} value={row.parameter} onChange={(e) => updateRow("capks", index, "parameter", e.target.value)} />
                                        <label htmlFor="parameter">Parameter</label>
                                    </FloatLabel>

                                    {/* Value Input */}
                                    <FloatLabel>
                                        <InputText id={`value-${index}`} value={row.value} onChange={(e) => updateRow("capks", index, "value", e.target.value)} />
                                        <label htmlFor="value">Value</label>
                                    </FloatLabel>

                                    {/* Add Button */}
                                    {index == 0 && (
                                        <Button icon="pi pi-plus" className="p-button-success add-button" type="button" onClick={(e) => {
                                            e.preventDefault();
                                            addRow("capks");
                                        }} />
                                    )}

                                    {/* Remove Button (Sadece 1 satır kalınca kaldırılmaz) */}
                                    {index > 0 && (
                                        <Button icon="pi pi-minus" className="p-button-danger remove-button" type="button" onClick={() => removeRow("capks", index)} />
                                    )}
                                </div>
                            ))}
                        </TabPanel>
                        <TabPanel header="EMV App List">
                            {emvAppLists.map((row, index) => (
                                <div key={index} className="p-d-flex p-ai-center p-mb-2" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: '30px', justifyContent: 'center' }}>

                                    <FloatLabel>
                                        <InputText id={`parameter-${index}`} value={row.parameter} onChange={(e) => updateRow("emvapplists", index, "parameter", e.target.value)} />
                                        <label htmlFor="parameter">Parameter</label>
                                    </FloatLabel>

                                    {/* Value Input */}
                                    <FloatLabel>
                                        <InputText id={`value-${index}`} value={row.value} onChange={(e) => updateRow("emvapplists", index, "value", e.target.value)} />
                                        <label htmlFor="value">Value</label>
                                    </FloatLabel>

                                    {/* Add Button */}
                                    {index == 0 && (
                                        <Button icon="pi pi-plus" className="p-button-success add-button" type="button" onClick={(e) => {
                                            e.preventDefault();
                                            addRow("emvapplists");
                                        }} />
                                    )}

                                    {/* Remove Button (Sadece 1 satır kalınca kaldırılmaz) */}
                                    {index > 0 && (
                                        <Button icon="pi pi-minus" className="p-button-danger remove-button" type="button" onClick={() => removeRow("emvapplists", index)} />
                                    )}
                                </div>
                            ))}
                        </TabPanel>
                        <TabPanel header="Screen">
                            {screens.map((row, index) => (
                                <div key={index} className="p-d-flex p-ai-center p-mb-2" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: '30px', justifyContent: 'center' }}>

                                    <FloatLabel>
                                        <InputText id={`parameter-${index}`} value={row.parameter} onChange={(e) => updateRow("screens", index, "parameter", e.target.value)} />
                                        <label htmlFor="parameter">Parameter</label>
                                    </FloatLabel>

                                    {/* Value Input */}
                                    <FloatLabel>
                                        <InputText id={`value-${index}`} value={row.value} onChange={(e) => updateRow("screens", index, "value", e.target.value)} />
                                        <label htmlFor="value">Value</label>
                                    </FloatLabel>

                                    {/* Add Button */}
                                    {index == 0 && (
                                        <Button icon="pi pi-plus" className="p-button-success add-button" type="button" onClick={(e) => {
                                            e.preventDefault();
                                            addRow("screens");
                                        }} />
                                    )}

                                    {/* Remove Button (Sadece 1 satır kalınca kaldırılmaz) */}
                                    {index > 0 && (
                                        <Button icon="pi pi-minus" className="p-button-danger remove-button" type="button" onClick={() => removeRow("screens", index)} />
                                    )}
                                </div>
                            ))}
                            
                        </TabPanel>
                    </TabView>
                    { !showDialog && footerContent }
                </div>
    )


    return (
        <>
            <Toast ref={toast} />
            { showDialog ? <Dialog
                header={title}
                visible={visible}
                style={{ width: "50vw" }}
                onHide={() => setVisible(false)}
                footer={dialogFooterContent}
            >
                { tabView }
            </Dialog> : <>{ tabView }</> }
        </>
    );
};

export default ConfigDialog;
