import { Router } from 'express';
import { verifyAdmin } from '../middleware/auth.middleware.js';
import { getBookings, updateBookingStatus, getSettings, updateSettings, createOfflineBooking } from '../controllers/admin.controller.js';
const router = Router();
// Apply middleware to all routes in this file
router.use(verifyAdmin);
router.get('/bookings', getBookings);
router.patch('/bookings/:id/status', updateBookingStatus);
router.post('/bookings/offline', createOfflineBooking);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
export default router;
//# sourceMappingURL=admin.routes.js.map