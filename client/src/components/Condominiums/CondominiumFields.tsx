import { Fragment } from 'react';

import { Form, Input } from 'antd';

export type Values = {
    name: string,
    zip_code: string,
    url: string,
};

export function CondominiumFields() {
    return (
        <Fragment>
            <Form.Item<Values>
                name="name"
                label="Nome"
                rules={[{ required: true, message: 'Por favor, digite um nome.' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item<Values>
                name="zip_code"
                label="CEP"
                rules={[{ required: true, message: 'Por favor, digite um CEP.' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item<Values>
                name="url"
                label="URL"
                rules={[{ required: true, message: 'Por favor, digite uma URL.' }]}
            >
                <Input />
            </Form.Item>
        </Fragment>
    );
}
