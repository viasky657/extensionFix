import * as React from "react";

type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

interface AsyncState<TData, TError = Error> {
    status: AsyncStatus;
    data?: TData;
    error?: TError;
    isIdle: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    isFetching: boolean;
}

interface UseAsyncOptions<TData> {
    initialData?: TData;
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
}

export function useAsync<TData>(
    asyncFn: () => Promise<TData>,
    options: UseAsyncOptions<TData> = {}
) {
    const [state, setState] = React.useState<AsyncState<TData>>({
        status: options.initialData ? 'success' : 'idle',
        data: options.initialData,
        isIdle: !options.initialData,
        isLoading: false,
        isSuccess: !!options.initialData,
        isError: false,
        isFetching: false,
    });

    const execute = React.useCallback(async () => {
        setState(prev => ({
            ...prev,
            status: prev.data ? prev.status : 'loading',
            isLoading: !prev.data,
            isFetching: true,
        }));

        try {
            const data = await asyncFn();
            setState({
                status: 'success',
                data,
                isIdle: false,
                isLoading: false,
                isSuccess: true,
                isError: false,
                isFetching: false,
            });
            options.onSuccess?.(data);
        } catch (error) {
            setState({
                status: 'error',
                error: error as Error,
                isIdle: false,
                isLoading: false,
                isSuccess: false,
                isError: true,
                isFetching: false,
            });
            options.onError?.(error as Error);
        }
    }, [asyncFn, options]);

    return {
        ...state,
        execute,
    };
}