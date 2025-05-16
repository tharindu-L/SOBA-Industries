import {
    createCustomOrderRequest,
    getCustomOrderRequests
} from '../controllers/customOrderController.js';

import express from 'express';
import upload from '../middleware/uploadMiddleware.js';

const CustomRouter = express.Router();

CustomRouter.post('/', upload.single('designImage'), createCustomOrderRequest);
CustomRouter.get('/', getCustomOrderRequests);

export default CustomRouter;