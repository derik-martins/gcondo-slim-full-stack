import { useLocation, useNavigate, useNavigation } from 'react-router';

import { type GetProp, type MenuProps, Spin } from 'antd';

import { AuditOutlined, BuildOutlined, HomeOutlined, ShopOutlined, SolutionOutlined, UserOutlined } from '@ant-design/icons';
import { Layout } from '@components/Layout';

type Item =  NonNullable<MenuProps['items']>[number];

export function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const navigation = useNavigation();
    
    const initialKey = location.pathname.split('/').slice(0, 2).join('/');

    if (navigation.state === 'loading')
        return <Spin fullscreen />;

    const dashboardItem: Item = {
        key: '/',
        icon: <HomeOutlined />,
        label: 'Dashboard',
        onClick: () => navigate('/'),
    };

    const condominiumsItem: Item = {
        key: '/condominiums',
        icon: <BuildOutlined />,
        label: 'Condomínios',
        onClick: () => navigate('/condominiums'),
    };

    const peopleItem: Item = {
        key: '/people',
        icon: <UserOutlined />,
        label: 'Pessoas',
        onClick: () => navigate('/people'),
    };

    const suppliersItem: Item = {
        key: '/suppliers',
        icon: <ShopOutlined />,
        label: 'Fornecedores',
        onClick: () => navigate('/suppliers'),
    };

    const budgetsItem: Item = {
        key: '/budgets',
        icon: <SolutionOutlined />,
        label: 'Orçamentos',
        onClick: () => navigate('/budgets'),
    };

    const auditLogsItem: Item = {
        key: '/audit-logs',
        icon: <AuditOutlined />,
        label: 'Logs',
        onClick: () => navigate('/audit-logs'),
    };

    const items = [
        dashboardItem,
        condominiumsItem,
        peopleItem,
        suppliersItem,
        budgetsItem,
        auditLogsItem
    ];

    const sider: GetProp<typeof Layout.Root, 'sider'> = props => (
        <Layout.Sider {...props}
            items={items}
            defaultSelectedKeys={[initialKey]}
        />
    );

    return (
        <Layout.Root
            sider={sider}
            content={() => <Layout.Content />}
        />
    );
}
