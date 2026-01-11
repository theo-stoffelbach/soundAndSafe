import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUserRole,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress
} from '../controllers/userController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Routes admin
router.get('/', authenticate, requireAdmin, getUsers);
router.get('/:id', authenticate, requireAdmin, getUserById);
router.put('/:id/role', authenticate, requireAdmin, updateUserRole);

// Routes adresses (pour l'utilisateur connecté)
router.get('/me/addresses', authenticate, getAddresses);
router.post('/me/addresses', authenticate, createAddress);
router.put('/me/addresses/:id', authenticate, updateAddress);
router.delete('/me/addresses/:id', authenticate, deleteAddress);

export default router;
