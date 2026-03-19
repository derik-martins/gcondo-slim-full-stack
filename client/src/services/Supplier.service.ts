import type { Supplier } from '@internal-types/Supplier.type';

import type {
    CreateSupplier,
    DeleteSupplier,
    FindSupplier,
    ListSuppliers,
    LookupSupplierByCnpj,
    UpdateSupplier
} from './contracts/Supplier.contract';
import { Request } from './Request';

export const listSuppliers = (): Promise<ListSuppliers.Response> => Request.get('/suppliers');

export const findSupplier = (
    id: Supplier.Model['id'],
): Promise<FindSupplier.Response> => Request.get(`/suppliers/${id}`);

export const lookupSupplierByCnpj = (
    cnpj: Supplier.Model['cnpj'],
): Promise<LookupSupplierByCnpj.Response> => Request.get(`/suppliers/cnpj/${cnpj}`);

export const createSupplier = (
    body: CreateSupplier.Body,
): Promise<CreateSupplier.Response> => Request.post('/suppliers', body);

export const updateSupplier = (
    id: Supplier.Model['id'],
    body: UpdateSupplier.Body,
): Promise<UpdateSupplier.Response> => Request.put(`/suppliers/${id}`, body);

export const deleteSupplier = (
    id: Supplier.Model['id'],
): Promise<DeleteSupplier.Response> => Request.delete(`/suppliers/${id}`);
