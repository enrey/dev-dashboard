import { QueryClient } from "@tanstack/react-query";

// Создаем QueryClient один раз вне компонентов
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

