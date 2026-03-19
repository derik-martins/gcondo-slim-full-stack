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
import type { Condominium } from '@internal-types/Condominium.type';
import { listCondominiums } from '@services/Condominium.service';

type Value = {
    condominiums: Condominium.Model[],
    condominium: Condominium.Model | null,
    condominiumId: Condominium.Model['id'] | null,
    setCondominiumId: Dispatch<SetStateAction<Value['condominiumId']>>,
    isLoading: boolean,
    isCreateModalVisible: boolean,
    setIsCreateModalVisible: Dispatch<SetStateAction<Value['isCreateModalVisible']>>,
    isEditModalVisible: boolean,
    setIsEditModalVisible: Dispatch<SetStateAction<Value['isEditModalVisible']>>,
    fetchCondominiums: () => Promise<void>,
 }

 type Props = { children: (value: Value) => ReactNode };

// eslint-disable-next-line react-refresh/only-export-components
export const CondominiumsContext = createContext<Value | null>(null);

/** @see https://www.youtube.com/watch?v=I7dwJxGuGYQ */
export function CondominiumsContextProvider({ children }: Props) {
    const [isLoading, setIsLoading] = useState<Value['isLoading']>(true);

    const [condominiums, setCondominiums] = useState<Value['condominiums']>([]);
    const [condominiumId, setCondominiumId] = useState<Condominium.Model['id'] | null>(null);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    
    const app = App.useApp();
    
    const fetchCondominiums = useCallback(async () => {
        setIsLoading(true);
    
        const response = await listCondominiums();
    
        setIsLoading(false);
    
        if (hasServiceError(response))
            return handleServiceError(app, response);
    
        setCondominiums(response.data.condominiums);
    }, [app]);

    useEffect(() => {
        fetchCondominiums();
    }, [fetchCondominiums]);

    const condominium = useMemo(() => {
        if (!condominiumId)
            return null;

        const found = condominiums.find(condominium => condominium.id === condominiumId);

        if (!found)
            throw new Error(`Could not find a condominium with id ${condominiumId}`);

        return found;

    }, [condominiums, condominiumId]);

    const value: Value = { 
        isLoading,
        condominiums,
        condominium,
        condominiumId,
        setCondominiumId,
        isCreateModalVisible,
        setIsCreateModalVisible,
        isEditModalVisible,
        setIsEditModalVisible,
        fetchCondominiums,
    };

    return (
        <CondominiumsContext.Provider  value={value}>
            {children(value)}
        </CondominiumsContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCondominiumsContext() {
    const context = useContext(CondominiumsContext);

    if (!context)
        throw new UnknownContextError();

    return context;
}
