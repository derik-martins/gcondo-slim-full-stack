import type { Person } from '@internal-types/Person.type';
import type { Service } from '@internal-types/Service.type';

export namespace ListPeople {
    type Data = { people: Person.Model[] };

    export type Response =
        | Service.DefaultResponse<Data>
        | Service.ExceptionResponse;
}

export namespace FindPerson {
    type Data = { person: Person.Model };

    export type Response =
        | Service.DefaultResponse<Data>
        | Service.ExceptionResponse;
}

export namespace CreatePerson {
    export type Body = Pick<
        Person.Model,
        'full_name' | 'cpf' | 'email' | 'birth_date'
    >;

    type Data = { person: Person.Model };

    export type Response =
        | Service.DefaultResponse<Data>
        | Service.ExceptionResponse;
}
