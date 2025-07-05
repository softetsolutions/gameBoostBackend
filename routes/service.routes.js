import express from 'express';
import { createService, getAllServices,getServiceById,
  updateService,
  deleteService,toggleHomeVisibility } from '../controllers/service.controller.js';
import auth from '../middleware/auth.middleware.js'; 
import checkRole from '../middleware/role.middleware.js';
import upload from '../middleware/upload.js';
const router = express.Router();

// Admin creates a new service
router.post('/create', auth,upload.single('icon'), checkRole('admin'), createService);
router.post('/select', auth,checkRole('admin'), toggleHomeVisibility);
// Public fetch of all services
router.get('/', auth, getAllServices);

router.get('/:id', auth, getServiceById);
router.put('/:id', auth,checkRole('admin'),  updateService);
router.delete('/:id', auth,checkRole('admin'), deleteService);


export default router;
