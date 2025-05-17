import express from 'express';
import { 
  registerSupervisor, 
  loginSupervisor, 
  getSupervisorProfile, 
  getLowStockMaterials,
  useMaterials
} from '../controllers/supervisorsController.js';
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

export default supervisorsRouter;
