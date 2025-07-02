import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import ApiService from '../../services/ApiService';

const Wallet = () => {
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    ApiService.get('/api/0/v1/acc/accwallet/get')
      .then(res => {
        if (res.data.success && res.data.data.length > 0) {
          setWallets(res.data.data);
        } else {
         
          setWallets([
            {
              id: 1,
              account_id: "001",
              balance: 1000,
              currency: "USD",
              iban: "US1234567890",
              label: "Wallet",
              status: "Active",
              created_at: "2025-01-01",
              updated_at: "2025-01-10"
            },
            {
              id: 2,
              account_id: "002",
              balance: 500,
              currency: "EUR",
              iban: "EU0987654321",
              label: "Wallet",
              status: "Inactive",
              created_at: "2025-02-01",
              updated_at: "2025-02-05"
            }
          ]);
        }
      })
      .catch(err => {
        console.error('API error:', err);
       
        setWallets([
          {
            id: 1,
            account_id: "001",
            balance: 1000,
            currency: "USD",
            iban: "US1234567890",
            label: " Wallet",
            status: "Active",
            created_at: "2025-01-01",
            updated_at: "2025-01-10"
          }
        ]);
      });
  }, []);

  return (
    <div>
      <h3>Wallet List</h3>
      <DataTable value={wallets} paginator rows={10} emptyMessage="No wallets found">
        <Column field="id" header="ID" />
        <Column field="account_id" header="Account ID" />
        <Column field="balance" header="Balance" />
        <Column field="currency" header="Currency" />
        <Column field="iban" header="IBAN" />
        <Column field="label" header="Label" />
        <Column field="status" header="Status" />
        <Column field="created_at" header="Created At" />
        <Column field="updated_at" header="Updated At" />
      </DataTable>
    </div>
  );
};

export default Wallet;
