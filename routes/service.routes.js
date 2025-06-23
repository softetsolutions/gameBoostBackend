import express from 'express';
import { createService, getAllServices,getServiceById,
  updateService,
  deleteService } from '../controllers/service.controller.js';
import auth from '../middleware/auth.middleware.js'; 

const router = express.Router();

// Admin creates a new service
router.post('/create', auth,  createService);

// Public fetch of all services
router.get('/', auth, getAllServices);

router.get('/:id', auth, getServiceById);
router.put('/:id', auth,  updateService);
router.delete('/:id', auth, deleteService);


export default router;
