import type { Person } from '@internal-types/Person.type';

import type {
    CreatePerson,
    FindPerson,
    ListPeople
} from './contracts/Person.contract';
import { Request } from './Request';

export const listPeople = (): Promise<ListPeople.Response> => Request.get('/people');

export const findPerson = (
    id: Person.Model['id'],
): Promise<FindPerson.Response> => Request.get(`/people/${id}`);

export const createPerson = (
    body: CreatePerson.Body,
): Promise<CreatePerson.Response> => Request.post('/people', body);
