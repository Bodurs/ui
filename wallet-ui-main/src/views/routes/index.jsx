import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/ApiService';  // Senin API servis dosyan

const Wallet = () => {
  const toast = useRef(null);
  const dt = useRef(null);

  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    iban: { value: null, matchMode: FilterMatchMode.CONTAINS },
    label: { value: null, matchMode: FilterMatchMode.CONTAINS },
    currency: { value: null, matchMode: FilterMatchMode.CONTAINS },
    balance: { value: null, matchMode: FilterMatchMode.EQUALS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS }
  });

 
  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      
      const response = await ApiService.get('/api/0/v1/acc/wallets/get');
      if (response?.data?.data) {
        setWallets(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load wallets' });
    }
  };

  const header = (
    <div className="flex justify-content-between align-items-center">
      <h5>Cüzdanlar</h5>
      <div>
        <Button
          type="button"
          icon="pi pi-refresh"
          onClick={fetchWallets}
          className="p-button-text"
          aria-label="Refresh"
        />
        <InputText
          type="search"
          placeholder="Genel Ara"
          onInput={(e) => setFilters({ ...filters, global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS } })}
          style={{ marginLeft: 8 }}
        />
      </div>
    </div>
  );

  return (
    <div className="datatable-demo">
      <Toast ref={toast} />
      <DataTable
        ref={dt}
        value={wallets}
        paginator
        rows={10}
        loading={loading}
        filters={filters}
        globalFilterFields={['iban', 'label', 'currency']}
        header={header}
        dataKey="id"
        responsiveLayout="scroll"
        emptyMessage="Kayıt bulunamadı"
      >
        <Column field="iban" header="IBAN" filter filterPlaceholder="IBAN ile ara" style={{ minWidth: '200px' }} />
        <Column field="label" header="Etiket" filter filterPlaceholder="Etiket ile ara" style={{ minWidth: '150px' }} />
        <Column field="currency" header="Para Birimi" filter filterPlaceholder="Para birimi ile ara" style={{ minWidth: '100px' }} />
        <Column field="balance" header="Bakiye" filter filterPlaceholder="Bakiye ile ara" style={{ minWidth: '120px' }} />
        <Column field="status" header="Durum" filter filterPlaceholder="Durum ile ara" style={{ minWidth: '100px' }} body={(row) => (row.status === 1 ? 'Aktif' : 'Pasif')} />
      </DataTable>
    </div>
  );
};

export default Wallet;
