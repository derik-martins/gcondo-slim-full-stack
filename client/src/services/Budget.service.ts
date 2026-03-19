import type { Budget } from '@internal-types/Budget.type';

import type {
    CreateBudget,
    DeleteBudget,
    FindBudget,
    ListBudgets,
    UpdateBudget
} from './contracts/Budget.contract';
import { Request } from './Request';

export const listBudgets = (): Promise<ListBudgets.Response> => Request.get('/budgets');

export const findBudget = (
    id: Budget.Model['id'],
): Promise<FindBudget.Response> => Request.get(`/budgets/${id}`);

export const createBudget = (
    body: CreateBudget.Body,
): Promise<CreateBudget.Response> => Request.post('/budgets', body);

export const updateBudget = (
    id: Budget.Model['id'],
    body: UpdateBudget.Body,
): Promise<UpdateBudget.Response> => Request.put(`/budgets/${id}`, body);

export const deleteBudget = (
    id: Budget.Model['id'],
): Promise<DeleteBudget.Response> => Request.delete(`/budgets/${id}`);
