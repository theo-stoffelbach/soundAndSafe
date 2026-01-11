import { Router } from 'express';
import {
  getDashboardStats,
  getSalesStats,
  getTopProducts,
  getOrdersByStatus,
  getRecentOrders
} from '../controllers/statsController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Toutes les routes sont réservées aux admins
router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/sales', getSalesStats);
router.get('/top-products', getTopProducts);
router.get('/orders-by-status', getOrdersByStatus);
router.get('/recent-orders', getRecentOrders);

export default router;
