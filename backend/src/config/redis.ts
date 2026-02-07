import { createClient, RedisClientType } from 'redis';
import { config } from './environment';

let redisClient: RedisClientType | null = null;

export const connectRedis = async (): Promise<RedisClientType> => {
    try {
        const url = `redis://${config.redisHost}:${config.redisPort}`;

        redisClient = createClient({
            url,
            password: config.redisPassword || undefined,
            database: config.redisDb,
        });

        redisClient.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        redisClient.on('connect', () => {
            console.log('✅ Redis connected successfully');
        });

        redisClient.on('reconnecting', () => {
            console.log('Redis reconnecting...');
        });

        await redisClient.connect();

        return redisClient;
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        // Don't exit, continue without Redis in development
        return null as any;
    }
};

export const getRedisClient = (): RedisClientType => {
    if (!redisClient) {
        throw new Error('Redis client not initialized. Call connectRedis() first.');
    }
    return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
    if (redisClient) {
        await redisClient.quit();
        console.log('Redis disconnected');
    }
};
