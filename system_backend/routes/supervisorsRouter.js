
import express from 'express';
import { registerSupervisor, loginSupervisor } from '../controllers/supervisorsController.js';
import authMiddleware from '../middleware/auth.js';

const supervisorsRouter = express.Router();

// Supervisor routes
supervisorsRouter.post('/register', registerSupervisor);
supervisorsRouter.post('/login', loginSupervisor);

export default supervisorsRouter;
