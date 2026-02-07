import { Router } from 'express';
import classRoutes from './classRoutes';

const router = Router();

// Mount routes
router.use('/classes', classRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        title: 'Health Check',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

export default router;
