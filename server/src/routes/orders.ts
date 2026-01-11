import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder
} from '../controllers/orderController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Routes authentifiées
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/', authenticate, createOrder);
router.post('/:id/cancel', authenticate, cancelOrder);

// Routes admin
router.put('/:id/status', authenticate, requireAdmin, updateOrderStatus);

export default router;
