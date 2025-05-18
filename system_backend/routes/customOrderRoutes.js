import {
    createCustomOrderRequest,
    getCustomOrderRequests,
    getAllCustomOrders,
    updateOrderPayment
} from '../controllers/customOrderController.js';

import express from 'express';
import upload from '../middleware/uploadMiddleware.js';

const CustomRouter = express.Router();

// Update this route to handle multiple files (designFiles) in addition to a single file (designImage)
// The fields should match exactly what's being sent from the front-end
CustomRouter.post('/', upload.fields([
    { name: 'designImage', maxCount: 1 },
    { name: 'designFiles', maxCount: 10 }
]), createCustomOrderRequest);

// Add a test endpoint
CustomRouter.post('/test', (req, res) => {
  console.log('Test endpoint called');
  console.log('Body:', req.body);
  res.json({ success: true, message: 'Test successful' });
});

CustomRouter.get('/', getCustomOrderRequests);
CustomRouter.get('/all', getAllCustomOrders);

// Add endpoint for updating payments
CustomRouter.post('/update-payment', updateOrderPayment);

export default CustomRouter;