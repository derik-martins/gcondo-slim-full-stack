import type { Budget } from '@internal-types/Budget.type';
import type { Service } from '@internal-types/Service.type';

export namespace ListBudgets {
    type Data = { budgets: Budget.Model[] };

    export type Response =
        | Service.DefaultResponse<Data>
        | Service.ExceptionResponse;
}

export namespace FindBudget {
    type Data = { budget: Budget.Model };

    export type Response =
        | Service.DefaultResponse<Data>
        | Service.ExceptionResponse;
}

export namespace CreateBudget {
    export type Body = Pick<
        Budget.Model,
        'supplier_id' | 'condominium_id' | 'title' | 'service_description' | 'value' | 'category' | 'status'
    >;

    type Data = { budget: Budget.Model };

    export type Response =
        | Service.DefaultResponse<Data>
        | Service.ExceptionResponse;
}

export namespace UpdateBudget {
    export type Body = Pick<
        Budget.Model,
        'supplier_id' | 'condominium_id' | 'title' | 'service_description' | 'value' | 'category' | 'status'
    >;

    type Data = { budget: Budget.Model };

    export type Response =
        | Service.DefaultResponse<Data>
        | Service.ExceptionResponse;
}

export namespace DeleteBudget {
    export type Response =
        | Service.DefaultResponse
        | Service.ExceptionResponse;
}
