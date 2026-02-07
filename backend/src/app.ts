import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { cacheService } from './services';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware';
const app = express();
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
}
app.use('/api', routes);
app.get('/', (req: Request, res: Response) => {
    res.json({
        title: 'Plex-Bit API',
        message: 'Calendar-Based Class Scheduling System',
        version: '1.0.0',
        documentation: '/api/docs'
    });
});
app.get('/health', (req: Request, res: Response) => {
    res.json({
        title: 'Health Check',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv
    });
});
app.use(notFoundHandler);
app.use(errorHandler);
const startServer = async (): Promise<void> => {
    try {
        await connectDatabase();
        console.log('✅ MongoDB connected');
        await connectRedis();
        await cacheService.initialize();
        console.log('✅ Redis initialized');

        const server = app.listen(config.port, () => {
            console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🗓️  Plex-Bit Server Running                             ║
║                                                           ║
║   Local:    http://localhost:${config.port}                    ║
║   API:      http://localhost:${config.port}/api               ║
║   Health:   http://localhost:${config.port}/health            ║
║                                                           ║
║   Environment: ${config.nodeEnv.padEnd(35)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
        });
        const gracefulShutdown = async (signal: string) => {
            console.log(`\n${signal} received. Shutting down gracefully...`);
            server.close(async () => {
                console.log('HTTP server closed');
                const { disconnectDatabase } = await import('./config/database');
                await disconnectDatabase();
                const { disconnectRedis } = await import('./config/redis');
                await disconnectRedis();
                console.log('All connections closed');
                process.exit(0);
            });
            setTimeout(() => {
                console.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
export default app;
