import { Fragment } from 'react';

import { Alert, Button, Row, type TableColumnsType, Tag, Typography } from 'antd';

import { BudgetsActionsCell } from '@components/Budgets/BudgetsActionsCell';
import { CreateBudgetModal } from '@components/Budgets/CreateBudgetModal';
import { EditBudgetModal } from '@components/Budgets/EditBudgetModal';
import { Table } from '@components/Table';
import { BudgetsContextProvider } from '@contexts/Budgets.context';
import type { Budget } from '@internal-types/Budget.type';
import { Show } from '@lib/Show';

const COLUMNS: TableColumnsType<Budget.Model> = [
    {
        title: 'ID',
        dataIndex: 'id',
        render: value => `#${value}`
    },
    {
        title: 'Título',
        dataIndex: 'title',
    },
    {
        title: 'Fornecedor',
        dataIndex: ['supplier', 'trade_name'],
        render: (value: string | undefined, record) => value ?? `#${record.supplier_id}`
    },
    {
        title: 'Condomínio',
        dataIndex: ['condominium', 'name'],
        render: (value: string | undefined, record) => value ?? `#${record.condominium_id}`
    },
    {
        title: 'Categoria',
        dataIndex: 'category',
    },
    {
        title: 'Status',
        dataIndex: 'status',
        render: value => <Tag>{value}</Tag>
    },
    {
        title: 'Valor',
        dataIndex: 'value',
        render: value => formatMoney(value)
    },
    {
        title: 'Descrição do serviço',
        dataIndex: 'service_description',
    },
    {
        render: (_, record) => <BudgetsActionsCell budget={record} />
    }
];

const OPERATIONAL_NOTICE = 'Use esta área para consultar e registrar orçamentos no dia a dia operacional.';

function formatMoney(value: string): string {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue))
        return value;

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(numericValue);
}

export function Budgets() {
    return (
        <BudgetsContextProvider>
            {({
                isLoading,
                budgets,
                setIsCreateModalVisible,
                isCreateModalVisible,
                isEditModalVisible
            }) => (
                <Fragment>
                    <main>
                        <Row justify="space-between" align="middle">
                            <Typography.Title level={3}>
                                Orçamentos
                            </Typography.Title>

                            <Button
                                type="primary"
                                onClick={() => setIsCreateModalVisible(true)}
                            >
                                Cadastrar
                            </Button>
                        </Row>

                        <Alert
                            type="info"
                            showIcon
                            message={OPERATIONAL_NOTICE}
                            style={{ marginBottom: 16 }}
                        />

                        <Table
                            columns={COLUMNS}
                            dataSource={budgets}
                            loading={isLoading}
                        />
                    </main>

                    <Show when={isCreateModalVisible}>
                        <CreateBudgetModal />
                    </Show>

                    <Show when={isEditModalVisible}>
                        <EditBudgetModal />
                    </Show>
                </Fragment>
            )}
        </BudgetsContextProvider>
    );
}
