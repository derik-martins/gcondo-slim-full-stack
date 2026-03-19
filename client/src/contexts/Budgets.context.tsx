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
import type { Budget } from '@internal-types/Budget.type';
import type { Condominium } from '@internal-types/Condominium.type';
import type { Supplier } from '@internal-types/Supplier.type';
import { listBudgets } from '@services/Budget.service';
import { listCondominiums } from '@services/Condominium.service';
import { listSuppliers } from '@services/Supplier.service';

type Value = {
    budgets: Budget.Model[],
    budget: Budget.Model | null,
    budgetId: Budget.Model['id'] | null,
    setBudgetId: Dispatch<SetStateAction<Value['budgetId']>>,
    suppliers: Supplier.Model[],
    condominiums: Condominium.Model[],
    isLoading: boolean,
    isCreateModalVisible: boolean,
    setIsCreateModalVisible: Dispatch<SetStateAction<Value['isCreateModalVisible']>>,
    isEditModalVisible: boolean,
    setIsEditModalVisible: Dispatch<SetStateAction<Value['isEditModalVisible']>>,
    fetchBudgets: () => Promise<void>,
}

type Props = { children: (value: Value) => ReactNode };

// eslint-disable-next-line react-refresh/only-export-components
export const BudgetsContext = createContext<Value | null>(null);

export function BudgetsContextProvider({ children }: Props) {
    const [isLoading, setIsLoading] = useState<Value['isLoading']>(true);
    const [budgets, setBudgets] = useState<Value['budgets']>([]);
    const [budgetId, setBudgetId] = useState<Value['budgetId']>(null);
    const [suppliers, setSuppliers] = useState<Value['suppliers']>([]);
    const [condominiums, setCondominiums] = useState<Value['condominiums']>([]);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const app = App.useApp();

    const fetchBudgets = useCallback(async () => {
        setIsLoading(true);

        const [budgetsResponse, suppliersResponse, condominiumsResponse] = await Promise.all([
            listBudgets(),
            listSuppliers(),
            listCondominiums()
        ]);

        setIsLoading(false);

        if (hasServiceError(budgetsResponse))
            return handleServiceError(app, budgetsResponse);

        if (hasServiceError(suppliersResponse))
            return handleServiceError(app, suppliersResponse);

        if (hasServiceError(condominiumsResponse))
            return handleServiceError(app, condominiumsResponse);

        setBudgets(budgetsResponse.data.budgets);
        setSuppliers(suppliersResponse.data.suppliers);
        setCondominiums(condominiumsResponse.data.condominiums);
    }, [app]);

    useEffect(() => {
        fetchBudgets();
    }, [fetchBudgets]);

    const budget = useMemo(() => {
        if (!budgetId)
            return null;

        const found = budgets.find(item => item.id === budgetId);

        if (!found)
            return null;

        return found;
    }, [budgets, budgetId]);

    const value: Value = {
        budgets,
        budget,
        budgetId,
        setBudgetId,
        suppliers,
        condominiums,
        isLoading,
        isCreateModalVisible,
        setIsCreateModalVisible,
        isEditModalVisible,
        setIsEditModalVisible,
        fetchBudgets
    };

    return (
        <BudgetsContext.Provider value={value}>
            {children(value)}
        </BudgetsContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBudgetsContext() {
    const context = useContext(BudgetsContext);

    if (!context)
        throw new UnknownContextError();

    return context;
}
