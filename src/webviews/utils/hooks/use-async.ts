import * as React from "react";


export enum AsyncStatus {
    Idle = 'idle',
    Loading = 'loading',
    Success = 'success',
    Error = 'error',
}

export type AsyncStatusType = `${AsyncStatus}`;

type AsyncState<TData, TError = Error> =
    | { status: AsyncStatus.Idle; data: undefined, error: undefined, isLoading: false, isSuccess: false, isError: false, isFetching: boolean, isIdle: true }
    | { status: AsyncStatus.Loading; data: undefined, error: undefined, isLoading: true, isSuccess: false, isError: false, isFetching: true, isIdle: false }
    | { status: AsyncStatus.Success; data: TData, error: undefined, isLoading: false, isSuccess: true, isError: false, isFetching: boolean, isIdle: false }
    | { status: AsyncStatus.Error; data: undefined, error: TError, isLoading: false, isSuccess: false, isError: true, isFetching: boolean, isIdle: false };

interface UseAsyncOptions<TData> {
    enabled?: boolean,
    initialData?: TData;
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
}

const defaultOptions = {
    enabled: true
};

export function useAsync<TData>(
    asyncFn: () => Promise<TData>,
    options: UseAsyncOptions<TData> = {}
) {
    const _options = Object.assign(options, defaultOptions);
    const [state, setState] = React.useState<AsyncState<TData>>(() =>
        _options.initialData ?
            {
                status: AsyncStatus.Success,
                data: _options.initialData,
                isIdle: false,
                error: undefined,
                isLoading: false,
                isSuccess: true,
                isError: false,
                isFetching: false,
            }
            : {
                status: AsyncStatus.Idle,
                data: undefined,
                isIdle: true,
                error: undefined,
                isLoading: false,
                isSuccess: false,
                isError: false,
                isFetching: false,
            }
    );

    const execute = React.useCallback(async () => {
        setState(prev => {
            if (prev.data) {
                return {
                    ...prev,
                    isFetching: true,
                };
            } else {
                return {
                    status: AsyncStatus.Loading,
                    data: undefined,
                    error: undefined,
                    isIdle: false,
                    isLoading: true,
                    isSuccess: false,
                    isError: false,
                    isFetching: true,
                };
            }
        });

        try {
            const data = await asyncFn();
            setState({
                status: AsyncStatus.Success,
                data,
                error: undefined,
                isIdle: false,
                isLoading: false,
                isSuccess: true,
                isError: false,
                isFetching: false,
            });
            _options.onSuccess?.(data);
        } catch (error) {
            setState({
                data: undefined,
                status: AsyncStatus.Error,
                error: error as Error,
                isIdle: false,
                isLoading: false,
                isSuccess: false,
                isError: true,
                isFetching: false,
            });
            _options.onError?.(error as Error);
        }
    }, [asyncFn, _options]);

    React.useEffect(() => {
        if (_options.enabled) {
            execute();
        }
    }, [_options.enabled]);

    return {
        ...state,
        execute,
    };
}