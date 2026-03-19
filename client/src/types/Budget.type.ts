import type { Condominium } from './Condominium.type';
import type { Supplier } from './Supplier.type';

export namespace Budget {
    export type Category =
        | 'Manutenção preventiva'
        | 'Manutenção corretiva'
        | 'Obra ou reforma'
        | 'Contratação recorrente'
        | 'Compra pontual';

    export type Status =
        | 'Rascunho'
        | 'Enviado'
        | 'Em análise'
        | 'Aprovado'
        | 'Reprovado'
        | 'Cancelado';

    export type Model = {
        id: number,
        supplier_id: Supplier.Model['id'],
        condominium_id: Condominium.Model['id'],
        title: string,
        service_description: string,
        value: string,
        category: Category,
        status: Status,
        supplier?: Supplier.Model,
        condominium?: Condominium.Model,
        created_at: string,
        updated_at: string,
        deleted_at: string | null,
    }
}
