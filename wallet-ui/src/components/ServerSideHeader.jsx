import React, { useRef } from 'react';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { FilterMatchMode } from 'primereact/api';
import { Toast } from 'primereact/toast';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const ServerSideHeader = ({ dtRef, data, title, fileName, pdfColumns, filterOpen, setFilterOpen, filterContainer, clearFilters, showRefresh = false, refresh }) => {

  const exportMenu = useRef(null);
  const toast = useRef(null);
  
  const exportButtons = [
      { label: 'Csv Export', icon: 'pi pi-fw pi-file', command: () => { exportCSV(false) } },
      { label: 'Excel Export', icon: 'pi pi-fw pi-file-excel', command: () => { exportExcel() } },
      { label: 'Pdf Export', icon: 'pi pi-fw pi-file-pdf', command: () => { exportPdf() } }
    ];
  
  // CSV Export: Eğer DataTable ref'i sağlanırsa onun exportCSV fonksiyonunu kullanır.
  const exportCSV = () => {
    if (dtRef && dtRef.current && dtRef.current.exportCSV) {
      dtRef.current.exportCSV();
    }
  };

  // Excel Export: data prop'una gönderilen veriyi Excel'e dönüştürür.
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, fileName);
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  // PDF Export: pdfColumns prop'u, PDF exportunda başlıklar için kullanılacak.
  // data prop'u içerisindeki her satır için, pdfColumns'a göre değerleri alır.
  const exportPdf = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [pdfColumns],
      body: data.map(item => pdfColumns.map(col => item[col.toLowerCase().replace(/ /g, '_')])), 
    });
    doc.save(`${fileName}.pdf`);
  };

  

  return (
    <div>
      <Toast ref={toast} />
      <div className="flex justify-content-between align-items-center">
        <h5 className="m-0">{ title }</h5>
        <div className="flex align-items-center">
          <Menu model={exportButtons} popup ref={exportMenu} id="popup_menu_left" />
          { showRefresh && <Button icon="pi pi-sync" tooltip="Refresh" tooltipOptions={{ position: "top" }} onClick={() => refresh()} rounded text severity="secondary" aria-label="Refresh" /> }
          <Button icon="pi pi-download" tooltip="Export" tooltipOptions={{ position: "top" }} onClick={(event) => exportMenu.current.toggle(event)} rounded text severity="secondary" aria-label="Export" />
          <Button icon="pi pi-sort-alt-slash" tooltip="Clear Filters" tooltipOptions={{ position: "top" }} onClick={clearFilters} rounded text severity="danger" aria-label="Clear Filter" />
          <Button icon={filterOpen ? 'pi pi-filter-slash' : 'pi pi-filter'} tooltip={filterOpen ? 'Close Filter' : 'Open Filter'} tooltipOptions={{ position: "top" }} onClick={() => setFilterOpen(!filterOpen)} rounded text severity="secondary" className='right-10' aria-label="Export" />
        </div>
      </div>
      { filterOpen && filterContainer}
    </div>
      
  );
};

export default ServerSideHeader;
