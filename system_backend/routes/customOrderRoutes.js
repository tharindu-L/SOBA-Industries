import {
    createCustomOrderRequest,
    getCustomOrderRequests,
    getAllCustomOrders
} from '../controllers/customOrderController.js';

import express from 'express';
import upload from '../middleware/uploadMiddleware.js';

const CustomRouter = express.Router();

CustomRouter.post('/', upload.single('designImage'), createCustomOrderRequest);
CustomRouter.get('/', getCustomOrderRequests);
CustomRouter.get('/all', getAllCustomOrders);

export default CustomRouter;