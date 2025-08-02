export function fetchState() {
    let state = $state<{
        status: 'idle' | 'loading' | 'success' | 'error';
        message?: string;
    }>({ status: 'idle' });

    return {
        get status() {
            return state.status;
        },
        get message() {
            return state.message || '';
        },
        setLoading: () => (state = { status: 'loading' }),
        setSuccess: () => (state = { status: 'success' }),
        setError: (message: string) => (state = { status: 'error', message }),
        reset: () => (state = { status: 'idle' })
    };
}
