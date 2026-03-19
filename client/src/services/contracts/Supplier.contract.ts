import type { Service } from '@internal-types/Service.type';
import type { Supplier } from '@internal-types/Supplier.type';

export namespace ListSuppliers {
    type Data = { suppliers: Supplier.Model[] };

    export type Response =
        | Service.DefaultResponse<Data>
        | Service.ExceptionResponse;
}

export namespace FindSupplier {
    type Data = { supplier: Supplier.Model };

    export type Response =
        | Service.DefaultResponse<Data>
        | Service.ExceptionResponse;
}

export namespace LookupSupplierByCnpj {
    export type Data = {
        supplier_preview: {
            provider: 'receitaws' | 'brasilapi',
            supplier: Pick<
                Supplier.Model,
                'cnpj' | 'legal_name' | 'trade_name' | 'email' | 'zip_code' | 'address'
            >,
        },
    };

    export type Response =
        | Service.DefaultResponse<Data>
        | Service.ExceptionResponse;
}

export namespace CreateSupplier {
    export type Body = Pick<
        Supplier.Model,
        'legal_name' | 'trade_name' | 'cnpj' | 'email' | 'zip_code' | 'address' | 'category'
    > & {
        person_ids: number[],
    };

    type Data = { supplier: Supplier.Model };

    export type Response =
        | Service.DefaultResponse<Data>
        | Service.ExceptionResponse;
}

export namespace UpdateSupplier {
    export type Body = Pick<
        Supplier.Model,
        'legal_name' | 'trade_name' | 'cnpj' | 'email' | 'zip_code' | 'address' | 'category'
    > & {
        person_ids: number[],
    };

    type Data = { supplier: Supplier.Model };

    export type Response =
        | Service.DefaultResponse<Data>
        | Service.ExceptionResponse;
}

export namespace DeleteSupplier {
    export type Response =
        | Service.DefaultResponse
        | Service.ExceptionResponse;
}
