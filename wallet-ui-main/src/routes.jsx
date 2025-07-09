import React, { Suspense, Fragment, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Loader from './components/Loader/Loader';
import AdminLayout from './layouts/AdminLayout';

import AuthGuard from './guards/AuthGuard';

import { BASE_URL } from './config/constant';
import WebLayout from 'layouts/WebLayout';
import CustomerLayout from 'layouts/CustomerLayout';

export const renderRoutes = (routes = []) => (
  <Suspense fallback={<Loader />}>
    <Routes>
      {routes.map((route, i) => {
        const Guard = route.guard || Fragment;
        const Layout = route.layout || Fragment;
        const Element = route.element;

        return (
          <Route
            key={i}
            path={route.path}
            element={
              <Guard>
                <Layout>
                  {route.routes ? renderRoutes(route.routes) : <Element props={true} />}
                </Layout>
              </Guard>
            }
          />
        );
      })}
    </Routes>
  </Suspense>
);

const routes = [
  {
    exact: true,
    layout: CustomerLayout,
    path: '/login',
    element: lazy(() => import('./views/auth/signin/SignIn1'))
  },
  {
    exact: true,
    layout: CustomerLayout,
    path: '/register',
    element: lazy(() => import('./views/auth/signup/SignUp'))
  },
  {
    exact: true,
    layout: CustomerLayout,
    path: '/verify',
    element: lazy(() => import('./views/auth/verify'))
  },
  {
    path: '/',
    layout: AdminLayout,
    routes: [
      {
        exact: true,
        path: '/',
        element: lazy(() => import('./views/feeds'))
      }
    ]
  },
  {
    path: '/customer/register/:token',
    layout: CustomerLayout,
    routes: [
      {
        exact: true,
        path: '/',
        element: lazy(() => import('./views/auth/signup/SignUp1'))
      }
    ]
  },
  {
    path: '*',
    layout: AdminLayout,
    guard: AuthGuard,
    routes: [
      {
        exact: true,
        path: 'dashboard',
        element: lazy(() => import('./views/dashboard'))
      },
      {
        exact: true,
        path: 'feeds',
        element: lazy(() => import('./views/feeds'))
      },
      {
        exact: true,
        path: 'wallets',
        element: lazy(() => import('./views/wallet'))
      },
      {
        exact: true,
        path: 'logs',
        element: lazy(() => import('./views/logsPage')) // ✅ Log sayfası eklendi
      },
      {
        path: '*',
        exact: true,
        element: () => <Navigate to={BASE_URL} />
      }
    ]
  }
];

export default routes;
