import { Router } from 'express';
import classRoutes from './classRoutes';
import roomTypeRoutes from './roomTypeRoutes';
import roomRoutes from './roomRoutes';
import instructorRoutes from './instructorRoutes';

const router = Router();

// Mount routes
router.use('/classes', classRoutes);
router.use('/room-types', roomTypeRoutes);
router.use('/rooms', roomRoutes);
router.use('/instructors', instructorRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        title: 'Health Check',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

export default router;
