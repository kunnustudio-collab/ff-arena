"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../common/middleware/auth.middleware");
const data_store_1 = require("../../database/data-store");
const router = (0, express_1.Router)();
// GET /api/v1/notifications
router.get('/', auth_middleware_1.authenticate, (req, res) => {
    const userId = req.user.id;
    const list = data_store_1.store.notifications
        .filter((n) => n.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json({ success: true, data: list });
});
// PUT /api/v1/notifications/:id/read
router.put('/:id/read', auth_middleware_1.authenticate, (req, res) => {
    const notif = data_store_1.store.notifications.find((n) => n.id === req.params.id && n.user_id === req.user.id);
    if (notif)
        notif.is_read = true;
    res.json({ success: true, message: 'Notification marked as read' });
});
// PUT /api/v1/notifications/read-all
router.put('/read-all', auth_middleware_1.authenticate, (req, res) => {
    data_store_1.store.notifications.forEach((n) => {
        if (n.user_id === req.user.id)
            n.is_read = true;
    });
    res.json({ success: true, message: 'All notifications marked as read' });
});
exports.notificationRouter = router;
