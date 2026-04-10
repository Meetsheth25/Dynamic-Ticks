import express from 'express';
import { getAnalytics, getUsersWithStats, deleteUser, makeAdmin, removeAdmin, getReturnRequests } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/analytics').get(protect, admin, getAnalytics);
router.route('/users').get(protect, admin, getUsersWithStats);
router.route('/returns').get(protect, admin, getReturnRequests);
router.route('/users/:id').delete(protect, admin, deleteUser);
router.route('/users/:id/make-admin').put(protect, admin, makeAdmin);
router.route('/users/:id/remove-admin').put(protect, admin, removeAdmin);

export default router;

