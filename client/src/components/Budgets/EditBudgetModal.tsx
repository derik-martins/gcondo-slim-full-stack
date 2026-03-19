import { useMemo, useState } from 'react';

import { App, Divider, Form, Modal } from 'antd';

import { useBudgetsContext } from '@contexts/Budgets.context';
import { handleServiceError, hasServiceError } from '@helpers/Service.helper';
import { sleep } from '@lib/Sleep';
import { updateBudget } from '@services/Budget.service';

import { BudgetFields, type Values } from './BudgetFields';

type EditBudgetPayload = Omit<Values, 'value'> & { value: string };

export function EditBudgetModal() {
    const [isSending, setIsSending] = useState(false);

    const {
        budget,
        suppliers,
        condominiums,
        setIsEditModalVisible,
        setBudgetId,
        fetchBudgets
    } = useBudgetsContext();

    if (!budget)
        throw new Error('Value of the `budget` property is unknown');

    const app = App.useApp();
    const [form] = Form.useForm<Values>();

    const initialValues = useMemo<Partial<Values>>(() => ({
        supplier_id: budget.supplier_id,
        condominium_id: budget.condominium_id,
        title: budget.title,
        service_description: budget.service_description,
        value: Number(budget.value),
        category: budget.category,
        status: budget.status
    }), [budget]);

    const close = () => {
        setIsEditModalVisible(false);
        setBudgetId(null);
    };

    const onFinish = async (values: Values) => {
        setIsSending(true);

        const body: EditBudgetPayload = {
            supplier_id: values.supplier_id,
            condominium_id: values.condominium_id,
            title: values.title.trim(),
            service_description: values.service_description.trim(),
            value: values.value.toFixed(2),
            category: values.category,
            status: values.status
        };

        const response = await updateBudget(budget.id, body);

        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response);

        app.notification.success({
            message: 'Orçamento atualizado',
            description: 'As alterações foram salvas com sucesso.'
        });

        close();
        fetchBudgets();
    };

    return (
        <Modal
            open
            title="Editar orçamento"
            confirmLoading={isSending}
            onOk={form.submit}
            okText="Salvar"
            onCancel={close}
            cancelText="Cancelar"
        >
            <Divider />

            <Form
                form={form}
                onFinish={onFinish}
                name="editBudget"
                layout="vertical"
                autoComplete="off"
                initialValues={initialValues}
            >
                <BudgetFields
                    suppliers={suppliers}
                    condominiums={condominiums}
                />
            </Form>
        </Modal>
    );
}
