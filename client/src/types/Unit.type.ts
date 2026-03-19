import type { Condominium } from './Condominium.type';

export namespace Unit {
    export type Model = {
        name: string,
        square_meters: number,
        bedroom_count: number,
        condominium_id: Condominium.Model['id'],
        condominium?: Condominium.Model,
        created_at: string,
        updated_at: string,
        deleted_at: string | null,
    }
}