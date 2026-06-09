import { Router } from 'express';
import { verifyAdmin } from '../middleware/auth.middleware.js';
import { 
  getBookings, 
  updateBookingStatus, 
  getSettings, 
  updateSettings, 
  createOfflineBooking 
} from '../controllers/admin.controller.js';

const router = Router();

// Apply middleware to all routes in this file
router.use(verifyAdmin);

router.get('/bookings', getBookings);
router.patch('/bookings/:id/status', updateBookingStatus);
router.post('/bookings/offline', createOfflineBooking as any);

router.get('/settings', getSettings as any);
router.put('/settings', updateSettings as any);

export default router;
