import { createBrowserRouter } from 'react-router';

import { AuditLogs } from '@pages/AuditLogs.page';
import { Budgets } from '@pages/Budgets.page';
import { Condominiums } from '@pages/Condominiums.page';
import { Dashboard } from '@pages/Dashboard.page';
import { People } from '@pages/People.page';
import { Suppliers } from '@pages/Suppliers.page';

import { MainLayout } from './MainLayout';

/** @see https://reactrouter.com/start/data/routing */
export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Dashboard />
            },
            
            {
                path: '/condominiums',
                element: <Condominiums />,
            },
            {
                path: '/people',
                element: <People />,
            },
            {
                path: '/suppliers',
                element: <Suppliers />,
            },
            {
                path: '/budgets',
                element: <Budgets />,
            },
            {
                path: '/audit-logs',
                element: <AuditLogs />,
            },
        ]
    },
]);
