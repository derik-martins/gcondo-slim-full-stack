import { useState } from 'react';

import { App, Divider, Form, Modal } from 'antd';

import { usePeopleContext } from '@contexts/People.context';
import { handleServiceError, hasServiceError } from '@helpers/Service.helper';
import { sleep } from '@lib/Sleep';
import { createPerson } from '@services/Person.service';

import { PersonFields, type Values } from './PersonFields';

type CreatePersonPayload = Omit<Values, 'consent'>;

export function CreatePersonModal() {
    const [isSending, setIsSending] = useState(false);

    const { setIsCreateModalVisible, fetchPeople } = usePeopleContext();
    const app = App.useApp();
    const [form] = Form.useForm<Values>();

    const close = () => setIsCreateModalVisible(false);

    const onFinish = async (values: Values) => {
        setIsSending(true);

        const body: CreatePersonPayload = {
            full_name: values.full_name.trim(),
            cpf: values.cpf.replace(/\D/g, ''),
            email: values.email.trim(),
            birth_date: values.birth_date
        };

        const response = await createPerson(body);

        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response);

        app.notification.success({
            message: 'Pessoa cadastrada',
            description: 'O cadastro foi realizado com sucesso.'
        });

        close();
        fetchPeople();
    };

    return (
        <Modal
            open
            title="Cadastrar pessoa"
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
                name="createPerson"
                layout="vertical"
                autoComplete="off"
            >
                <PersonFields />
            </Form>
        </Modal>
    );
}
