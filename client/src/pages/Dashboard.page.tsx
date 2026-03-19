import { useEffect, useMemo, useState } from 'react';

import {
    Alert,
    App,
    Card,
    Col,
    Empty,
    Progress,
    Row,
    Spin,
    Statistic,
    Tag,
    Typography
} from 'antd';

import {
    BuildOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ShopOutlined,
    SolutionOutlined,
    UserOutlined
} from '@ant-design/icons';
import { handleServiceError, hasServiceError } from '@helpers/Service.helper';
import type { Budget } from '@internal-types/Budget.type';
import { listBudgets } from '@services/Budget.service';
import { listCondominiums } from '@services/Condominium.service';
import { listPeople } from '@services/Person.service';
import { listSuppliers } from '@services/Supplier.service';

type DashboardData = {
    condominiumsCount: number,
    peopleCount: number,
    suppliersCount: number,
    budgetsCount: number,
    budgetStatusCount: Record<Budget.Status, number>,
};

const STATUS_ORDER: Budget.Status[] = [
    'Rascunho',
    'Enviado',
    'Em análise',
    'Aprovado',
    'Reprovado',
    'Cancelado'
];

const STATUS_COLORS: Record<Budget.Status, string> = {
    'Rascunho': 'default',
    'Enviado': 'processing',
    'Em análise': 'blue',
    'Aprovado': 'success',
    'Reprovado': 'error',
    'Cancelado': 'warning'
};

export function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);

    const app = App.useApp();

    useEffect(() => {
        const fetchDashboard = async () => {
            setIsLoading(true);

            const [
                condominiumsResponse,
                peopleResponse,
                suppliersResponse,
                budgetsResponse
            ] = await Promise.all([
                listCondominiums(),
                listPeople(),
                listSuppliers(),
                listBudgets()
            ]);

            setIsLoading(false);

            if (hasServiceError(condominiumsResponse))
                return handleServiceError(app, condominiumsResponse);

            if (hasServiceError(peopleResponse))
                return handleServiceError(app, peopleResponse);

            if (hasServiceError(suppliersResponse))
                return handleServiceError(app, suppliersResponse);

            if (hasServiceError(budgetsResponse))
                return handleServiceError(app, budgetsResponse);

            const budgetStatusCount = STATUS_ORDER.reduce<Record<Budget.Status, number>>((acc, status) => {
                acc[status] = 0;
                return acc;
            }, {} as Record<Budget.Status, number>);

            for (const budget of budgetsResponse.data.budgets) {
                budgetStatusCount[budget.status] += 1;
            }

            setData({
                condominiumsCount: condominiumsResponse.data.condominiums.length,
                peopleCount: peopleResponse.data.people.length,
                suppliersCount: suppliersResponse.data.suppliers.length,
                budgetsCount: budgetsResponse.data.budgets.length,
                budgetStatusCount
            });
        };

        fetchDashboard();
    }, [app]);

    const statusEntries = useMemo(() => {
        if (!data)
            return [];

        return STATUS_ORDER.map(status => ({
            status,
            count: data.budgetStatusCount[status],
            percentage: data.budgetsCount > 0
                ? Math.round((data.budgetStatusCount[status] / data.budgetsCount) * 100)
                : 0
        }));
    }, [data]);

    return (
        <main>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Typography.Title level={3} style={{ margin: 0 }}>
                    Dashboard
                </Typography.Title>
            </Row>

            <Alert
                type="info"
                showIcon
                message="Visão geral operacional de condomínios, pessoas, fornecedores e orçamentos."
                style={{ marginBottom: 16 }}
            />

            {isLoading && <Spin />}

            {!isLoading && !data && (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Não foi possível carregar os indicadores."
                />
            )}

            {!isLoading && data && (
                <>
                    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                        <Col xs={24} sm={12} lg={6}>
                            <Card variant="borderless">
                                <Statistic
                                    title="Condomínios"
                                    value={data.condominiumsCount}
                                    prefix={<BuildOutlined style={{ color: '#1677ff' }} />}
                                />
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} lg={6}>
                            <Card variant="borderless">
                                <Statistic
                                    title="Pessoas"
                                    value={data.peopleCount}
                                    prefix={<UserOutlined style={{ color: '#722ed1' }} />}
                                />
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} lg={6}>
                            <Card variant="borderless">
                                <Statistic
                                    title="Fornecedores"
                                    value={data.suppliersCount}
                                    prefix={<ShopOutlined style={{ color: '#13c2c2' }} />}
                                />
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} lg={6}>
                            <Card variant="borderless">
                                <Statistic
                                    title="Orçamentos"
                                    value={data.budgetsCount}
                                    prefix={<SolutionOutlined style={{ color: '#fa8c16' }} />}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} xl={14}>
                            <Card title="Orçamentos por status">
                                <Row gutter={[12, 12]}>
                                    {statusEntries.map(item => (
                                        <Col key={item.status} xs={24} sm={12}>
                                            <Card size="small">
                                                <Row justify="space-between" align="middle">
                                                    <Typography.Text>{item.status}</Typography.Text>
                                                    <Tag color={STATUS_COLORS[item.status]}>
                                                        {item.count}
                                                    </Tag>
                                                </Row>

                                                <Progress
                                                    percent={item.percentage}
                                                    size="small"
                                                    showInfo={false}
                                                    style={{ marginTop: 8 }}
                                                />
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Card>
                        </Col>

                        <Col xs={24} xl={10}>
                            <Card title="Resumo rápido">
                                <Row gutter={[8, 12]}>
                                    <Col span={24}>
                                        <Tag color="success" style={{ width: '100%', padding: '10px 12px' }}>
                                            <CheckCircleOutlined /> Aprovados: {data.budgetStatusCount['Aprovado']}
                                        </Tag>
                                    </Col>

                                    <Col span={24}>
                                        <Tag color="error" style={{ width: '100%', padding: '10px 12px' }}>
                                            <CloseCircleOutlined /> Reprovados: {data.budgetStatusCount['Reprovado']}
                                        </Tag>
                                    </Col>

                                    <Col span={24}>
                                        <Tag color="blue" style={{ width: '100%', padding: '10px 12px' }}>
                                            <SolutionOutlined /> Em análise: {data.budgetStatusCount['Em análise']}
                                        </Tag>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </main>
    );
}
