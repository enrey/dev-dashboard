import { createContext, FC } from "react";

import {
    DataContextData,
    DataContextProviderProps,
    InitialDataContext,
} from "./DataContext.model";
import { useDataContext } from "./useDataContext";

const ContextInitialValue: InitialDataContext = {
    gitAnalyzerInfo: [],
    tasksData: [],
    jiraUsers: [],
    gitlabData: [],
    gitlabUsers: [],
    presenceUsers: [],
    gitlabMrComments: [],
    presence: [],
    gitTasksList: [],
    tasksStats: [],
    confluenceData: [],
};

export const DataContext = createContext({} as DataContextData);
export const DataContextProvider: FC<DataContextProviderProps> = ({ children }) => {
    const contextValue = useDataContext(ContextInitialValue);

    return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};
