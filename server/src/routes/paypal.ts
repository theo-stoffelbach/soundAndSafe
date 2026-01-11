import { Router } from 'express';
import {
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalClientId
} from '../controllers/paypalController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/client-id', getPayPalClientId);
router.post('/create-order', authenticate, createPayPalOrder);
router.post('/capture-order', authenticate, capturePayPalOrder);

export default router;
