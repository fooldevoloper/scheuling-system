import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiResponse, PaginatedResponse, ApiError } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError<ApiError>) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('auth_token');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    async get<T>(url: string, config?: AxiosRequestConfig) {
        const response = await this.client.get<ApiResponse<T>>(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
        const response = await this.client.post<ApiResponse<T>>(url, data, config);
        return response.data;
    }

    async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
        const response = await this.client.put<ApiResponse<T>>(url, data, config);
        return response.data;
    }

    async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
        const response = await this.client.patch<ApiResponse<T>>(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig) {
        const response = await this.client.delete<ApiResponse<T>>(url, config);
        return response.data;
    }
}

export const apiClient = new ApiClient();

// API Methods for Classes
export const classApi = {
    getAll: (params?: Record<string, unknown>) =>
        apiClient.get<PaginatedResponse<unknown>>('/classes', { params }),
    getById: (id: string) => apiClient.get<unknown>(`/classes/${id}`),
    create: (data: unknown) => apiClient.post<unknown>('/classes', data),
    update: (id: string, data: unknown) => apiClient.put<unknown>(`/classes/${id}`, data),
    delete: (id: string) => apiClient.delete<unknown>(`/classes/${id}`),
    generateInstances: (id: string) =>
        apiClient.post<unknown>(`/classes/${id}/instances`),
    getCalendar: (params?: Record<string, unknown>) =>
        apiClient.get<unknown>('/classes/calendar', { params }),
};

// API Methods for Room Types
export const roomTypeApi = {
    getAll: (params?: Record<string, unknown>) =>
        apiClient.get<PaginatedResponse<unknown>>('/room-types', { params }),
    getById: (id: string) => apiClient.get<unknown>(`/room-types/${id}`),
    create: (data: unknown) => apiClient.post<unknown>('/room-types', data),
    update: (id: string, data: unknown) => apiClient.put<unknown>(`/room-types/${id}`, data),
    delete: (id: string) => apiClient.delete<unknown>(`/room-types/${id}`),
};

// API Methods for Rooms
export const roomApi = {
    getAll: (params?: Record<string, unknown>) =>
        apiClient.get<PaginatedResponse<unknown>>('/rooms', { params }),
    getById: (id: string) => apiClient.get<unknown>(`/rooms/${id}`),
    create: (data: unknown) => apiClient.post<unknown>('/rooms', data),
    update: (id: string, data: unknown) => apiClient.put<unknown>(`/rooms/${id}`, data),
    delete: (id: string) => apiClient.delete<unknown>(`/rooms/${id}`),
};

// API Methods for Instructors
export const instructorApi = {
    getAll: (params?: Record<string, unknown>) =>
        apiClient.get<PaginatedResponse<unknown>>('/instructors', { params }),
    getById: (id: string) => apiClient.get<unknown>(`/instructors/${id}`),
    create: (data: unknown) => apiClient.post<unknown>('/instructors', data),
    update: (id: string, data: unknown) => apiClient.put<unknown>(`/instructors/${id}`, data),
    delete: (id: string) => apiClient.delete<unknown>(`/instructors/${id}`),
};

// API Methods for Class Instances
export const instanceApi = {
    getAll: (params?: Record<string, unknown>) =>
        apiClient.get<PaginatedResponse<unknown>>('/instances', { params }),
    getById: (id: string) => apiClient.get<unknown>(`/instances/${id}`),
    update: (id: string, data: unknown) => apiClient.put<unknown>(`/instances/${id}`, data),
    cancel: (id: string) => apiClient.post<unknown>(`/instances/${id}/cancel`),
    reschedule: (id: string, data: unknown) =>
        apiClient.post<unknown>(`/instances/${id}/reschedule`, data),
};
