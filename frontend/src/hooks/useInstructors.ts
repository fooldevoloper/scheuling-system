import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorApi, queryKeys } from '@/lib';
import type { InstructorFormData } from '@/types';

export const useInstructors = (params?: Record<string, unknown>) => {
    return useQuery({
        queryKey: queryKeys.instructors.list(params),
        queryFn: () => instructorApi.getAll(params),
    });
};

export const useInstructor = (id: string) => {
    return useQuery({
        queryKey: queryKeys.instructors.detail(id),
        queryFn: () => instructorApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateInstructor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: InstructorFormData) => instructorApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.instructors.all });
        },
    });
};

export const useUpdateInstructor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: InstructorFormData }) =>
            instructorApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.instructors.all });
        },
    });
};

export const useDeleteInstructor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => instructorApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.instructors.all });
        },
    });
};
