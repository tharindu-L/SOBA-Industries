import {createCustomOrder, getAllOrders, getCustomOrders, getOrderByCustomerId, getOrdersByCustomerId, processPayment, updateAmountPaid, updateNewOrderStatus, updateOrderStatus} from '../controllers/orderController.js';

import authMiddleware from '../middleware/auth.js';
import express from 'express';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.pdf' && ext !== '.doc' && ext !== '.docx') {
      return callback(new Error('Only images, PDFs, and DOC files are allowed'))
    }
    callback(null, true)
  }
});

const OrderRoutes = express.Router();

OrderRoutes.post('/process-payment', authMiddleware, processPayment);

// Get customer's order history
OrderRoutes.get('/order', authMiddleware, getOrdersByCustomerId);

// Get specific order details
OrderRoutes.get('/all_order',getAllOrders);

OrderRoutes.put('/all_order_update',updateNewOrderStatus);

// Modify the route handling to ensure body parsing works correctly
OrderRoutes.post('/custom-order', authMiddleware, upload.array('designFiles'), (req, res, next) => {
  console.log("Raw request body:", req.body);
  next();
}, createCustomOrder);

OrderRoutes.get('/all_custom_order',getCustomOrders);

OrderRoutes.get('/all_customer_order_Id',authMiddleware, getOrderByCustomerId);

OrderRoutes.put('/status',updateOrderStatus);

OrderRoutes.put('/update_am',updateAmountPaid);

export default OrderRoutes;