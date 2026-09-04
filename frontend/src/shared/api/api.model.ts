//import { SetDataFunc } from "../../contexts/data";

export interface GetStatsProps {
    dateStart: string;
    dateEnd: string;
    failCallback?: (e: Error) => void;
    successCallback?: (data: any) => void;
    forceUpdate?: boolean;
}

// export type Loader = <P,T,U>(api: (params: P) => T, params: P, mapper: (date: T) => U, store: keyof DataStore) => Promise<void>
//
// export type LoadingStoreKeys<T> = { [k in keyof T]: T[k] extends LoadingStatus ? k : never }[keyof T];
//
// export type DataStoreKeys<T, U> = { [k in keyof T]: T[k] extends U ? k : never }[keyof T];
//
//
// type IfEquals<X, Y, A, B> =
//     (<T>() => T extends X ? 1 : 2) extends
//         (<T>() => T extends Y ? 1 : 2) ? A : B;
//
//
// export type WritableKeysOf<T> = {
//     [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>
// }[keyof T];
//
// export type WritablePart<T> = Pick<T, WritableKeysOf<T>>;
//
//
// static async loaderData<P,T,U>(
//     api: (params: P) => T,
//     params: P,
//     mapper: (date: T) => U,
//     loaderStore: LoadingStoreKeys<LoadersStore>,
//     dataStore: keyof WritablePart<DataStore>
// // dataStore: DataStoreKeys<DataStore>
// ): Promise<void> {
//     try {
//         const result = await api(params)
//         store.loaders[loaderStore] = LoadingStatus.done
//
//         store.data[dataStore] = result
//
//     } catch (err) {
//         store.loaders.git = LoadingStatus.error
//         return []
//     }
// }
