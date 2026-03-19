import { Checkbox, Form, Input } from 'antd';

export type Values = {
    full_name: string,
    cpf: string,
    email: string,
    birth_date: string,
    consent: boolean,
};

export function PersonFields() {
    return (
        <>
            <Form.Item<Values>
                name="full_name"
                label="Nome completo"
                rules={[{ required: true, message: 'Por favor, digite o nome completo.' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item<Values>
                name="cpf"
                label="CPF"
                rules={[
                    { required: true, message: 'Por favor, digite o CPF.' },
                    {
                        validator: (_, value) => {
                            const cpf = String(value ?? '').replace(/\D/g, '');

                            if (cpf.length === 11)
                                return Promise.resolve();

                            return Promise.reject(new Error('O CPF deve conter 11 dígitos.'));
                        }
                    }
                ]}
            >
                <Input placeholder="000.000.000-00" maxLength={14} />
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
                name="birth_date"
                label="Data de nascimento"
                rules={[{ required: true, message: 'Por favor, selecione a data de nascimento.' }]}
            >
                <Input type="date" />
            </Form.Item>

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
                    Declaro que os dados informados são verdadeiros e estou ciente de que este registro poderá ser utilizado por outros condomínios da Gcondo.
                </Checkbox>
            </Form.Item>
        </>
    );
}
