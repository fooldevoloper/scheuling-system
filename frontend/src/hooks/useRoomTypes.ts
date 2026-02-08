import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomTypeApi, queryKeys } from '@/lib';
import type { RoomTypeFormData } from '@/types';

export const useRoomTypes = (params?: Record<string, unknown>) => {
    return useQuery({
        queryKey: queryKeys.roomTypes.list(params),
        queryFn: () => roomTypeApi.getAll(params),
    });
};

export const useRoomType = (id: string) => {
    return useQuery({
        queryKey: queryKeys.roomTypes.detail(id),
        queryFn: () => roomTypeApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateRoomType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: RoomTypeFormData) => roomTypeApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.roomTypes.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
        },
    });
};

export const useUpdateRoomType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: RoomTypeFormData }) =>
            roomTypeApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.roomTypes.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
        },
    });
};

export const useDeleteRoomType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => roomTypeApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.roomTypes.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
        },
    });
};
