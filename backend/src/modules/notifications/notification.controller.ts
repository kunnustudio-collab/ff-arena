import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { store } from '../../database/data-store';

const router = Router();

// GET /api/v1/notifications
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const list = store.notifications
    .filter((n) => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json({ success: true, data: list });
});

// PUT /api/v1/notifications/:id/read
router.put('/:id/read', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const notif = store.notifications.find((n) => n.id === req.params.id && n.user_id === req.user!.id);
  if (notif) notif.is_read = true;
  res.json({ success: true, message: 'Notification marked as read' });
});

// PUT /api/v1/notifications/read-all
router.put('/read-all', authenticate, (req: AuthenticatedRequest, res: Response) => {
  store.notifications.forEach((n) => {
    if (n.user_id === req.user!.id) n.is_read = true;
  });
  res.json({ success: true, message: 'All notifications marked as read' });
});

export const notificationRouter = router;
