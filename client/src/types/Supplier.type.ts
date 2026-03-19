import type { Person } from './Person.type';

export namespace Supplier {
    export type Category =
        | 'Manutenção predial'
        | 'Limpeza e conservação'
        | 'Segurança e portaria'
        | 'Elétrica e hidráulica'
        | 'Obras e reformas'
        | 'Administrativo e outros';

    export type Model = {
        id: number,
        legal_name: string,
        trade_name: string,
        cnpj: string,
        email: string,
        zip_code: string,
        address: string,
        category: Category,
        people?: Person.Model[],
        created_at: string,
        updated_at: string,
        deleted_at: string | null,
    }
}
