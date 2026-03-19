import { useState } from 'react';

import { App, Divider, Form, Modal } from 'antd';

import { useCondominiumsContext } from '@contexts/Condominiums.context';
import { handleServiceError, hasServiceError } from '@helpers/Service.helper';
import { sleep } from '@lib/Sleep';
import { updateCondominium } from '@services/Condominium.service';

import { CondominiumFields, type Values } from './CondominiumFields';

export function EditCondominiumModal() {
    const [isSending, setIsSending] = useState(false);

    const { 
        condominium, 
        setIsEditModalVisible,
        setCondominiumId, fetchCondominiums 
    } = useCondominiumsContext();
    
    if (!condominium)
        throw new Error('Value of the `condominium` property is unknown');

    const app = App.useApp();

    const [form] = Form.useForm<Values>();

    const close = () => {
        setIsEditModalVisible(false);
        setCondominiumId(null);
    };

    const onFinish = async (values: Values) => {
        setIsSending(true);

        const response = await updateCondominium(condominium.id, values);

        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response);

        close();
        fetchCondominiums();
    };

    return (
        <Modal
            open
            title="Editar condomínio"
            confirmLoading={isSending}
            onOk={form.submit}
            okText="Confirmar"
            onCancel={close}
            cancelText="Cancelar"
        >
            <Divider />

            <Form 
                form={form}
                onFinish={onFinish}
                name="editCondominium"
                layout="vertical"
                autoComplete="off"
                initialValues={condominium}
            >                
                <CondominiumFields />
            </Form>
        </Modal>
    );
}

