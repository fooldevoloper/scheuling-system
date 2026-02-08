import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi, queryKeys } from '@/lib';
import type { RoomFormData } from '@/types';

export const useRooms = (params?: Record<string, unknown>) => {
    return useQuery({
        queryKey: queryKeys.rooms.list(params),
        queryFn: () => roomApi.getAll(params),
    });
};

export const useRoom = (id: string) => {
    return useQuery({
        queryKey: queryKeys.rooms.detail(id),
        queryFn: () => roomApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: RoomFormData) => roomApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.roomTypes.all });
        },
    });
};

export const useUpdateRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: RoomFormData }) =>
            roomApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.roomTypes.all });
        },
    });
};

export const useDeleteRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => roomApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.roomTypes.all });
        },
    });
};
