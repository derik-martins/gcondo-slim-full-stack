import { useState } from 'react';

import { App, Button, Popconfirm, Space } from 'antd';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useBudgetsContext } from '@contexts/Budgets.context';
import { handleServiceError, hasServiceError } from '@helpers/Service.helper';
import type { Budget } from '@internal-types/Budget.type';
import { sleep } from '@lib/Sleep';
import { deleteBudget } from '@services/Budget.service';

type Props = { budget: Budget.Model };

export function BudgetsActionsCell({ budget }: Props) {
    const [isPopconfirmVisible, setIsPopconfirmVisible] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const { setBudgetId, setIsEditModalVisible, fetchBudgets } = useBudgetsContext();
    const app = App.useApp();

    const handleEdit = () => {
        setBudgetId(budget.id);
        setIsEditModalVisible(true);
    };

    const handleDelete = async () => {
        setIsSending(true);

        const response = await deleteBudget(budget.id);

        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response);

        setIsPopconfirmVisible(false);
        fetchBudgets();
    };

    return (
        <Space size="middle">
            <Button
                type="text"
                icon={<EditOutlined />}
                title="Editar"
                onClick={handleEdit}
            />

            <Popconfirm
                title="Excluir orçamento"
                description="Tem certeza que deseja excluir o orçamento?"
                open={isPopconfirmVisible}
                placement="left"
                cancelText="Não"
                okText="Sim"
                okType="danger"
                okButtonProps={{ loading: isSending }}
                onConfirm={handleDelete}
                onCancel={() => setIsPopconfirmVisible(false)}
            >
                <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    title="Excluir"
                    onClick={() => setIsPopconfirmVisible(true)}
                />
            </Popconfirm>
        </Space>
    );
}
