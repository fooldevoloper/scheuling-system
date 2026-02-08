import { getRedisClient } from '../config/redis';
import { config } from '../config/environment';

// ============================================
// Cache Service
// ============================================

export class CacheService {
    private client: any;
    private ttl: number;

    constructor() {
        this.client = null;
        this.ttl = config.cacheTtl;
    }

    /**
     * Initialize the cache service
     */
    async initialize(): Promise<void> {
        try {
            this.client = getRedisClient();
        } catch (error) {
            console.warn('Redis not available, caching disabled');
            this.client = null;
        }
    }

    /**
     * Check if Redis is available
     */
    isAvailable(): boolean {
        return this.client !== null;
    }

    /**
     * Get a value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        if (!this.isAvailable()) return null;

        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    /**
     * Set a value in cache
     */
    async set(key: string, data: any, ttl?: number): Promise<void> {
        if (!this.isAvailable()) return;

        try {
            const expiry = ttl || this.ttl;
            await this.client.setEx(key, expiry, JSON.stringify(data));
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    /**
     * Delete a value from cache
     */
    async delete(key: string): Promise<void> {
        if (!this.isAvailable()) return;

        try {
            await this.client.del(key);
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    }

    /**
     * Delete multiple keys matching a pattern
     */
    async deleteByPattern(pattern: string): Promise<void> {
        if (!this.isAvailable()) return;

        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                console.log(`Cache: Deleting ${keys.length} keys matching pattern "${pattern}"`);
                await this.client.del(...keys);
            } else {
                console.log(`Cache: No keys found matching pattern "${pattern}"`);
            }
        } catch (error) {
            console.error('Cache deleteByPattern error:', error);
        }
    }

    /**
     * Get or set cache (read-through)
     */
    async getOrSet<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttl?: number
    ): Promise<T> {
        const cached = await this.get<T>(key);
        if (cached !== null) return cached;

        const data = await fetcher();
        await this.set(key, data, ttl);
        return data;
    }

    /**
     * Invalidate all class-related cache
     */
    async invalidateClasses(): Promise<void> {
        await this.deleteByPattern('schedule:classes:*');
        await this.deleteByPattern('schedule:calendar:*');
    }

    /**
     * Invalidate all calendar cache
     */
    async invalidateCalendar(): Promise<void> {
        await this.deleteByPattern('schedule:calendar:*');
    }

    /**
     * Invalidate specific class cache
     */
    async invalidateClass(classId: string): Promise<void> {
        await this.delete(`schedule:class:${classId}`);
        await this.invalidateClasses();
    }

    /**
     * Invalidate instructor-related cache
     */
    async invalidateInstructor(instructorId: string): Promise<void> {
        await this.delete(`schedule:instructor:${instructorId}`);
        await this.invalidateClasses();
    }

    /**
     * Invalidate room-related cache
     */
    async invalidateRoom(roomId: string): Promise<void> {
        await this.delete(`schedule:room:${roomId}`);
        await this.invalidateClasses();
    }

    /**
     * Invalidate room type-related cache
     */
    async invalidateRoomType(roomTypeId: string): Promise<void> {
        await this.delete(`schedule:roomtype:${roomTypeId}`);
        await this.invalidateClasses();
    }

    /**
     * Generate cache key for classes list
     */
    generateClassesCacheKey(
        page: number,
        limit: number,
        filters?: Record<string, any>
    ): string {
        const filterStr = filters ? JSON.stringify(filters) : 'all';
        return `schedule:classes:${page}:${limit}:${filterStr}`;
    }

    /**
     * Generate cache key for calendar data
     */
    generateCalendarCacheKey(startDate: string, endDate: string): string {
        return `schedule:calendar:${startDate}:${endDate}`;
    }

    /**
     * Generate cache key for single class
     */
    generateClassCacheKey(classId: string): string {
        return `schedule:class:${classId}`;
    }

    /**
     * Generate cache key for room type list
     */
    generateRoomTypesCacheKey(): string {
        return 'schedule:roomtypes:all';
    }

    /**
     * Generate cache key for instructor list
     */
    generateInstructorsCacheKey(): string {
        return 'schedule:instructors:all';
    }
}

// Export singleton instance
export const cacheService = new CacheService();
