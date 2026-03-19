import type { Condominium } from './Condominium.type';

export namespace Person {
    export type Model = {
        id: number,
        full_name: string,
        cpf: string,
        email: string,
        birth_date: string,
        created_by_condominium_id: Condominium.Model['id'] | null,
        created_by_condominium?: Condominium.Model | null,
        created_at: string,
        updated_at: string,
        deleted_at: string | null,
    }
}
