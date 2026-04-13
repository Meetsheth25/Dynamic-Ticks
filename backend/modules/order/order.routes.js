import express from 'express';
import { addOrderItems, getOrderById, getOrders, getMyOrders, updateOrderStatus, cancelOrder, returnOrder, approveReturn, rejectReturn, updateOrderAddress, updateEstimatedDelivery } from './order.controller.js';
import { protect, admin, employeeOrAdmin } from '../../middleware/authMiddleware.js';
import upload from '../../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

router.route('/my')
  .get(protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/status')
  .put(protect, admin, updateOrderStatus);

router.route('/:id/cancel')
  .put(protect, admin, cancelOrder);

router.route('/:id/return')
  .post(protect, upload.single('image'), returnOrder);

router.route('/:id/return/approve')
  .put(protect, admin, approveReturn);

router.route('/:id/return/reject')
  .put(protect, admin, rejectReturn);

router.route('/:id/address')
  .put(protect, updateOrderAddress);

router.route('/:id/estimated-delivery')
  .put(protect, employeeOrAdmin('manager', 'staff', 'delivery'), updateEstimatedDelivery);


export default router;
