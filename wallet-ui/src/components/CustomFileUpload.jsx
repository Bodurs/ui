import React, { useRef } from "react";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";

const CustomFileUpload = ({ title, onFileSelect }) => {
    const toast = useRef(null);
    const fileUploadRef = useRef(null);

    const onTemplateSelect = (event) => {
        onFileSelect(event.files[0].objectURL); // Seçilen dosyaları üst bileşene gönderiyoruz
    };

    const onTemplateClear = () => {
        toast.current.show({ severity: "warn", summary: t('Cleared'), detail: `${title} ${t('Files Removed')}`, life: 3000 });
        onFileSelect(null); // Dosyalar temizlendiğinde üst bileşene boş array gönderiyoruz
    };

    const headerTemplate = (options) => {
        const { className, chooseButton } = options;
        return (
            <div className={`${className} flex justify-content-between align-items-center`} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}>
                <span className="text-gray-600">{title}</span>
                <Tooltip target=".choose-btn" content={t('Choose')} position="bottom" />
                <div className="flex gap-2">{chooseButton}</div>
            </div>
        );
    };

    const itemTemplate = (file, props) => {
        return (
            <div className="flex align-items-center p-3 border-round-md border-1 surface-border">
                <img alt={file.name} role="presentation" src={file.objectURL} width={60} className="border-round" />
                <div className="ml-3">
                    <div className="text-lg font-medium">{file.name}</div>
                    <small className="text-gray-600">{new Date().toLocaleDateString()}</small>
                </div>
                <Tag className="ml-auto" severity="warning" value={`${(file.size / 1024).toFixed(3)} KB`} />
                <Button type="button" icon="pi pi-times" className="p-button-rounded p-button-danger ml-3" onClick={() => props.onRemove(file)} />
            </div>
        );
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <FileUpload
                ref={fileUploadRef}
                name="demo"
                multiple={false}
                accept="image/*"
                maxFileSize={1000000}
                onSelect={onTemplateSelect}
                onClear={onTemplateClear}
                headerTemplate={headerTemplate}
                itemTemplate={itemTemplate}
                emptyTemplate={() => <p className="m-0">No files selected.</p>}
                chooseOptions={{ icon: "pi pi-images", className: "p-button-rounded p-button-outlined choose-btn" }}
                cancelOptions={{ icon: "pi pi-times", className: "p-button-rounded p-button-danger cancel-btn" }}
            />
        </div>
    );
};

export default CustomFileUpload;