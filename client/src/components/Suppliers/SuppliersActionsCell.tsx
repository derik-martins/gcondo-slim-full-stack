import { useState } from 'react';

import { App, Button, Popconfirm, Space } from 'antd';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useSuppliersContext } from '@contexts/Suppliers.context';
import { handleServiceError, hasServiceError } from '@helpers/Service.helper';
import type { Supplier } from '@internal-types/Supplier.type';
import { sleep } from '@lib/Sleep';
import { deleteSupplier } from '@services/Supplier.service';

type Props = { supplier: Supplier.Model };

export function SuppliersActionsCell({ supplier }: Props) {
    const [isPopconfirmVisible, setIsPopconfirmVisible] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const { setSupplierId, setIsEditModalVisible, fetchSuppliers } = useSuppliersContext();
    const app = App.useApp();

    const handleEdit = () => {
        setSupplierId(supplier.id);
        setIsEditModalVisible(true);
    };

    const handleDelete = async () => {
        setIsSending(true);

        const response = await deleteSupplier(supplier.id);

        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response);

        setIsPopconfirmVisible(false);
        fetchSuppliers();
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
                title="Excluir fornecedor"
                description="Tem certeza que deseja excluir o fornecedor?"
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
