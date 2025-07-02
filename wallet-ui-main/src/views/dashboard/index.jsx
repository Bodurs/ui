import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import { Row, Col, Card, Table, Tabs, Tab } from 'react-bootstrap';
import { Chart } from 'primereact/chart';
import ApiService from './../../services/ApiService';
import moment from 'moment';

const DashDefault = () => {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [last7Days, setLast7Days] = useState([]);
  const [last12Month, setLast12Month] = useState([]);

  const last12ChartData = {
    labels: last12Month.map(item => moment(item.mounth, 'YYYYMM').format('MMM YYYY')),
    datasets: [
      {
        label: 'Count',
        data: last12Month.map(item => parseInt(item.cnt, 10)),
        borderColor: 'blue',
        backgroundColor: 'blue',
        fill: false,
        yAxisID: 'y'
      },
      {
        label: 'Amount',
        data: last12Month.map(item => parseInt(item.amount, 10)),
        borderColor: 'red',
        backgroundColor: 'red',
        fill: false,
        yAxisID: 'y1'
      }
    ]
  };

  const last12ChartOptions = {
    plugins: {
      legend: {
        labels: {
          color: '#495057'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          // Alternatif: burada da formatlama yapabilirsiniz.
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: {
          color: 'blue'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          color: 'red'
        }
      }
    }
  };

  const last7ChartData = {
    labels: last7Days.map(item => moment(item.clearing_date).format('DD MMM YYYY')),
    datasets: [
      {
        label: 'Count',
        data: last7Days.map(item => parseInt(item.cnt, 10)),
        borderColor: 'blue',
        backgroundColor: 'blue',
        fill: false,
        yAxisID: 'y'
      },
      {
        label: 'Amount',
        data: last7Days.map(item => parseInt(item.amount, 10)),
        borderColor: 'red',
        backgroundColor: 'red',
        fill: false,
        yAxisID: 'y1'
      }
    ]
  };

  const last7ChartOptions = {
    plugins: {
      legend: {
        labels: {
          color: '#495057'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          // Alternatif: burada da formatlama yapabilirsiniz.
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: {
          color: 'blue'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          color: 'red'
        }
      }
    }
  };

  useEffect(() => {
    getStats();
    getLast7Days();
    getLast12Months();
  }, []);

  async function getStats() {
    setLoading(true);
    try {
      const response = await ApiService.get('/api/0/v1/ev/dashboard/stats');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('GET request error:', error);
      setLoading(false);
      throw error;
    }
  }

  async function getLast12Months() {
    setLoading(true);
    try {
      const response = await ApiService.get('/api/0/v1/ev/dashboard/last12Month');
      console.log("respsns", response.data.data);
      setLast12Month(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('GET request error:', error);
      setLoading(false);
      throw error;
    }
  }

  async function getLast7Days() {
    setLoading(true);
    try {
      const response = await ApiService.get('/api/0/v1/ev/dashboard/last7Day');
      setLast7Days(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('GET request error:', error);
      setLoading(false);
      throw error;
    }
  }

  return (
    <React.Fragment>
      <Row>

        <div className="surface-ground px-4 py-5 md:px-6 lg:px-8">
          <div className="grid">
            <Col key={`customer-stats`} xs={12} md={6} lg={4} xl={4} xxl={4} className="dashboard-stat-card" onClick={() => navigate('/customers')}>
              <div className="surface-card shadow-2 p-3 border-round">
                <div className="flex justify-content-between mb-3">
                  <div>
                    <span className="block text-500 font-medium mb-3">Customer</span>
                    <div className="text-900 font-medium text-xl">{stats?.customers}</div>
                  </div>
                  <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                    <i className="pi pi-briefcase text-blue-500 text-xl"></i>
                  </div>
                </div>
              </div>
            </Col>
            <Col key={`terminal-stats`} xs={12} md={6} lg={4} xl={4} xxl={4} className="dashboard-stat-card" onClick={() => navigate('/terminal')}>
              <div className="surface-card shadow-2 p-3 border-round">
                <div className="flex justify-content-between mb-3">
                  <div>
                    <span className="block text-500 font-medium mb-3">Terminals</span>
                    <div className="text-900 font-medium text-xl">{stats?.terminals}</div>
                  </div>
                  <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                    <i className="pi pi-mobile text-orange-500 text-xl"></i>
                  </div>
                </div>
              </div>
            </Col>
            <Col key={`organization-stats`} xs={12} md={6} lg={4} xl={4} xxl={4} className="dashboard-stat-card" onClick={() => navigate('/regions')}>
              <div className="surface-card shadow-2 p-3 border-round">
                <div className="flex justify-content-between mb-3">
                  <div>
                    <span className="block text-500 font-medium mb-3">Regions</span>
                    <div className="text-900 font-medium text-xl">{stats?.organization_regions}</div>
                  </div>
                  <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                    <i className="pi pi-map text-cyan-500 text-xl"></i>
                  </div>
                </div>
              </div>
            </Col>
          </div>
        </div>

      </Row>
      <Row>

        <Col key={`line-chart-stats`} md={12} xl={6} xxl={6}>
          <Card>
            <Card.Header>
              Last 7 Days
            </Card.Header>
            <Card.Body>
              <Chart type="line" data={last7ChartData} options={last7ChartOptions} />
            </Card.Body>
          </Card>
        </Col>
        <Col key={`line-chart-stats`} md={12} xl={6} xxl={6}>
          <Card>
          <Card.Header>
              Last 12 Months
            </Card.Header>
            <Card.Body>
              <Chart type="line" data={last12ChartData} options={last12ChartOptions} />
            </Card.Body>
          </Card>
        </Col>
        {/*
        <Col md={6} xl={8}>
          <Card className="Recent-Users widget-focus-lg">
            <Card.Header>
              <Card.Title as="h5">Recent Users</Card.Title>
            </Card.Header>
            <Card.Body className="px-0 py-2">
              <Table responsive hover className="recent-users">
                <tbody>
                  <tr className="unread">
                    <td>
                      <img className="rounded-circle" style={{ width: '40px' }} src={avatar1} alt="activity-user" />
                    </td>
                    <td>
                      <h6 className="mb-1">Isabella Christensen</h6>
                      <p className="m-0">Lorem Ipsum is simply dummy text of…</p>
                    </td>
                    <td>
                      <h6 className="text-muted">
                        <i className="fa fa-circle text-c-green f-10 m-r-15" />
                        11 MAY 12:56
                      </h6>
                    </td>
                    <td>
                      <Link to="#" className="label theme-bg2 text-white f-12">
                        Reject
                      </Link>
                      <Link to="#" className="label theme-bg text-white f-12">
                        Approve
                      </Link>
                    </td>
                  </tr>
                  <tr className="unread">
                    <td>
                      <img className="rounded-circle" style={{ width: '40px' }} src={avatar2} alt="activity-user" />
                    </td>
                    <td>
                      <h6 className="mb-1">Mathilde Andersen</h6>
                      <p className="m-0">Lorem Ipsum is simply dummy text of…</p>
                    </td>
                    <td>
                      <h6 className="text-muted">
                        <i className="fa fa-circle text-c-red f-10 m-r-15" />
                        11 MAY 10:35
                      </h6>
                    </td>
                    <td>
                      <Link to="#" className="label theme-bg2 text-white f-12">
                        Reject
                      </Link>
                      <Link to="#" className="label theme-bg text-white f-12">
                        Approve
                      </Link>
                    </td>
                  </tr>
                  <tr className="unread">
                    <td>
                      <img className="rounded-circle" style={{ width: '40px' }} src={avatar3} alt="activity-user" />
                    </td>
                    <td>
                      <h6 className="mb-1">Karla Sorensen</h6>
                      <p className="m-0">Lorem Ipsum is simply dummy text of…</p>
                    </td>
                    <td>
                      <h6 className="text-muted">
                        <i className="fa fa-circle text-c-green f-10 m-r-15" />9 MAY 17:38
                      </h6>
                    </td>
                    <td>
                      <Link to="#" className="label theme-bg2 text-white f-12">
                        Reject
                      </Link>
                      <Link to="#" className="label theme-bg text-white f-12">
                        Approve
                      </Link>
                    </td>
                  </tr>
                  <tr className="unread">
                    <td>
                      <img className="rounded-circle" style={{ width: '40px' }} src={avatar1} alt="activity-user" />
                    </td>
                    <td>
                      <h6 className="mb-1">Ida Jorgensen</h6>
                      <p className="m-0">Lorem Ipsum is simply dummy text of…</p>
                    </td>
                    <td>
                      <h6 className="text-muted f-w-300">
                        <i className="fa fa-circle text-c-red f-10 m-r-15" />
                        19 MAY 12:56
                      </h6>
                    </td>
                    <td>
                      <Link to="#" className="label theme-bg2 text-white f-12">
                        Reject
                      </Link>
                      <Link to="#" className="label theme-bg text-white f-12">
                        Approve
                      </Link>
                    </td>
                  </tr>
                  <tr className="unread">
                    <td>
                      <img className="rounded-circle" style={{ width: '40px' }} src={avatar2} alt="activity-user" />
                    </td>
                    <td>
                      <h6 className="mb-1">Albert Andersen</h6>
                      <p className="m-0">Lorem Ipsum is simply dummy text of…</p>
                    </td>
                    <td>
                      <h6 className="text-muted">
                        <i className="fa fa-circle text-c-green f-10 m-r-15" />
                        21 July 12:56
                      </h6>
                    </td>
                    <td>
                      <Link to="#" className="label theme-bg2 text-white f-12">
                        Reject
                      </Link>
                      <Link to="#" className="label theme-bg text-white f-12">
                        Approve
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={4}>
          <Card className="card-event">
            <Card.Body>
              <div className="row align-items-center justify-content-center">
                <div className="col">
                  <h5 className="m-0">Upcoming Event</h5>
                </div>
                <div className="col-auto">
                  <label className="label theme-bg2 text-white f-14 f-w-400 float-end">34%</label>
                </div>
              </div>
              <h2 className="mt-2 f-w-300">
                45<sub className="text-muted f-14">Competitors</sub>
              </h2>
              <h6 className="text-muted mt-3 mb-0">You can participate in event </h6>
              <i className="fab fa-angellist text-c-purple f-50" />
            </Card.Body>
          </Card>
          <Card>
            <Card.Body className="border-bottom">
              <div className="row d-flex align-items-center">
                <div className="col-auto">
                  <i className="feather icon-zap f-30 text-c-green" />
                </div>
                <div className="col">
                  <h3 className="f-w-300">235</h3>
                  <span className="d-block text-uppercase">total ideas</span>
                </div>
              </div>
            </Card.Body>
            <Card.Body>
              <div className="row d-flex align-items-center">
                <div className="col-auto">
                  <i className="feather icon-map-pin f-30 text-c-blue" />
                </div>
                <div className="col">
                  <h3 className="f-w-300">26</h3>
                  <span className="d-block text-uppercase">total locations</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={4}>
          <Card className="card-social">
            <Card.Body className="border-bottom">
              <div className="row align-items-center justify-content-center">
                <div className="col-auto">
                  <i className="fab fa-facebook-f text-primary f-36" />
                </div>
                <div className="col text-end">
                  <h3>12,281</h3>
                  <h5 className="text-c-green mb-0">
                    +7.2% <span className="text-muted">Total Likes</span>
                  </h5>
                </div>
              </div>
            </Card.Body>
            <Card.Body>
              <div className="row align-items-center justify-content-center card-active">
                <div className="col-6">
                  <h6 className="text-center m-b-10">
                    <span className="text-muted m-r-5">Target:</span>35,098
                  </h6>
                  <div className="progress">
                    <div
                      className="progress-bar progress-c-theme"
                      role="progressbar"
                      style={{ width: '60%', height: '6px' }}
                      aria-valuenow="60"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                </div>
                <div className="col-6">
                  <h6 className="text-center  m-b-10">
                    <span className="text-muted m-r-5">Duration:</span>350
                  </h6>
                  <div className="progress">
                    <div
                      className="progress-bar progress-c-theme2"
                      role="progressbar"
                      style={{ width: '45%', height: '6px' }}
                      aria-valuenow="45"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={4}>
          <Card className="card-social">
            <Card.Body className="border-bottom">
              <div className="row align-items-center justify-content-center">
                <div className="col-auto">
                  <i className="fab fa-twitter text-c-blue f-36" />
                </div>
                <div className="col text-end">
                  <h3>11,200</h3>
                  <h5 className="text-c-purple mb-0">
                    +6.2% <span className="text-muted">Total Likes</span>
                  </h5>
                </div>
              </div>
            </Card.Body>
            <Card.Body>
              <div className="row align-items-center justify-content-center card-active">
                <div className="col-6">
                  <h6 className="text-center m-b-10">
                    <span className="text-muted m-r-5">Target:</span>34,185
                  </h6>
                  <div className="progress">
                    <div
                      className="progress-bar progress-c-green"
                      role="progressbar"
                      style={{ width: '40%', height: '6px' }}
                      aria-valuenow="40"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                </div>
                <div className="col-6">
                  <h6 className="text-center  m-b-10">
                    <span className="text-muted m-r-5">Duration:</span>800
                  </h6>
                  <div className="progress">
                    <div
                      className="progress-bar progress-c-blue"
                      role="progressbar"
                      style={{ width: '70%', height: '6px' }}
                      aria-valuenow="70"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={4}>
          <Card className="card-social">
            <Card.Body className="border-bottom">
              <div className="row align-items-center justify-content-center">
                <div className="col-auto">
                  <i className="fab fa-google-plus-g text-c-red f-36" />
                </div>
                <div className="col text-end">
                  <h3>10,500</h3>
                  <h5 className="text-c-blue mb-0">
                    +5.9% <span className="text-muted">Total Likes</span>
                  </h5>
                </div>
              </div>
            </Card.Body>
            <Card.Body>
              <div className="row align-items-center justify-content-center card-active">
                <div className="col-6">
                  <h6 className="text-center m-b-10">
                    <span className="text-muted m-r-5">Target:</span>25,998
                  </h6>
                  <div className="progress">
                    <div
                      className="progress-bar progress-c-theme"
                      role="progressbar"
                      style={{ width: '80%', height: '6px' }}
                      aria-valuenow="80"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                </div>
                <div className="col-6">
                  <h6 className="text-center  m-b-10">
                    <span className="text-muted m-r-5">Duration:</span>900
                  </h6>
                  <div className="progress">
                    <div
                      className="progress-bar progress-c-theme2"
                      role="progressbar"
                      style={{ width: '50%', height: '6px' }}
                      aria-valuenow="50"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={4}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Rating</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="row align-items-center justify-content-center m-b-20">
                <div className="col-6">
                  <h2 className="f-w-300 d-flex align-items-center float-start m-0">
                    4.7 <i className="fa fa-star f-10 m-l-10 text-c-yellow" />
                  </h2>
                </div>
                <div className="col-6">
                  <h6 className="d-flex  align-items-center float-end m-0">
                    0.4 <i className="fa fa-caret-up text-c-green f-22 m-l-10" />
                  </h6>
                </div>
              </div>

              <div className="row">
                <div className="col-xl-12">
                  <h6 className="align-items-center float-start">
                    <i className="fa fa-star f-10 m-r-10 text-c-yellow" />5
                  </h6>
                  <h6 className="align-items-center float-end">384</h6>
                  <div className="progress m-t-30 m-b-20" style={{ height: '6px' }}>
                    <div
                      className="progress-bar progress-c-theme"
                      role="progressbar"
                      style={{ width: '70%' }}
                      aria-valuenow="70"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                </div>

                <div className="col-xl-12">
                  <h6 className="align-items-center float-start">
                    <i className="fa fa-star f-10 m-r-10 text-c-yellow" />4
                  </h6>
                  <h6 className="align-items-center float-end">145</h6>
                  <div className="progress m-t-30  m-b-20" style={{ height: '6px' }}>
                    <div
                      className="progress-bar progress-c-theme"
                      role="progressbar"
                      style={{ width: '35%' }}
                      aria-valuenow="35"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                </div>

                <div className="col-xl-12">
                  <h6 className="align-items-center float-start">
                    <i className="fa fa-star f-10 m-r-10 text-c-yellow" />3
                  </h6>
                  <h6 className="align-items-center float-end">24</h6>
                  <div className="progress m-t-30  m-b-20" style={{ height: '6px' }}>
                    <div
                      className="progress-bar progress-c-theme"
                      role="progressbar"
                      style={{ width: '25%' }}
                      aria-valuenow="25"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                </div>

                <div className="col-xl-12">
                  <h6 className="align-items-center float-start">
                    <i className="fa fa-star f-10 m-r-10 text-c-yellow" />2
                  </h6>
                  <h6 className="align-items-center float-end">1</h6>
                  <div className="progress m-t-30  m-b-20" style={{ height: '6px' }}>
                    <div
                      className="progress-bar progress-c-theme"
                      role="progressbar"
                      style={{ width: '10%' }}
                      aria-valuenow="10"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                </div>
                <div className="col-xl-12">
                  <h6 className="align-items-center float-start">
                    <i className="fa fa-star f-10 m-r-10 text-c-yellow" />1
                  </h6>
                  <h6 className="align-items-center float-end">0</h6>
                  <div className="progress m-t-30  m-b-5" style={{ height: '6px' }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: '0%' }}
                      aria-valuenow="0"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={8} className="user-activity">
          <Card>
            <Tabs defaultActiveKey="today" id="uncontrolled-tab-example">
              <Tab eventKey="today" title="Today">
                {tabContent}
              </Tab>
              <Tab eventKey="week" title="This Week">
                {tabContent}
              </Tab>
              <Tab eventKey="all" title="All">
                {tabContent}
              </Tab>
            </Tabs>
          </Card>
        </Col>*/}
      </Row>
    </React.Fragment>
  );
};

export default DashDefault;
