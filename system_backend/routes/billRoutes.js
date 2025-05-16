// billRoutes.js

import { createManualOrder, getAllOrders, getProducts } from '../controllers/billController.js';

import express from 'express';

const BillRouter = express.Router();

BillRouter.get('/products', getProducts);
BillRouter.post('/create-order', createManualOrder);
BillRouter.get('/orders', getAllOrders);
export default BillRouter;