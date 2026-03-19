
import { useState } from 'react';

import { App, Button, Popconfirm, Space } from 'antd';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useCondominiumsContext } from '@contexts/Condominiums.context';
import { handleServiceError, hasServiceError } from '@helpers/Service.helper';
import type { Condominium } from '@internal-types/Condominium.type';
import { sleep } from '@lib/Sleep';
import { deleteCondominium } from '@services/Condominium.service';

type Props = { condominium: Condominium.Model };

export function CondominiumActionsCell({ condominium }: Props) {
    const [isPopconfirmVisible, setIsPopconfirmVisible] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const { setCondominiumId, setIsEditModalVisible, fetchCondominiums } = useCondominiumsContext();

    const app = App.useApp();

    const handleEdit = () => {
        setCondominiumId(condominium.id);
        setIsEditModalVisible(true);
    };

    const handleDelete = async () => {
        setIsSending(true);

        const response = await deleteCondominium(condominium.id);

        // Slowed down a bit to improve UX
        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response);

        setIsPopconfirmVisible(false);
        fetchCondominiums();
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
                title="Excluir condomínio"
                description="Tem certeza que deseja excluir o condomínio?"
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
