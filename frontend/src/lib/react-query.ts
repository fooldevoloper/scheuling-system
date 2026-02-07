import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 0,
        },
    },
});

// Query Keys
export const queryKeys = {
    classes: {
        all: ['classes'] as const,
        list: (params?: Record<string, unknown>) => ['classes', 'list', params] as const,
        detail: (id: string) => ['classes', 'detail', id] as const,
        calendar: (params?: Record<string, unknown>) => ['classes', 'calendar', params] as const,
    },
    roomTypes: {
        all: ['room-types'] as const,
        list: (params?: Record<string, unknown>) => ['room-types', 'list', params] as const,
        detail: (id: string) => ['room-types', 'detail', id] as const,
    },
    rooms: {
        all: ['rooms'] as const,
        list: (params?: Record<string, unknown>) => ['rooms', 'list', params] as const,
        detail: (id: string) => ['rooms', 'detail', id] as const,
    },
    instructors: {
        all: ['instructors'] as const,
        list: (params?: Record<string, unknown>) => ['instructors', 'list', params] as const,
        detail: (id: string) => ['instructors', 'detail', id] as const,
    },
    instances: {
        all: ['instances'] as const,
        list: (params?: Record<string, unknown>) => ['instances', 'list', params] as const,
        detail: (id: string) => ['instances', 'detail', id] as const,
    },
};
