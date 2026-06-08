import { Router } from 'express';
import * as ctrl from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, ctrl.getNotifications);
router.patch('/:id/read', authenticate, ctrl.markAsRead);
router.patch('/read-all', authenticate, ctrl.markAllAsRead);
router.delete('/:id', authenticate, ctrl.deleteNotification);
router.post('/preferences', authenticate, ctrl.updatePreferences);

export default router;
