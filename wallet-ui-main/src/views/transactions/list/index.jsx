import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Sidebar } from 'primereact/sidebar';
import { TabView, TabPanel } from 'primereact/tabview';
import { Timeline } from 'primereact/timeline';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import ApiService from './../../../services/ApiService';
import { useAuth } from './../../../services/AuthContext';
import ServerSideHeader from './../../../components/ServerSideHeader';
import config from './../../../config';
import { buildQueryParams } from './../../../hooks/buildQueryParams';
import Cookies from 'js-cookie';
import moment from 'moment';

const TransactionsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const terminalId = searchParams.get('terminal_id') || '';

  const statusMap = {
    0: {
      title: "Unsuccessful",
      subTitle: "Transaction could not be completed.",
      icon: <i className="pi pi-times-circle transaction-detail-status-fail" />,
    },
    1: {
      title: "Authorized",
      subTitle: "Transaction completed successfully!",
      icon: <i className="pi pi-check-circle transaction-detail-status-success" />,
    },
    2: {
      title: "Reversal",
      subTitle: "Transaction was reversed.",
      icon: <i className="pi pi-refresh transaction-detail-status-reversal" />,
    },
    3: {
      title: "Settled",
      subTitle: "Transaction settled successfully.",
      icon: <i className="pi pi-check transaction-detail-status-settled" />,
    },
  };

  const toast = useRef(null);
  const exportMenu = useRef(null);
  const [transactions, setTransactions] = useState([]);
  const [expandedRows, setExpandedRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allowEdit, setAllowEdit] = useState(true);
  const [filterOpen, setFilterOpen] = useState(true);
  const [terminals, setTerminals] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [metaKey, setMetaKey] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [detailInfo, setDetailInfo] = useState({});
  const [currentStatus, setCurrentStatus] = useState({});
  const [planMessageJson, setPlanMessageJson] = useState(null);
  const [planMessageDialog, setPlanMessageDialog] = useState(false);

  const dt = useRef(null);
  const today = new Date();
  const pdfColumns = ['ID', 'Date Time', 'Terminal Id', 'Masked Pan', 'Terminal Name', 'Session Id', 'Token Id', 'Amount', 'Status',
    'Acquirer Ref Id', 'f38 Approval Code', 'f39 Response Code', 'f41 Terminal Id', 'f55 Emv Data', 'f23 Pan Sequence Number',
    'f14 Expired Date', 'f13 Local Transaction Date', 'f12 Transaction Time', 'f11 Stan', 'f03 Processing Code',
    'Message Type', 'f37 RRN', 'Clearing Date', 'Plan Message', 'Advice', 'Clearing File', 'Created At'
  ];


  const [filters, setFilters] = useState({
    terminal_id: { value: '', matchMode: FilterMatchMode.EQUALS },
    masked_pan: { value: '', matchMode: FilterMatchMode.EQUALS },
    start_date: { value: new Date(), matchMode: FilterMatchMode.EQUALS },
    end_date: { value: new Date(), matchMode: FilterMatchMode.EQUALS }
  });

  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 20,
    sortField: 'date_time',
    sortOrder: -1,
    filters: {
      start_date: { value: new Date(), matchMode: FilterMatchMode.EQUALS },
      end_date: { value: new Date(), matchMode: FilterMatchMode.EQUALS }
    }
  });

  useEffect(() => {
    getTransactions();
  }, [lazyParams]);

  const refreshTransactions = () => {
    getTransactions();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: {
        ...prevFilters[name],
        value: value
      }
    }));
  };

  // Calendar için
  const handleDateChange = (name, e) => {
    setFilters((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        value: e.value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setLazyParams((prev) => {
      const newFilters = Object.entries(filters).reduce((acc, [key, filter]) => {
        // Eğer filter value boş veya null değilse ekle, aynı yapı ile
        if (filter.value !== '' && filter.value != null) {
          acc[key] = { value: filter.value, matchMode: filter.matchMode };
        }
        return acc;
      }, {});

      return {
        ...prev,
        first: 0,
        filters: newFilters,
      };
    });
  };

  useEffect(() => {
    getTransactions();
    getTerminals();
  }, []);

  async function getTerminals() {
    setLoading(true);
    try {
      const url = user.role === 'systemadmin' ? `/api/0/v1/ev/terminal/get?organization_id=${Cookies.get('organization_id')}` : '/api/0/v1/ev/terminal/get';
      const response = await ApiService.get(url);
      setTerminals(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('GET request error:', error);
      setLoading(false);
      throw error;
    }
  }

  async function getTransactions() {
    const queryParams = buildQueryParams(lazyParams, 'clearing_date');
    if (queryParams.includes('filters=')) {
      setLoading(true);
      try {
        const response = await ApiService.get(`/api/0/v1/ev/transaction/get?${queryParams}`);
        setTransactions(response.data.data);
        setTotalRecords(response.data.recordsTotal);
        setLoading(false);
      } catch (error) {
        console.error('GET request error:', error);
        setLoading(false);
        throw error;
      }
    }
  }

  async function getTransactionHistory(sessionId) {
    setLoading(true);
    try {
      const url = `/api/0/v1/ev/terminallog/get?filters=session_id|${sessionId}`;
      const response = await ApiService.get(url);
      setTransactionHistory(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('GET request error:', error);
      setLoading(false);
      throw error;
    }
  }

  const dateBodyTemplate = (rowData) => {
    //return new Date(rowData.created_at).toLocaleDateString();
    return moment(rowData.created_at).format('DD.MM.YYYY HH:mm:ss');
  };

  const dateStringTemplate = (rowData) => {
    if (!rowData.date_time) return "";
    return moment(rowData.date_time, "YYYYMMDDHHmmss").format("DD/MM/YYYY HH:mm:ss");
  };

  const clearFilters = () => {
    setFilters({
      terminal_id: { value: '', matchMode: FilterMatchMode.EQUALS },
      masked_pan: { value: '', matchMode: FilterMatchMode.EQUALS },
      start_date: { value: new Date(), matchMode: FilterMatchMode.EQUALS },
      end_date: { value: new Date(), matchMode: FilterMatchMode.EQUALS }
    });
    setLazyParams((prev) => ({
      ...prev,
      first: 0,
      sortField: null,
      sortOrder: null,
      filters: {
        start_date: { value: new Date(), matchMode: FilterMatchMode.EQUALS },
        end_date: { value: new Date(), matchMode: FilterMatchMode.EQUALS }
      }
    }));
    toast.current.show({
      severity: 'success',
      summary: t('Success'),
      detail: t('Data table filters cleared!'),
      life: 2000,
    });
  };

  const myPaginatorTemplate = {
    layout: 'RowsPerPageDropdown PrevPageLink PageLinks NextPageLink CurrentPageReport',
    RowsPerPageDropdown: (options) => {
      return <div className="my-paginator-left">{options.element}</div>;
    },
    CurrentPageReport: (options) => {
      options.element = `Showing ${options.first} to ${options.last} of ${options.totalRecords} entries`;
      return <div className="my-paginator-right">{options.element}</div>;
    }
  };

  const filterContainer = (
    <div>
      <Divider />
      <form onSubmit={handleSubmit} className="p-fluid">
        <div className="row">
          <div className="p-field col-lg-2 col-xl-2 col-md-3 col-sm-6 col-xs-12">
            <label className="filter-label" htmlFor="terminalId">Terminal ID</label>
            <InputText className="filter-input" id="terminalId" name="terminal_id" value={filters.terminal_id.value} onChange={handleChange} />
          </div>
          <div className="p-field col-lg-2 col-xl-2 col-md-3 col-sm-6 col-xs-12">
            <label className="filter-label" htmlFor="maskedPan">Masked Pan</label>
            <InputText className="filter-input" id="maskedPan" name="masked_pan" value={filters.masked_pan.value} onChange={handleChange} />
          </div>
          <div className="p-field col-lg-2 col-xl-2 col-md-3 col-sm-6 col-xs-12">
            <label className="filter-label" htmlFor="startDate">Başlangıç Tarihi</label>
            <Calendar
              className="filter-dropdown"
              id="startDate"
              name="start_date"
              value={filters.start_date.value}
              onChange={(e) => handleDateChange('start_date', e)}
              dateFormat="dd.mm.yy"
              placeholder="Start Date"
              showIcon
            />
          </div>
          <div className="p-field col-lg-2 col-xl-2 col-md-3 col-sm-6 col-xs-12">
            <label className="filter-label" htmlFor="endDate">Bitiş Tarihi</label>
            <Calendar
              className="filter-dropdown"
              id="endDate"
              name="end_date"
              value={filters.end_date.value}
              onChange={(e) => handleDateChange('end_date', e)}
              dateFormat="dd.mm.yy"
              placeholder="End Date"
              showIcon
            />
          </div>
          <div className="p-field col-lg-2 col-xl-2 col-md-3 col-sm-6 col-xs-12">
            <Button type="submit" label="Search" className='search-button' severity="secondary" />
          </div>
        </div>

      </form>
    </div>
  );

  const showPlanMessage = (planMessage) => {
    planMessage = planMessage.replace(/\\\"/g, '\"');
    try {
      const parsed = typeof planMessage === 'string' ? JSON.parse(planMessage) : planMessage;
      planMessage = JSON.stringify(parsed, null, 2);
    } catch (error) {
      console.error("JSON parse error:", error);
    }
    setPlanMessageJson(planMessage);
    setPlanMessageDialog(true);
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.current.show({
      severity: 'success',
      summary: t('Success'),
      detail: t('EMV data copied!'),
      life: 2000,
  });
  }

  const rowExpansionTemplate = (rowData) => {

    return (
      <div className="transaction-detail-table">
        <table>
          <tbody>
            <tr>
              <td className="transaction-data-name">Clearing Date:</td>
              <td>{moment(rowData.clearing_date).format('DD.MM.YYYY HH:mm:ss')}</td>
            </tr>
            <tr>
              <td className="transaction-data-name">Session ID:</td>
              <td>{rowData.session_id}</td>
            </tr>
            <tr>
              <td className="transaction-data-name">Token ID:</td>
              <td>{rowData.token_id}</td>
            </tr>
            <tr>
              <td className="transaction-data-name">Terminal Name:</td>
              <td>{rowData.terminal_name}</td>
            </tr>
            <tr>
              <td className="transaction-data-name">Acquirer ID:</td>
              <td>{rowData.acquirer_ref_id}</td>
            </tr>
            <tr>
              <td>EMV Data:</td>
              <td className="table-cell-copy">{rowData.f55_emv_data.substr(0, 100)}... <Button icon="pi pi-copy" tooltip="Copy to Clipboard" tooltipOptions={{ position: "top" }} onClick={() => copyToClipboard(rowData.f55_emv_data)} rounded text severity="secondary" aria-label="Copy" /></td>
            </tr>
            <tr>
              <td>Pan Sequence:</td>
              <td>{rowData.f23_pan_sequence_number}</td>
            </tr>
            <tr>
              <td>Expire Date:</td>
              <td>{rowData.f14_expired_date}</td>
            </tr>
            <tr>
              <td>Local Transaction Date:</td>
              <td>{rowData.f13_local_transaction_date}</td>
            </tr>
            <tr>
              <td>Transaction Time:</td>
              <td>{rowData.f12_transaction_time}</td>
            </tr>
            <tr>
              <td>Processing Code:</td>
              <td>{rowData.f03_processing_code}</td>
            </tr>
            <tr className="clickable-table-row" onClick={() => showPlanMessage(rowData.plan_message)}>
              <td>Plan Message</td>
              <td>{rowData.plan_message}</td>
            </tr>
            <tr>
              <td>Clearing File:</td>
              <td>{rowData.clearing_file}</td>
            </tr>
            <tr>
              <td>Create Date:</td>
              <td>{moment(rowData.created_at).format('DD.MM.YYYY HH:mm:ss')}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const onRowExpand = (event) => {
    console.log('Row expanded:', event.data);
  };

  const onRowCollapse = (event) => {
    console.log('Row collapsed:', event.data);
  };


  const padValue = (rowData, column) => {
    const value = rowData[column.field];
    if (value) {
      return String(value).padStart(8, '0'); // değeri 8 karaktere tamamlamak için başına 0 ekler
    } else {
      return "";
    }
  };

  const showDetails = async (row) => {
    await getTransactionHistory(row.session_id);
    setShowDetail(true);
    setDetailInfo(row);
    setCurrentStatus(statusMap[row.status] || {
      title: "Unknown",
      subTitle: "Status information is not available.",
      icon: <i className="pi pi-question-circle transaction-detail-status-unknown" />,
    })
  };

  const buttonColumnTemplate = (rowData) => {
    return (
      <div className="justify-center">
        <Button className='grid-icon-button' icon="pi pi-search" onClick={() => showDetails(rowData)} rounded text severity="secondary" aria-label="Details" tooltip="Show Details" tooltipOptions={{ position: "top" }} />
      </div>
    );
  };

  function detailDesc(description) {
    // Gelen veri string mi?
    if (typeof description === 'string') {
      try {
        const parsed = JSON.parse(description.replace(/\\\"/g, '\"'));
        return parsed.data.messageType;
      } catch (error) {
        return description;
      }
    } else {
      return description;
    }
  }

  return (
    <div className={`datatable-doc-demo ${filterOpen ? 'filter-open' : ''}`}>
      <Toast ref={toast} />
      <DataTable scrollable stripedRows ref={dt} lazy value={transactions} rowsPerPageOptions={[20, 50, 100, 500, 1000]} paginator showGridlines rows={lazyParams.rows} loading={loading} dataKey="id"
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        onRowExpand={onRowExpand}
        onRowCollapse={onRowCollapse}
        rowExpansionTemplate={rowExpansionTemplate}
        header={<ServerSideHeader
          dtRef={dt}
          data={transactions}
          title="Transactions"
          fileName="transactions"
          pdfColumns={pdfColumns}
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
          lazyParams={lazyParams}
          setLazyParams={setLazyParams}
          filters={filters}
          setFilters={setFilters}
          filterContainer={filterContainer}
          clearFilters={clearFilters}
          showRefresh={true}
          refresh={refreshTransactions}
        />} autolayout="true" onPage={(e) => setLazyParams((prev) => ({ ...prev, first: e.first, rows: e.rows }))}
        selectionMode="multiple"
        selection={selectedRows}
        onSelectionChange={(e) => setSelectedRows(e.value)}
        metaKeySelection={metaKey}
        dragSelection
        rowClassName={(data) =>
          selectedRows && selectedRows.find(row => row.id === data.id) ? 'highlight-row' : ''
        }
        emptyMessage="No transaction found." totalRecords={totalRecords} first={lazyParams.first} sortField={lazyParams.sortField}
        paginatorTemplate={myPaginatorTemplate} sortOrder={lazyParams.sortOrder}
        onSort={(e) =>
          setLazyParams((prev) => ({ ...prev, sortField: e.sortField, sortOrder: e.sortOrder }))
        }>
        <Column expander style={{ width: '3rem' }} />
        <Column body={buttonColumnTemplate} />
        <Column field="id" header="ID" style={{ display: 'none' }} />
        <Column field="status" header="Status" body={(rowData) => {
          const statusMap = {
            0: { label: "NoAuth", className: "bg-secondary text-white" },
            1: { label: "Auth", className: "bg-success text-white" },
            2: { label: "Reversal", className: "bg-warning text-dark" },
            3: { label: "Settled", className: "bg-primary text-white" },
          };

          const status = statusMap[rowData.status] || { label: "Error", className: "bg-danger text-white" };

          return (
            <span
              className={`badge ${status.className}`}
              style={{
                borderRadius: "6px",
                padding: "6px 6px",
                fontWeight: "600",
                fontSize: "0.85rem",
              }}
            >
              {status.label}
            </span>
          );
        }}/>
        <Column field="date_time" header="Datetime" sortable dataType="date" body={dateStringTemplate} style={{ maxWidth: "200px" }}
          bodyStyle={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }} />
        <Column field="terminal_id" body={padValue} header="Terminal ID" />
        <Column field="masked_pan" header="Masked Pan" />
        <Column field="amount" header="Amount" />
        <Column field="payment_gateway_name" header="Pay. Gateway" />
        
        <Column field="advice" header="Advice" />
        <Column field="message_type" header="MTI" />
        <Column field="f38_approval_code" header="Approval Code" />
        <Column field="f39_response_code" header="Response Code" />
        <Column field="f11_stan" header="Stan" />
        <Column field="f37_rrn" header="RRN" />

      </DataTable>
      <Dialog header="Plan Message" visible={planMessageDialog} onHide={() => setPlanMessageDialog(false)} style={{ width: '50vw' }}>
        <pre>{planMessageJson}</pre>
      </Dialog>
      <Sidebar visible={showDetail} position="right" onHide={() => setShowDetail(false)}>
        <TabView>
          <TabPanel header="Details">
            <Card
              title={currentStatus.title}
              subTitle={currentStatus.subTitle}
              header={currentStatus.icon}
              className="md:w-25rem"
            >
              <p className="m-0 transaction-amount">
                {(detailInfo.amount / 100).toFixed(2)} TRY
              </p>
            </Card>
          </TabPanel>
          <TabPanel header="History">
            <Timeline
              align="left"
              value={transactionHistory}
              opposite={(item) => detailDesc(item.description)}               // soldaki içerik
              content={(item) => <small>{moment(item.time_stamp).format('DD.MM.YYYY HH:mm:ss.SSS')}</small>} // sağdaki içerik
            />
          </TabPanel>

          {/*<TabPanel header="Customer">
            <p className="m-0">
              At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti
              quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in
              culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.
              Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
            </p>
          </TabPanel>*/}
        </TabView>
      </Sidebar>
    </div>
  );
};

export default TransactionsList;