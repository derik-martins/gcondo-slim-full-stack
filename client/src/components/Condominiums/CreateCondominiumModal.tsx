import { useState } from 'react';

import { App, Divider, Form, Modal, } from 'antd';

import { useCondominiumsContext } from '@contexts/Condominiums.context';
import { handleServiceError, hasServiceError } from '@helpers/Service.helper';
import { sleep } from '@lib/Sleep';
import { createCondominium } from '@services/Condominium.service';

import { CondominiumFields, type Values } from './CondominiumFields';

export function CreateCondominiumModal() {
    const [isSending, setIsSending] = useState(false);

    const { setIsCreateModalVisible, fetchCondominiums } = useCondominiumsContext();

    const [form] = Form.useForm<Values>();

    const app = App.useApp();

    const close = () => setIsCreateModalVisible(false);

    const onFinish = async (values: Values) => {
        setIsSending(true);

        const response = await createCondominium(values);

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
            title="Cadastrar condomínio"
            confirmLoading={isSending}
            onOk={form.submit}
            okText="Cadastrar"
            onCancel={close}
            cancelText="Cancelar"
        >
            <Divider />

            <Form
                form={form}
                onFinish={onFinish}
                name="createCondominium"
                layout="vertical"
                autoComplete="off"
            >                
                <CondominiumFields />
            </Form>
        </Modal>
    );
}

