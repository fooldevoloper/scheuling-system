import dotenv from 'dotenv';

dotenv.config();

export const config = {
    // Server
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    // MongoDB
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/plex-bit',
    dbName: process.env.MONGODB_DB_NAME || 'plex-bit',

    // Redis
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
    redisPassword: process.env.REDIS_PASSWORD || '',
    redisDb: parseInt(process.env.REDIS_DB || '0', 10),

    // Cache TTL
    cacheTtl: parseInt(process.env.CACHE_TTL || '3600', 10),

    // JWT
    jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
