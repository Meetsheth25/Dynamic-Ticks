import express from 'express';
import {
  loginEmployee,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  // Manager
  getManagerReturns,
  managerApproveReturn,
  managerRejectReturn,
  managerGetProducts,
  managerCreateProduct,
  managerUpdateProduct,
  managerDeleteProduct,
  // Staff
  staffGetOrders,
  staffUpdateOrder,
  getDeliveryPersons,
  // Delivery
  deliveryGetOrders,
  deliveryUpdateStatus,
} from '../controllers/employeeController.js';

import { protect, admin, employeeOrAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// ─── AUTH (PUBLIC) ────────────────────────────────────────────────────────────
// MUST be first — no auth required
router.post('/login', loginEmployee);

// ─── ADMIN LIST / CREATE ──────────────────────────────────────────────────────
// GET /api/employees      → list all
// POST /api/employees     → create new employee
router.get('/', protect, admin, getEmployees);
router.post('/', protect, admin, createEmployee);

// ─── MANAGER ROUTES ───────────────────────────────────────────────────────────
// All /manager/* routes MUST come before /:id to avoid param collision
router.get('/manager/returns', protect, employeeOrAdmin('manager'), getManagerReturns);
router.put('/manager/returns/:id/approve', protect, employeeOrAdmin('manager'), managerApproveReturn);
router.put('/manager/returns/:id/reject', protect, employeeOrAdmin('manager'), managerRejectReturn);

router.get('/manager/products', protect, employeeOrAdmin('manager'), managerGetProducts);
router.post('/manager/products', protect, employeeOrAdmin('manager'), upload.array('images', 5), managerCreateProduct);
router.put('/manager/products/:id', protect, employeeOrAdmin('manager'), upload.array('images', 5), managerUpdateProduct);
router.delete('/manager/products/:id', protect, employeeOrAdmin('manager'), managerDeleteProduct);

// ─── STAFF ROUTES ─────────────────────────────────────────────────────────────
// All /staff/* routes MUST come before /:id
router.get('/staff/orders', protect, employeeOrAdmin('staff'), staffGetOrders);
router.put('/staff/orders/:id', protect, employeeOrAdmin('staff'), staffUpdateOrder);
router.get('/staff/delivery-persons', protect, employeeOrAdmin('staff'), getDeliveryPersons);

// ─── DELIVERY ROUTES ──────────────────────────────────────────────────────────
// All /delivery/* routes MUST come before /:id
router.get('/delivery/orders', protect, employeeOrAdmin('delivery'), deliveryGetOrders);
router.put('/delivery/orders/:id', protect, employeeOrAdmin('delivery'), deliveryUpdateStatus);

// ─── ADMIN EMPLOYEE EDIT / DELETE ─────────────────────────────────────────────
// /:id MUST come LAST — it is a wildcard that would swallow /manager, /staff, /delivery
router.put('/:id', protect, admin, updateEmployee);
router.delete('/:id', protect, admin, deleteEmployee);

export default router;
