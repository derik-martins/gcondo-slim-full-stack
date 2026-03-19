import { Button, Checkbox, Form, Input, Select } from 'antd';

import type { Person } from '@internal-types/Person.type';
import type { Supplier } from '@internal-types/Supplier.type';

export type Values = {
    legal_name: string,
    trade_name: string,
    cnpj: string,
    email: string,
    zip_code: string,
    address: string,
    category: Supplier.Category,
    person_ids: Person.Model['id'][],
    consent: boolean,
};

type Props = {
    people: Person.Model[],
    isLookingUpCnpj?: boolean,
    isLookupCnpjDisabled?: boolean,
    onLookupCnpj?: () => void,
    showConsent?: boolean,
    showLookupCnpj?: boolean,
};

const CATEGORIES: Supplier.Category[] = [
    'Manutenção predial',
    'Limpeza e conservação',
    'Segurança e portaria',
    'Elétrica e hidráulica',
    'Obras e reformas',
    'Administrativo e outros'
];

export function SupplierFields({
    people,
    isLookingUpCnpj = false,
    isLookupCnpjDisabled = false,
    onLookupCnpj,
    showConsent = true,
    showLookupCnpj = true
}: Props) {
    return (
        <>
            <Form.Item<Values>
                name="legal_name"
                label="Razão social"
                rules={[{ required: true, message: 'Por favor, digite a razão social.' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item<Values>
                name="trade_name"
                label="Nome fantasia"
                rules={[{ required: true, message: 'Por favor, digite o nome fantasia.' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item<Values>
                name="cnpj"
                label="CNPJ"
                rules={[
                    { required: true, message: 'Por favor, digite o CNPJ.' },
                    {
                        validator: (_, value) => {
                            const cnpj = String(value ?? '').replace(/\D/g, '');

                            if (cnpj.length === 14)
                                return Promise.resolve();

                            return Promise.reject(new Error('O CNPJ deve conter 14 dígitos.'));
                        }
                    }
                ]}
            >
                <Input
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    addonAfter={showLookupCnpj ? (
                        <Button
                            type="default"
                            loading={isLookingUpCnpj}
                            disabled={isLookupCnpjDisabled}
                            onClick={onLookupCnpj}
                        >
                            Consultar CNPJ
                        </Button>
                    ) : null}
                />
            </Form.Item>

            <Form.Item<Values>
                name="email"
                label="E-mail"
                rules={[
                    { required: true, message: 'Por favor, digite o e-mail.' },
                    { type: 'email', message: 'Por favor, digite um e-mail válido.' }
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item<Values>
                name="zip_code"
                label="CEP"
                rules={[
                    { required: true, message: 'Por favor, digite o CEP.' },
                    {
                        validator: (_, value) => {
                            const zipCode = String(value ?? '').replace(/\D/g, '');

                            if (zipCode.length === 8)
                                return Promise.resolve();

                            return Promise.reject(new Error('O CEP deve conter 8 dígitos.'));
                        }
                    }
                ]}
            >
                <Input placeholder="00000-000" maxLength={9} />
            </Form.Item>

            <Form.Item<Values>
                name="address"
                label="Endereço"
                rules={[{ required: true, message: 'Por favor, digite o endereço.' }]}
            >
                <Input />
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
                name="person_ids"
                label="Pessoas vinculadas"
                rules={[{ required: true, message: 'Selecione pelo menos uma pessoa.' }]}
            >
                <Select
                    mode="multiple"
                    placeholder="Selecione uma ou mais pessoas"
                    options={people.map(person => ({
                        label: person.full_name,
                        value: person.id
                    }))}
                />
            </Form.Item>

            {showConsent && (
                <Form.Item<Values>
                    name="consent"
                    valuePropName="checked"
                    rules={[
                        {
                            validator: (_, value) => {
                                if (value === true)
                                    return Promise.resolve();

                                return Promise.reject(new Error('É necessário confirmar a declaração para continuar.'));
                            }
                        }
                    ]}
                >
                    <Checkbox>
                        Declaro que os dados informados são verdadeiros e estou ciente de que este registro poderá ser utilizado por outros condomínios da Gcondo
                    </Checkbox>
                </Form.Item>
            )}
        </>
    );
}
