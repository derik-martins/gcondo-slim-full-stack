import { useMemo, useState } from 'react';

import { App, Divider, Form, Modal } from 'antd';

import { useSuppliersContext } from '@contexts/Suppliers.context';
import { handleServiceError, hasServiceError } from '@helpers/Service.helper';
import { sleep } from '@lib/Sleep';
import { updateSupplier } from '@services/Supplier.service';

import { SupplierFields, type Values } from './SupplierFields';

type EditSupplierPayload = Omit<Values, 'consent'>;

export function EditSupplierModal() {
    const [isSending, setIsSending] = useState(false);

    const {
        supplier,
        people,
        setIsEditModalVisible,
        setSupplierId,
        fetchSuppliers
    } = useSuppliersContext();

    if (!supplier)
        throw new Error('Value of the `supplier` property is unknown');

    const app = App.useApp();
    const [form] = Form.useForm<Values>();

    const initialValues = useMemo<Partial<Values>>(() => ({
        legal_name: supplier.legal_name,
        trade_name: supplier.trade_name,
        cnpj: supplier.cnpj,
        email: supplier.email,
        zip_code: supplier.zip_code,
        address: supplier.address,
        category: supplier.category,
        person_ids: (supplier.people ?? []).map(person => person.id)
    }), [supplier]);

    const close = () => {
        setIsEditModalVisible(false);
        setSupplierId(null);
    };

    const onFinish = async (values: Values) => {
        setIsSending(true);

        const body: EditSupplierPayload = {
            legal_name: values.legal_name.trim(),
            trade_name: values.trade_name.trim(),
            cnpj: values.cnpj.replace(/\D/g, ''),
            email: values.email.trim(),
            zip_code: values.zip_code.replace(/\D/g, ''),
            address: values.address.trim(),
            category: values.category,
            person_ids: values.person_ids
        };

        const response = await updateSupplier(supplier.id, body);

        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response);

        app.notification.success({
            message: 'Fornecedor atualizado',
            description: 'As alterações foram salvas com sucesso.'
        });

        close();
        fetchSuppliers();
    };

    return (
        <Modal
            open
            title="Editar fornecedor"
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
                name="editSupplier"
                layout="vertical"
                autoComplete="off"
                initialValues={initialValues}
            >
                <SupplierFields
                    people={people}
                    showConsent={false}
                    showLookupCnpj={false}
                />
            </Form>
        </Modal>
    );
}
