import type { Condominium } from '@internal-types/Condominium.type';

import type { 
    CreateCondominium,
    DeleteCondominium,
    FindCondominium,
    ListCondominiums,
    UpdateCondominium
} from './contracts/Condominium.contract';
import { Request } from './Request';

export const listCondominiums = (): Promise<ListCondominiums.Response> => Request.get('/condominiums');

export const findCondominium = (
    id: Condominium.Model['id'],
): Promise<FindCondominium.Response> => Request.get(`/condominiums/${id}`);

export const createCondominium = (
    body: CreateCondominium.Body,
): Promise<CreateCondominium.Response> => Request.post('/condominiums', body);

export const updateCondominium = (
    id: Condominium.Model['id'],
    body: UpdateCondominium.Body,
): Promise<UpdateCondominium.Response> => Request.put(`/condominiums/${id}`, body);

export const deleteCondominium = (
    id: Condominium.Model['id'],
): Promise<DeleteCondominium.Response> => Request.delete(`/condominiums/${id}`);