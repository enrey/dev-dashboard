import { useCallback, useState } from "react";

import { AxiosResponse } from "axios";

export type HttpMethodType<T, K> = (params?: K) => Promise<AxiosResponse<T>>;

export type UseHttpResultType<T, K> = [
    (params?: K) => void,
    { params?: K | undefined; response: AxiosResponse<T> } | undefined,
    string,
    boolean
];

export interface ValidateError {
    [key: string]: string[] | string;
}

export const useHttp = <T, K>(
    httpMethod: HttpMethodType<T, K>
): UseHttpResultType<T, K> => {
    const [response, setResponse] =
        useState<{ params?: K | undefined; response: AxiosResponse<T> }>();
    const [error, setError] = useState<any>("");
    const [loading, setLoading] = useState(true);

    const getData = useCallback(
        async (params?: K | undefined) => {
            try {
                setLoading(true);
                const resp: AxiosResponse<T> = await httpMethod(params);

                setResponse({ params, response: resp });
            } catch (response: any) {
                const errors = response?.data?.errors as ValidateError;

                if (errors) {
                    alert(errors);
                    setError(errors);
                    setLoading(false);
                }
            } finally {
                setLoading(false);
            }
        },
        [httpMethod]
    );

    return [getData, response, error, loading];
};
