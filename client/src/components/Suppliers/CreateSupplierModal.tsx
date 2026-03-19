import { useState } from 'react';

import { App, Divider, Form, Modal } from 'antd';

import { useSuppliersContext } from '@contexts/Suppliers.context';
import { handleServiceError, hasServiceError } from '@helpers/Service.helper';
import { sleep } from '@lib/Sleep';
import { createSupplier, lookupSupplierByCnpj } from '@services/Supplier.service';

import { SupplierFields, type Values } from './SupplierFields';

type CreateSupplierPayload = Omit<Values, 'consent'>;

export function CreateSupplierModal() {
    const [isSending, setIsSending] = useState(false);
    const [isLookingUpCnpj, setIsLookingUpCnpj] = useState(false);

    const { setIsCreateModalVisible, fetchSuppliers, people } = useSuppliersContext();
    const app = App.useApp();
    const [form] = Form.useForm<Values>();

    const close = () => setIsCreateModalVisible(false);

    const onLookupCnpj = async () => {
        try {
            await form.validateFields(['cnpj']);
        } catch {
            return;
        }

        const cnpj = String(form.getFieldValue('cnpj') ?? '').replace(/\D/g, '');

        if (cnpj.length !== 14) {
            return;
        }

        setIsLookingUpCnpj(true);

        const response = await lookupSupplierByCnpj(cnpj);

        setIsLookingUpCnpj(false);

        if (hasServiceError(response)) {
            return handleServiceError(app, response, () => 'Não foi possível consultar o CNPJ agora. Tente novamente.');
        }

        const supplier = response.data.supplier_preview.supplier;

        const valuesToPrefill: Partial<CreateSupplierPayload> = {};

        if (supplier.cnpj.trim() !== '')
            valuesToPrefill.cnpj = supplier.cnpj.trim();

        if (supplier.legal_name.trim() !== '')
            valuesToPrefill.legal_name = supplier.legal_name.trim();

        if (supplier.trade_name.trim() !== '')
            valuesToPrefill.trade_name = supplier.trade_name.trim();

        if (supplier.email.trim() !== '')
            valuesToPrefill.email = supplier.email.trim();

        if (supplier.zip_code.trim() !== '')
            valuesToPrefill.zip_code = supplier.zip_code.trim();

        if (supplier.address.trim() !== '')
            valuesToPrefill.address = supplier.address.trim();

        form.setFieldsValue(valuesToPrefill);

        const filledFieldsCount = Object.keys(valuesToPrefill).length;

        if (filledFieldsCount === 0) {
            return app.notification.warning({
                message: 'Consulta concluída',
                description: 'Não encontramos dados suficientes para preencher automaticamente. Você pode continuar o cadastro manualmente.'
            });
        }

        app.notification.success({
            message: 'Consulta concluída',
            description: 'Os dados disponíveis foram preenchidos automaticamente. Você pode editar antes de salvar.'
        });
    };

    const onFinish = async (values: Values) => {
        setIsSending(true);

        const body: CreateSupplierPayload = {
            legal_name: values.legal_name.trim(),
            trade_name: values.trade_name.trim(),
            cnpj: values.cnpj.replace(/\D/g, ''),
            email: values.email.trim(),
            zip_code: values.zip_code.replace(/\D/g, ''),
            address: values.address.trim(),
            category: values.category,
            person_ids: values.person_ids
        };

        const response = await createSupplier(body);

        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response);

        app.notification.success({
            message: 'Fornecedor cadastrado',
            description: 'O cadastro foi realizado com sucesso.'
        });

        close();
        fetchSuppliers();
    };

    return (
        <Modal
            open
            title="Cadastrar fornecedor"
            confirmLoading={isSending}
            onOk={form.submit}
            okText="Cadastrar"
            okButtonProps={{ disabled: isLookingUpCnpj }}
            onCancel={close}
            cancelText="Cancelar"
            cancelButtonProps={{ disabled: isLookingUpCnpj || isSending }}
        >
            <Divider />

            <Form
                form={form}
                onFinish={onFinish}
                name="createSupplier"
                layout="vertical"
                autoComplete="off"
            >
                <SupplierFields
                    people={people}
                    isLookingUpCnpj={isLookingUpCnpj}
                    isLookupCnpjDisabled={isSending}
                    onLookupCnpj={onLookupCnpj}
                />
            </Form>
        </Modal>
    );
}
