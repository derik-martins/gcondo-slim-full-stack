import type { Condominium } from '@internal-types/Condominium.type';
import type { Service } from '@internal-types/Service.type';

export namespace ListCondominiums {    
    type Data = { condominiums: Condominium.Model[] };

    export type Response =
        | Service.DefaultResponse<Data>
        | Service.ExceptionResponse;
}

export namespace FindCondominium {    
    type Data = { condominium: Condominium.Model };

    export type Response =
        | Service.DefaultResponse<Data>
        | Service.ExceptionResponse;
}

export namespace CreateCondominium {
    export type Body = Pick<
        Condominium.Model,
        'name' | 'zip_code' | 'url'
    >

    type Data = { condominium: Condominium.Model };

    export type Response =
        | Service.DefaultResponse<Data>
        | Service.ExceptionResponse;
}

export namespace UpdateCondominium {
    export type Body = Pick<
        Condominium.Model,
        'name' | 'zip_code' | 'url'
    >

    type Data = { condominium: Condominium.Model };

    export type Response =
        | Service.DefaultResponse<Data>
        | Service.ExceptionResponse;
}

export namespace DeleteCondominium {
    export type Response =
        | Service.DefaultResponse
        | Service.ExceptionResponse;
}