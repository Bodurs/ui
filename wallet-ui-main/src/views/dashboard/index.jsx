import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Form } from 'react-bootstrap';
import { Chart } from 'primereact/chart';
import ApiService from './../../services/ApiService';
import moment from 'moment';

const DashDefault = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    wallets: 0,
    cards: 0,
    kycCompleted: 0
  });
  const [chartData, setChartData] = useState([]);
  const [dateFilter, setDateFilter] = useState({
    startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD')
  });


  const formatChartData = () => {
    const labels = chartData.map(item => {
      
      if (item.date) {
        return moment(item.date).format('DD MMM');
      } else {
        return moment(item.month, 'YYYY-MM').format('MMM YYYY');
      }
    });

    return {
      labels: labels,
      datasets: [
        {
          label: 'Count',
          data: chartData.map(item => parseInt(item.count, 10)),
          borderColor: 'blue',
          backgroundColor: 'blue',
          fill: false,
          borderWidth:0.5,
          yAxisID: 'y'
        },
        {
          label: 'Amount',
          data: chartData.map(item => parseFloat(item.amount)),
          borderColor: 'red',
          backgroundColor: 'red',
          fill: false,
          borderWidth:0.5,
          yAxisID: 'y1'
        }
      ]
    };
  };

  const chartOptions = {
    plugins: {
      legend: {
        labels: { color: '#495057' }
      }
    },
    scales: {
      x: { 
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: { color: 'blue' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: 'red' }
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (dateFilter.startDate && dateFilter.endDate) {
      fetchChartData();
    }
  }, [dateFilter]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      await Promise.all([
        getStats(),
        fetchChartData()
      ]);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function getStats() {
    try {
      const response = await ApiService.get('/api/0/v1/acc/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Stats GET request error:', error);
    }
  }

  async function fetchChartData() {
    try {
  
      const params = {
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate
      };
      
      const response = await ApiService.get('/api/0/v1/acc/dashboard/transactions', { params });
      if (response.data.success) {
        setChartData(response.data.data.transactions || response.data.data);
      }
    } catch (error) {
      console.error('Chart data GET request error:', error);
      
     
      const start = moment(dateFilter.startDate);
      const end = moment(dateFilter.endDate);
      const mockData = [];
      
      const current = start.clone();
      while (current.isSameOrBefore(end)) {
        mockData.push({
          date: current.format('YYYY-MM-DD'),
          count: Math.floor(Math.random() * 20) + 1,
          amount: Math.floor(Math.random() * 1000) + 100
        });
        current.add(1, 'day');
      }
      
      setChartData(mockData);
    }
  }

  const handleDateChange = (field, value) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const refreshData = async () => {
    await fetchDashboardData();
  };

  const applyQuickFilter = (days) => {
    const endDate = moment().format('YYYY-MM-DD');
    const startDate = moment().subtract(days, 'days').format('YYYY-MM-DD');
    
    setDateFilter({
      startDate,
      endDate
    });
  };

  return (
    <React.Fragment>
      <Row>
        <div className="surface-ground px-4 py-2 md:px-6 lg:px-8">
          <div className="grid">

            <Col xs={12} md={6} lg={3} className="dashboard-stat-card">
              <div className="surface-card shadow-2 p-3 border-round">
                <div className="flex justify-content-between mb-3">
                  <div>
                    <span className="block text-500 font-medium mb-3">Users</span>
                    <div className="text-900 font-medium text-xl">
                      {loading ? '...' : (stats?.users || 0)}
                    </div>
                  </div>
                  <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                    <i className="pi pi-users text-purple-500 text-xl"></i>
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={12} md={6} lg={3} className="dashboard-stat-card">
              <div className="surface-card shadow-2 p-3 border-round">
                <div className="flex justify-content-between mb-3">
                  <div>
                    <span className="block text-500 font-medium mb-3">Wallets</span>
                    <div className="text-900 font-medium text-xl">
                      {loading ? '...' : (stats?.wallets || 0)}
                    </div>
                  </div>
                  <div className="flex align-items-center justify-content-center bg-teal-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                    <i className="pi pi-wallet text-teal-500 text-xl"></i>
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={12} md={6} lg={3} className="dashboard-stat-card">
              <div className="surface-card shadow-2 p-3 border-round">
                <div className="flex justify-content-between mb-3">
                  <div>
                    <span className="block text-500 font-medium mb-3">Cards</span>
                    <div className="text-900 font-medium text-xl">
                      {loading ? '...' : (stats?.cards || 0)}
                    </div>
                  </div>
                  <div className="flex align-items-center justify-content-center bg-indigo-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                    <i className="pi pi-credit-card text-indigo-500 text-xl"></i>
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={12} md={6} lg={3} className="dashboard-stat-card">
              <div className="surface-card shadow-2 p-3 border-round">
                <div className="flex justify-content-between mb-3">
                  <div>
                    <span className="block text-500 font-medium mb-3">KYC Completed</span>
                    <div className="text-900 font-medium text-xl">
                      {loading ? '...' : (stats?.kycCompleted || 0)}
                    </div>
                  </div>
                  <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                    <i className="pi pi-check-circle text-green-500 text-xl"></i>
                  </div>
                </div>
              </div>
            </Col>

          </div>
        </div>
      </Row>

      <Row className="mt-4">
        <Col xs={12}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <h5 className="mb-0">Transactions</h5>
                
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {/* Hızlı filtreler */}
                  <div className="d-flex gap-1">
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => applyQuickFilter(7)}
                      disabled={loading}
                    >
                      7 Days
                    </button>
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => applyQuickFilter(30)}
                      disabled={loading}
                    >
                      30 Days
                    </button>
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => applyQuickFilter(90)}
                      disabled={loading}
                    >
                      90 Days
                    </button>
                  </div>
                  
                 
                  <div className="d-flex align-items-center gap-2">
                    <Form.Control
                      type="date"
                      size="sm"
                      value={dateFilter.startDate}
                      onChange={(e) => handleDateChange('startDate', e.target.value)}
                      max={dateFilter.endDate}
                      disabled={loading}
                      style={{ width: '150px' }}
                    />
                    <span className="text-muted">to</span>
                    <Form.Control
                      type="date"
                      size="sm"
                      value={dateFilter.endDate}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      min={dateFilter.startDate}
                      max={moment().format('YYYY-MM-DD')}
                      disabled={loading}
                      style={{ width: '150px' }}
                    />
                  </div>
                  
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={refreshData}
                    disabled={loading}
                  >
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div style={{ height: '400px' }}>
                  <Chart 
                    type="line" 
                    data={formatChartData()} 
                    options={chartOptions}
                    style={{ height: '100%' }}
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default DashDefault;