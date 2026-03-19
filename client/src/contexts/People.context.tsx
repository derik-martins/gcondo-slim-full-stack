import {
    createContext,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useState
} from 'react';

import { App } from 'antd';

import { UnknownContextError } from '@errors/UnknownContextError';
import { handleServiceError, hasServiceError } from '@helpers/Service.helper';
import type { Person } from '@internal-types/Person.type';
import { listPeople } from '@services/Person.service';

type Value = {
    people: Person.Model[],
    isLoading: boolean,
    isCreateModalVisible: boolean,
    setIsCreateModalVisible: Dispatch<SetStateAction<Value['isCreateModalVisible']>>,
    fetchPeople: () => Promise<void>,
}

type Props = { children: (value: Value) => ReactNode };

// eslint-disable-next-line react-refresh/only-export-components
export const PeopleContext = createContext<Value | null>(null);

export function PeopleContextProvider({ children }: Props) {
    const [isLoading, setIsLoading] = useState<Value['isLoading']>(true);
    const [people, setPeople] = useState<Value['people']>([]);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

    const app = App.useApp();

    const fetchPeople = useCallback(async () => {
        setIsLoading(true);

        const response = await listPeople();

        setIsLoading(false);

        if (hasServiceError(response))
            return handleServiceError(app, response);

        setPeople(response.data.people);
    }, [app]);

    useEffect(() => {
        fetchPeople();
    }, [fetchPeople]);

    const value: Value = {
        people,
        isLoading,
        isCreateModalVisible,
        setIsCreateModalVisible,
        fetchPeople
    };

    return (
        <PeopleContext.Provider value={value}>
            {children(value)}
        </PeopleContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePeopleContext() {
    const context = useContext(PeopleContext);

    if (!context)
        throw new UnknownContextError();

    return context;
}
