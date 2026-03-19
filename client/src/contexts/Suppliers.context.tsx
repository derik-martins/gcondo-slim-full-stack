import {
    createContext,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';

import { App } from 'antd';

import { UnknownContextError } from '@errors/UnknownContextError';
import { handleServiceError, hasServiceError } from '@helpers/Service.helper';
import type { Person } from '@internal-types/Person.type';
import type { Supplier } from '@internal-types/Supplier.type';
import { listPeople } from '@services/Person.service';
import { listSuppliers } from '@services/Supplier.service';

type Value = {
    suppliers: Supplier.Model[],
    supplier: Supplier.Model | null,
    supplierId: Supplier.Model['id'] | null,
    setSupplierId: Dispatch<SetStateAction<Value['supplierId']>>,
    people: Person.Model[],
    isLoading: boolean,
    isCreateModalVisible: boolean,
    setIsCreateModalVisible: Dispatch<SetStateAction<Value['isCreateModalVisible']>>,
    isEditModalVisible: boolean,
    setIsEditModalVisible: Dispatch<SetStateAction<Value['isEditModalVisible']>>,
    fetchSuppliers: () => Promise<void>,
}

type Props = { children: (value: Value) => ReactNode };

// eslint-disable-next-line react-refresh/only-export-components
export const SuppliersContext = createContext<Value | null>(null);

export function SuppliersContextProvider({ children }: Props) {
    const [isLoading, setIsLoading] = useState<Value['isLoading']>(true);
    const [suppliers, setSuppliers] = useState<Value['suppliers']>([]);
    const [supplierId, setSupplierId] = useState<Value['supplierId']>(null);
    const [people, setPeople] = useState<Value['people']>([]);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const app = App.useApp();

    const fetchSuppliers = useCallback(async () => {
        setIsLoading(true);

        const [suppliersResponse, peopleResponse] = await Promise.all([
            listSuppliers(),
            listPeople()
        ]);

        setIsLoading(false);

        if (hasServiceError(suppliersResponse))
            return handleServiceError(app, suppliersResponse);

        if (hasServiceError(peopleResponse))
            return handleServiceError(app, peopleResponse);

        setSuppliers(suppliersResponse.data.suppliers);
        setPeople(peopleResponse.data.people);
    }, [app]);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    const supplier = useMemo(() => {
        if (!supplierId)
            return null;

        const found = suppliers.find(item => item.id === supplierId);

        if (!found)
            return null;

        return found;
    }, [suppliers, supplierId]);

    const value: Value = {
        suppliers,
        supplier,
        supplierId,
        setSupplierId,
        people,
        isLoading,
        isCreateModalVisible,
        setIsCreateModalVisible,
        isEditModalVisible,
        setIsEditModalVisible,
        fetchSuppliers
    };

    return (
        <SuppliersContext.Provider value={value}>
            {children(value)}
        </SuppliersContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSuppliersContext() {
    const context = useContext(SuppliersContext);

    if (!context)
        throw new UnknownContextError();

    return context;
}
