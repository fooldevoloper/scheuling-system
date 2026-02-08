import { Router, Request, Response } from 'express';
import { classesRoutes } from './modules/classes';
import { instructorsRoutes } from './modules/instructors';
import { roomsRoutes } from './modules/rooms';
import { roomTypesRoutes } from './modules/roomTypes';

const router = Router();

// ============================================
// Mount Module Routes
// ============================================

router.use('/classes', classesRoutes);
router.use('/instructors', instructorsRoutes);
router.use('/rooms', roomsRoutes);
router.use('/room-types', roomTypesRoutes);

// ============================================
// Health Check Endpoint
// ============================================

router.get('/health', (req: Request, res: Response) => {
    res.json({
        title: 'Health Check',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

export default router;
