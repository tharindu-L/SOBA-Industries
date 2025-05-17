
import express from 'express';
import { registerCashier, loginCashier } from '../controllers/cashiersController.js';

const cashierRouter = express.Router();

cashierRouter.post('/register', registerCashier);
cashierRouter.post('/login', loginCashier);

export default cashierRouter;