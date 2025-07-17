import React, { useRef } from 'react';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const ExportButtons = ({ dtRef, data, fileName, pdfColumns }) => {

    const exportMenu = useRef(null);
  
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
    // pdfColumns örneğin: ['ID', 'Name', 'E-Mail', 'Phone', 'Create Date']
    doc.autoTable({
      head: [pdfColumns],
      body: data.map(item => pdfColumns.map(col => item[col.toLowerCase().replace(/ /g, '_')])), 
      // Dikkat: verideki key isimleri ile pdfColumns içeriğinin eşleştiğinden emin olun.
    });
    doc.save(`${fileName}.pdf`);
  };

  return (
    <>
      <Menu model={exportButtons} popup ref={exportMenu} id="popup_menu_left" />
      <Button icon="pi pi-download" tooltip="Export" tooltipOptions={{ position: "top" }} onClick={(event) => exportMenu.current.toggle(event)} rounded text severity="secondary" aria-label="Export" />
    </>
  );
};

export default ExportButtons;
