import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Table, Tabs, Tab } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import ApiService from '../../../services/ApiService';
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import ConfigContent from './tabs/config';
import LogsContent from './tabs/logs';

const PosDetail = () => {

    const navigate = useNavigate();
    const toast = useRef(null);
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [configs, setConfigs] = useState({});
    const [activeKey, setActiveKey] = useState('config');
    const [logs, setLogs] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);

    const onTabChange = (selectedKey) => {
      setSelectedRow(null);
      setActiveKey(selectedKey); // Aktif sekme indeksini güncelle
      if(selectedKey == "config") {
        getConfig();
      } else if(selectedKey == "logs") {
        getLogs();
      }
    };

    useEffect(() => {
        getConfig();
    }, []);
    
      async function getConfig() {
        try {
          setLoading(true);
          const response = await ApiService.get(`/api/0/v1/ev/posconfigs/get?terminal_id=${id}`);
          setConfigs(response.data.data);
          setLoading(false);
        } catch (error) {
          console.error('GET request error:', error);
          throw error;
        }
      }

      async function getLogs() {
        try {
          setLoading(true);
          const response = await ApiService.get(`/api/0/v1/ev/poslog/get?terminal_id=${id}`);
          setLogs(response.data.data);
          setLoading(false);
        } catch (error) {
          console.error('GET request error:', error);
          throw error;
        }
      }

  return (
    <React.Fragment>
      <Row>
        <Toast ref={toast} />
        <Col md={12} xl={12}>
          <Tabs variant="pills" defaultActiveKey="info" className="mb-3" activeKey={activeKey} onSelect={onTabChange}>
                      <Tab eventKey="config" title="Config" className="tab-content-padding">
                        <ConfigContent id={id} config={configs}/>
                      </Tab>
                      <Tab eventKey="logs" title="Logs">
                        <LogsContent id={id} logs={logs} loading={loading} selectedRow={selectedRow} setSelectedRow={setSelectedRow}/>
                      </Tab>
                    </Tabs>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default PosDetail;
