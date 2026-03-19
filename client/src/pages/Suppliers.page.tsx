import { Fragment } from 'react';

import { Alert, Button, Row, type TableColumnsType, Typography } from 'antd';

import { CreateSupplierModal } from '@components/Suppliers/CreateSupplierModal';
import { EditSupplierModal } from '@components/Suppliers/EditSupplierModal';
import { SuppliersActionsCell } from '@components/Suppliers/SuppliersActionsCell';
import { Table } from '@components/Table';
import { SuppliersContextProvider } from '@contexts/Suppliers.context';
import type { Supplier } from '@internal-types/Supplier.type';
import { Show } from '@lib/Show';

const COLUMNS: TableColumnsType<Supplier.Model> = [
    {
        title: 'ID',
        dataIndex: 'id',
        render: value => `#${value}`
    },
    {
        title: 'Nome fantasia',
        dataIndex: 'trade_name',
    },
    {
        title: 'Razão social',
        dataIndex: 'legal_name',
    },
    {
        title: 'Categoria',
        dataIndex: 'category',
    },
    {
        title: 'CNPJ',
        dataIndex: 'cnpj',
        render: value => formatCnpj(value)
    },
    {
        title: 'E-mail',
        dataIndex: 'email',
    },
    {
        title: 'CEP',
        dataIndex: 'zip_code',
        render: value => formatZipCode(value)
    },
    {
        title: 'Endereço',
        dataIndex: 'address',
    },
    {
        render: (_, record) => <SuppliersActionsCell supplier={record} />
    }
];

const INTERNAL_EDITION_NOTICE = 'A edição de registros existentes é feita apenas pela equipe interna da Gcondo.';

function formatCnpj(cnpj: string): string {
    const digits = cnpj.replace(/\D/g, '');

    if (digits.length !== 14)
        return cnpj;

    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function formatZipCode(zipCode: string): string {
    const digits = zipCode.replace(/\D/g, '');

    if (digits.length !== 8)
        return zipCode;

    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function Suppliers() {
    return (
        <SuppliersContextProvider>
            {({
                isLoading,
                suppliers,
                setIsCreateModalVisible,
                isCreateModalVisible,
                isEditModalVisible
            }) => (
                <Fragment>
                    <main>
                        <Row justify="space-between" align="middle">
                            <Typography.Title level={3}>
                                Fornecedores
                            </Typography.Title>

                            <Button
                                type="primary"
                                onClick={() => setIsCreateModalVisible(true)}
                            >
                                Cadastrar
                            </Button>
                        </Row>

                        <Alert
                            type="warning"
                            showIcon
                            message={INTERNAL_EDITION_NOTICE}
                            style={{ marginBottom: 16 }}
                        />

                        <Table
                            columns={COLUMNS}
                            dataSource={suppliers}
                            loading={isLoading}
                        />
                    </main>

                    <Show when={isCreateModalVisible}>
                        <CreateSupplierModal />
                    </Show>

                    <Show when={isEditModalVisible}>
                        <EditSupplierModal />
                    </Show>
                </Fragment>
            )}
        </SuppliersContextProvider>
    );
}
