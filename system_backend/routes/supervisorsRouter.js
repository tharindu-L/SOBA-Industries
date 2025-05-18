import express from 'express';
import { 
  registerSupervisor, 
  loginSupervisor, 
  getSupervisorProfile, 
  getLowStockMaterials,
  useMaterials,
  getLowStockProducts
} from '../controllers/supervisorsController.js';
import { getSupervisorMaterials } from '../controllers/machineController.js';
import authMiddleware from '../middleware/auth.js';

const supervisorsRouter = express.Router();

// Add logging middleware for debugging
supervisorsRouter.use((req, res, next) => {
  console.log(`Supervisor route accessed: ${req.method} ${req.path}`);
  next();
});

// Supervisor routes
supervisorsRouter.post('/register', registerSupervisor);
supervisorsRouter.post('/login', loginSupervisor);
supervisorsRouter.get('/profile', authMiddleware, getSupervisorProfile);

// Material management routes
supervisorsRouter.get('/low-stock-materials', authMiddleware, getLowStockMaterials);
supervisorsRouter.post('/use-materials', authMiddleware, useMaterials);
supervisorsRouter.get('/low-stock-products', authMiddleware, getLowStockProducts);

// Add the new route for fetching materials
supervisorsRouter.get('/materials', authMiddleware, getSupervisorMaterials);

export default supervisorsRouter;
