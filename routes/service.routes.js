import express from 'express';
import auth from '../middleware/auth.middleware.js';
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService
} from '../controllers/service.controller.js';

const router = express.Router();

router.post('/',auth, createService);
router.get('/',auth, getAllServices);
router.get('/:id', getServiceById);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
