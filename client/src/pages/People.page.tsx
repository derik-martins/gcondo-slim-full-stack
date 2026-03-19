import { Fragment } from 'react';

import { Alert, Button, Row, type TableColumnsType, Typography } from 'antd';

import { CreatePersonModal } from '@components/People/CreatePersonModal';
import { Table } from '@components/Table';
import { PeopleContextProvider } from '@contexts/People.context';
import type { Person } from '@internal-types/Person.type';
import { Show } from '@lib/Show';

const COLUMNS: TableColumnsType<Person.Model> = [
    {
        title: 'ID',
        dataIndex: 'id',
        render: value => `#${value}`
    },
    {
        title: 'Nome completo',
        dataIndex: 'full_name',
    },
    {
        title: 'CPF',
        dataIndex: 'cpf',
        render: value => formatCpf(value)
    },
    {
        title: 'E-mail',
        dataIndex: 'email',
    },
    {
        title: 'Data de nascimento',
        dataIndex: 'birth_date',
        render: value => formatBirthDate(value)
    }
];

const INTERNAL_EDITION_NOTICE = 'A edição de registros existentes é feita apenas pela equipe interna da Gcondo.';

function formatCpf(cpf: string): string {
    const digits = cpf.replace(/\D/g, '');

    if (digits.length !== 11)
        return cpf;

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatBirthDate(value: string): string {
    if (!value.includes('-'))
        return value;

    const [year, month, day] = value.split('-');

    if (!year || !month || !day)
        return value;

    return `${day}/${month}/${year}`;
}

export function People() {
    return (
        <PeopleContextProvider>
            {({
                isLoading,
                people,
                setIsCreateModalVisible,
                isCreateModalVisible
            }) => (
                <Fragment>
                    <main>
                        <Row justify="space-between" align="middle">
                            <Typography.Title level={3}>
                                Pessoas
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
                            dataSource={people}
                            loading={isLoading}
                        />
                    </main>

                    <Show when={isCreateModalVisible}>
                        <CreatePersonModal />
                    </Show>
                </Fragment>
            )}
        </PeopleContextProvider>
    );
}
