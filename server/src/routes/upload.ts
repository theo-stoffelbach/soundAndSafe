import { Router } from 'express';
import { upload, uploadImage, uploadImages, deleteImage } from '../controllers/uploadController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Upload une seule image (admin seulement)
router.post('/image', authenticate, requireAdmin, upload.single('image'), uploadImage);

// Upload plusieurs images (admin seulement)
router.post('/images', authenticate, requireAdmin, upload.array('images', 10), uploadImages);

// Supprimer une image (admin seulement)
router.delete('/:filename', authenticate, requireAdmin, deleteImage);

export default router;
