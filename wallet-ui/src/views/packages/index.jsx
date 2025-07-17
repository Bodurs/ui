import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import { Row, Col, Card, Table, Tabs, Tab } from 'react-bootstrap';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import ApiService from './../../services/ApiService';
import moment from 'moment';

const Packages = () => {

  const navigate = useNavigate();


  return (
    <React.Fragment>

      <div className="surface-0">
        <div className="text-900 font-bold text-6xl mb-4 text-center">Subscription Plans</div>
        <div className="text-700 text-xl mb-6 text-center line-height-3">Is your package not enough? Upgrade your package for more features and usage.</div>

        <div className="grid">
          <div className="col-12 col-lg-4">
            <div className="p-3 h-full">
              <div className="shadow-2 p-3 h-full flex flex-column" style={{ borderRadius: '6px' }}>
                <div className="text-900 font-medium text-xl mb-2">Basic</div>
                <div className="text-600">Small businesses with a single POS.</div>
                <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300" />
                <div className="flex align-items-center">
                  <span className="font-bold text-2xl text-900">$9</span>
                  <span className="ml-2 font-medium text-600">per month</span>
                </div>
                <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300" />
                <ul className="list-none p-0 m-0 flex-grow-1">
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>1 Organization</span>
                  </li>
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>1 User</span>
                  </li>
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>5 Terminals</span>
                  </li>
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>Unlimited Transactions</span>
                  </li>
                </ul>
                <hr className="mb-3 mx-0 border-top-1 border-bottom-none border-300 mt-auto" />
                <Button label="Upgrade Now" className="p-3 w-full mt-auto" />
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="p-3 h-full">
              <div className="shadow-2 p-3 h-full flex flex-column" style={{ borderRadius: '6px' }}>
                <div className="text-900 font-medium text-xl mb-2">Premium</div>
                <div className="text-600">Medium-sized businesses with multiple employees</div>
                <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300" />
                <div className="flex align-items-center">
                  <span className="font-bold text-2xl text-900">$29</span>
                  <span className="ml-2 font-medium text-600">per month</span>
                </div>
                <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300" />
                <ul className="list-none p-0 m-0 flex-grow-1">
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>1 Organization</span>
                  </li>
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>5 Users</span>
                  </li>
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>20 Terminals</span>
                  </li>
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>Unlimited Transactions</span>
                  </li>
                </ul>
                <hr className="mb-3 mx-0 border-top-1 border-bottom-none border-300" />
                <Button label="Upgrade Now" className="p-3 w-full" />
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="p-3 h-full">
              <div className="shadow-2 p-3 flex flex-column" style={{ borderRadius: '6px' }}>
                <div className="text-900 font-medium text-xl mb-2">Enterprise</div>
                <div className="text-600">Large businesses that want unlimited resources</div>
                <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300" />
                <div className="flex align-items-center">
                  <span className="font-bold text-2xl text-900">$49</span>
                  <span className="ml-2 font-medium text-600">per month</span>
                </div>
                <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300" />
                <ul className="list-none p-0 m-0 flex-grow-1">
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>Unlimited Organization</span>
                  </li>
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>Unlimited Users</span>
                  </li>
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>Unlimited Terminals</span>
                  </li>
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>Unlimited Transactions</span>
                  </li>
                </ul>
                <hr className="mb-3 mx-0 border-top-1 border-bottom-none border-300" />
                <Button label="Upgrade Now" className="p-3 w-full p-button-outlined" />
              </div>
            </div>
          </div>
        </div>
      </div>

    </React.Fragment>
  );
};

export default Packages;
