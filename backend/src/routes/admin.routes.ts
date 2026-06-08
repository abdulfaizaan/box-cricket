import { Router } from 'express';
import { verifyAdmin } from '../middleware/auth.middleware.js';
import { getBookings, updateBookingStatus } from '../controllers/admin.controller.js';

const router = Router();

// Apply middleware to all routes in this file
router.use(verifyAdmin);

router.get('/bookings', getBookings);
router.patch('/bookings/:id/status', updateBookingStatus);

export default router;
