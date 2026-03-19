import { Fragment } from 'react';

import { Button, Row, type TableColumnsType, Typography } from 'antd';

import { CondominiumActionsCell } from '@components/Condominiums/CondominiumsActionsCell';
import { CreateCondominiumModal } from '@components/Condominiums/CreateCondominiumModal';
import { EditCondominiumModal } from '@components/Condominiums/EditCondominiumModal';
import { Table } from '@components/Table';
import { CondominiumsContextProvider } from '@contexts/Condominiums.context';
import type { Condominium } from '@internal-types/Condominium.type';
import { Show } from '@lib/Show';

const COLUMNS: TableColumnsType<Condominium.Model> = [
    {
        title: 'ID',
        dataIndex: 'id',
        render: value => `#${value}`
    },

    {
        title: 'Nome',
        dataIndex: 'name',
    },

    {
        title: 'CEP',
        dataIndex: 'zip_code',
    },

    {
        render: (_, record) => <CondominiumActionsCell condominium={record} /> 
    }
];

export function Condominiums() {
    return (
        <CondominiumsContextProvider>
            {({ 
                isLoading, 
                condominiums, 
                setIsCreateModalVisible,
                isCreateModalVisible,
                isEditModalVisible
            }) => (
                <Fragment>
                    <main>
                        <Row justify="space-between" align="middle">
                            <Typography.Title level={3}>
                                Condomínios
                            </Typography.Title>

                            <Button 
                                type="primary"
                                onClick={() => setIsCreateModalVisible(true)}
                            >
                                Cadastrar
                            </Button>
                        </Row>

                        <Table
                            columns={COLUMNS}
                            dataSource={condominiums}
                            loading={isLoading}
                        />
                    </main>
                    
                    <Show when={isCreateModalVisible}>
                        <CreateCondominiumModal />
                    </Show>

                    <Show when={isEditModalVisible}>
                        <EditCondominiumModal />
                    </Show>
                </Fragment>
            )}
        </CondominiumsContextProvider>
    );
}
