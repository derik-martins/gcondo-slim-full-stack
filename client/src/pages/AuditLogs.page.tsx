import { useCallback, useEffect, useState } from 'react';

import { Alert, App, Button, Row, type TableColumnsType, Tag, Tooltip, Typography } from 'antd';

import { Table } from '@components/Table';
import { handleServiceError, hasServiceError } from '@helpers/Service.helper';
import type { AuditLog } from '@internal-types/AuditLog.type';
import { exportAuditLogsUrl, listAuditLogs } from '@services/AuditLog.service';

const COLUMNS: TableColumnsType<AuditLog.Model> = [
    {
        title: 'ID',
        dataIndex: 'id',
        render: value => `#${value}`
    },
    {
        title: 'Data/Hora',
        dataIndex: 'created_at',
    },
    {
        title: 'Método',
        dataIndex: 'method',
        render: value => <Tag color="blue">{value}</Tag>
    },
    {
        title: 'Rota',
        dataIndex: 'path',
        render: (value: string, record) => {
            if (record.query_string)
                return `${value}?${record.query_string}`;

            return value;
        }
    },
    {
        title: 'Status',
        dataIndex: 'response_status',
        render: value => <Tag color={value >= 400 ? 'error' : 'success'}>{value}</Tag>
    },
    {
        title: 'Tempo (ms)',
        dataIndex: 'duration_ms',
    },
    {
        title: 'IP',
        dataIndex: 'ip_address',
        render: value => value ?? '-'
    },
    {
        title: 'User-Agent',
        dataIndex: 'user_agent',
        render: value => {
            if (!value)
                return '-';

            return (
                <Tooltip title={value}>
                    <span>{value.slice(0, 28)}{value.length > 28 ? '...' : ''}</span>
                </Tooltip>
            );
        }
    }
];

export function AuditLogs() {
    const [isLoading, setIsLoading] = useState(true);
    const [logs, setLogs] = useState<AuditLog.Model[]>([]);

    const app = App.useApp();

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);

        const response = await listAuditLogs(500);

        setIsLoading(false);

        if (hasServiceError(response))
            return handleServiceError(app, response);

        setLogs(response.data.audit_logs);
    }, [app]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleExport = () => {
        const url = exportAuditLogsUrl();

        window.open(url, '_blank');
    };

    return (
        <main>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Typography.Title level={3} style={{ margin: 0 }}>
                    Logs de auditoria
                </Typography.Title>

                <Button onClick={fetchLogs}>Atualizar</Button>
            </Row>

            <Alert
                type="info"
                showIcon
                message="Registro de ações no sistema sem login: método, rota, status, IP e metadata da requisição."
                style={{ marginBottom: 16 }}
                action={(
                    <Button type="primary" onClick={handleExport}>
                        Exportar Excel (.csv)
                    </Button>
                )}
            />

            <Table
                columns={COLUMNS}
                dataSource={logs}
                loading={isLoading}
            />
        </main>
    );
}
