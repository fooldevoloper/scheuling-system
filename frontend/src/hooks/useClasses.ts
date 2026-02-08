import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classApi, queryKeys } from '@/lib';
import type { ClassesQueryParams } from '@/types';

export const useClasses = (params?: ClassesQueryParams) => {
    return useQuery({
        queryKey: queryKeys.classes.list(params as Record<string, unknown>),
        queryFn: () => classApi.getAll(params as Record<string, unknown>),
    });
};

export const useClass = (id: string) => {
    return useQuery({
        queryKey: queryKeys.classes.detail(id),
        queryFn: () => classApi.getById(id),
        enabled: !!id,
    });
};

export const useCalendar = (params?: ClassesQueryParams) => {
    return useQuery({
        queryKey: queryKeys.classes.calendar(params as Record<string, unknown>),
        queryFn: () => classApi.getCalendar(params as Record<string, unknown>),
    });
};

export const useCreateClass = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: unknown) => classApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.classes.calendar() });
            queryClient.invalidateQueries({ queryKey: queryKeys.instructors.all });
        },
    });
};

export const useUpdateClass = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: unknown }) =>
            classApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.instructors.all });
        },
    });
};

export const useDeleteClass = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => classApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.instructors.all });
        },
    });
};

export const useGenerateInstances = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => classApi.generateInstances(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.classes.calendar() });
        },
    });
};
