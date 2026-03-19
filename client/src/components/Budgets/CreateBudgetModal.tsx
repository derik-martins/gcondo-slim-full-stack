import { useState } from 'react';

import { App, Divider, Form, Modal } from 'antd';

import { useBudgetsContext } from '@contexts/Budgets.context';
import { handleServiceError, hasServiceError } from '@helpers/Service.helper';
import { sleep } from '@lib/Sleep';
import { createBudget } from '@services/Budget.service';

import { BudgetFields, type Values } from './BudgetFields';

type CreateBudgetPayload = Omit<Values, 'value'> & { value: string };

export function CreateBudgetModal() {
    const [isSending, setIsSending] = useState(false);

    const { setIsCreateModalVisible, fetchBudgets, suppliers, condominiums } = useBudgetsContext();
    const app = App.useApp();
    const [form] = Form.useForm<Values>();

    const close = () => setIsCreateModalVisible(false);

    const onFinish = async (values: Values) => {
        setIsSending(true);

        const body: CreateBudgetPayload = {
            supplier_id: values.supplier_id,
            condominium_id: values.condominium_id,
            title: values.title.trim(),
            service_description: values.service_description.trim(),
            value: values.value.toFixed(2),
            category: values.category,
            status: values.status
        };

        const response = await createBudget(body);

        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response);

        app.notification.success({
            message: 'Orçamento cadastrado',
            description: 'O cadastro foi realizado com sucesso.'
        });

        close();
        fetchBudgets();
    };

    return (
        <Modal
            open
            title="Cadastrar orçamento"
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
                name="createBudget"
                layout="vertical"
                autoComplete="off"
                initialValues={{ status: 'Rascunho' }}
            >
                <BudgetFields
                    suppliers={suppliers}
                    condominiums={condominiums}
                />
            </Form>
        </Modal>
    );
}
