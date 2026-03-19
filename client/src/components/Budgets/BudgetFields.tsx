import { Form, Input, InputNumber, Select } from 'antd';

import type { Budget } from '@internal-types/Budget.type';
import type { Condominium } from '@internal-types/Condominium.type';
import type { Supplier } from '@internal-types/Supplier.type';

export type Values = {
    supplier_id: Supplier.Model['id'],
    condominium_id: Condominium.Model['id'],
    title: string,
    service_description: string,
    value: number,
    category: Budget.Category,
    status: Budget.Status,
};

type Props = {
    suppliers: Supplier.Model[],
    condominiums: Condominium.Model[],
};

const CATEGORIES: Budget.Category[] = [
    'Manutenção preventiva',
    'Manutenção corretiva',
    'Obra ou reforma',
    'Contratação recorrente',
    'Compra pontual'
];

const STATUS: Budget.Status[] = [
    'Rascunho',
    'Enviado',
    'Em análise',
    'Aprovado',
    'Reprovado',
    'Cancelado'
];

export function BudgetFields({ suppliers, condominiums }: Props) {
    return (
        <>
            <Form.Item<Values>
                name="supplier_id"
                label="Fornecedor"
                rules={[{ required: true, message: 'Por favor, selecione o fornecedor.' }]}
            >
                <Select
                    placeholder="Selecione"
                    options={suppliers.map(supplier => ({
                        label: supplier.trade_name,
                        value: supplier.id
                    }))}
                />
            </Form.Item>

            <Form.Item<Values>
                name="condominium_id"
                label="Condomínio"
                rules={[{ required: true, message: 'Por favor, selecione o condomínio.' }]}
            >
                <Select
                    placeholder="Selecione"
                    options={condominiums.map(condominium => ({
                        label: condominium.name,
                        value: condominium.id
                    }))}
                />
            </Form.Item>

            <Form.Item<Values>
                name="title"
                label="Título"
                rules={[{ required: true, message: 'Por favor, digite o título.' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item<Values>
                name="service_description"
                label="Descrição do serviço"
                rules={[{ required: true, message: 'Por favor, digite a descrição do serviço.' }]}
            >
                <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item<Values>
                name="value"
                label="Valor"
                rules={[{ required: true, message: 'Por favor, informe o valor.' }]}
            >
                <InputNumber
                    style={{ width: '100%' }}
                    min={0.01}
                    step={0.01}
                    precision={2}
                    controls={false}
                    placeholder="0,00"
                />
            </Form.Item>

            <Form.Item<Values>
                name="category"
                label="Categoria"
                rules={[{ required: true, message: 'Por favor, selecione a categoria.' }]}
            >
                <Select
                    placeholder="Selecione"
                    options={CATEGORIES.map(category => ({
                        label: category,
                        value: category
                    }))}
                />
            </Form.Item>

            <Form.Item<Values>
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Por favor, selecione o status.' }]}
            >
                <Select
                    placeholder="Selecione"
                    options={STATUS.map(status => ({
                        label: status,
                        value: status
                    }))}
                />
            </Form.Item>
        </>
    );
}
