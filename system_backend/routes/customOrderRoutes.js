import express from 'express';
import pool from '../config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CustomRouter = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Enhanced migration function to add all necessary columns
const migrateDatabase = async () => {
  try {
    console.log('Running migrations for custom_order_requests table...');
    
    // Check which columns need to be added
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'custom_order_requests'
    `);
    
    // Get list of existing column names
    const existingColumns = columns.map(col => col.COLUMN_NAME.toLowerCase());
    console.log('Existing columns:', existingColumns);
    
    // Check for service_charge column
    if (!existingColumns.includes('service_charge')) {
      console.log('Adding service_charge column...');
      await pool.query(`
        ALTER TABLE custom_order_requests
        ADD COLUMN service_charge DECIMAL(10,2) DEFAULT 0 NOT NULL
        AFTER total_amount
      `);
      console.log('Added service_charge column');
    }
    
    // Check for payment_method column
    if (!existingColumns.includes('payment_method')) {
      console.log('Adding payment_method column...');
      await pool.query(`
        ALTER TABLE custom_order_requests
        ADD COLUMN payment_method VARCHAR(50) DEFAULT 'Full' NOT NULL
      `);
      console.log('Added payment_method column');
    }
    
    // Check for amount_paid column
    if (!existingColumns.includes('amount_paid')) {
      console.log('Adding amount_paid column...');
      await pool.query(`
        ALTER TABLE custom_order_requests
        ADD COLUMN amount_paid DECIMAL(10,2) DEFAULT 0 NOT NULL
      `);
      console.log('Added amount_paid column');
    }
    
    // Check for payment_status column
    if (!existingColumns.includes('payment_status')) {
      console.log('Adding payment_status column...');
      await pool.query(`
        ALTER TABLE custom_order_requests
        ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending' NOT NULL
      `);
      console.log('Added payment_status column');
    }
    
    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Database migration failed:', error);
  }
};

// Run migration when module is imported
migrateDatabase();

// Handle custom order creation with file upload
CustomRouter.post('/', upload.single('designImage'), async (req, res) => {
  try {
    console.log('Creating new custom order request');
    const {
      customerName,
      description,
      itemType,
      quantity,
      specialNotes,
      wantDate,
      paymentMethod,
      totalAmount,
      amountPaid,
      serviceCharge
    } = req.body;

    // Handle file upload
    let designImagePath = null;
    if (req.file) {
      designImagePath = `/uploads/${req.file.filename}`;
    }

    // Generate a unique request ID
    const requestId = `REQ-${Math.floor(100000 + Math.random() * 900000)}`;

    // Get all columns in the table to determine what fields we can insert
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'custom_order_requests'
    `);
    
    const columnNames = columns.map(col => col.COLUMN_NAME.toLowerCase());
    console.log('Available columns for insert:', columnNames);
    
    // Build dynamic query based on available columns
    let fields = [
      'request_id', 
      'customer_name', 
      'description', 
      'item_type', 
      'design_image', 
      'quantity', 
      'unit_price', 
      'total_amount',
      'status', 
      'want_date', 
      'special_notes'
    ];
    
    let values = [
      requestId,
      customerName,
      description,
      itemType,
      designImagePath,
      quantity,
      (totalAmount - (serviceCharge || 0)) / quantity, // Unit price calculation
      totalAmount,
      'pending',
      wantDate,
      specialNotes || ''
    ];
    
    // Add optional fields if they exist in the database
    if (columnNames.includes('service_charge')) {
      fields.push('service_charge');
      values.push(serviceCharge || 0);
    }
    
    // Fix the payment method storage
    if (columnNames.includes('payment_method')) {
      fields.push('payment_method');
      values.push(paymentMethod || 'full');
    }
    
    if (columnNames.includes('amount_paid')) {
      fields.push('amount_paid');
      values.push(amountPaid || 0);
    }
    
    // Fix the payment status logic - set to "partial" for advance payments
    if (columnNames.includes('payment_status')) {
      fields.push('payment_status');
      // Use correct payment status based on payment method
      const parsedTotalAmount = parseFloat(totalAmount);
      const parsedAmountPaid = parseFloat(amountPaid || 0);
      // Set as 'partial' if using advance payment or the amount paid is less than total
      const isPaid = parsedAmountPaid >= parsedTotalAmount;
      values.push(paymentMethod === 'advance' || !isPaid ? 'partial' : 'paid');
    }
    
    // Build the SQL query with placeholders
    const placeholders = values.map(() => '?').join(', ');
    const query = `
      INSERT INTO custom_order_requests (${fields.join(', ')})
      VALUES (${placeholders})
    `;
    
    console.log('Executing query with fields:', fields);
    console.log('Payment method:', paymentMethod);
    console.log('Payment status:', paymentMethod === 'advance' ? 'partial' : 'paid');
    
    // Execute the dynamic query
    const [result] = await pool.query(query, values);

    console.log(`Custom order created with ID: ${requestId}`);

    // Include payment status in response
    const paymentStatus = paymentMethod === 'advance' ? 'partial' : 'paid';
    
    res.json({
      success: true,
      message: 'Custom order request created successfully',
      orderRequest: {
        requestId,
        customerName,
        totalAmount,
        amountPaid: amountPaid || 0,
        paymentMethod,
        paymentStatus // Include payment status in response
      }
    });
  } catch (error) {
    console.error('Error creating custom order request:', error);
    res.status(500).json({
      success: false,
      message: `Error creating custom order request: ${error.message}`
    });
  }
});

// Define the missing functions
// Get all custom order requests
const getCustomOrderRequests = async (req, res) => {
  try {
    console.log('Fetching custom order requests');
    const [orders] = await pool.query(
      `SELECT 
        request_id as requestId, 
        customer_name as customerName,
        description,
        item_type as itemType,
        design_image as designImage,
        quantity,
        CAST(unit_price AS DECIMAL(10,2)) as unitPrice,
        CAST(total_amount AS DECIMAL(10,2)) as totalAmount,
        CAST(service_charge AS DECIMAL(10,2)) as serviceCharge,
        status,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
        DATE_FORMAT(want_date, '%Y-%m-%d') as wantDate,
        special_notes as specialNotes,
        payment_method as paymentMethod,
        amount_paid as amountPaid
      FROM custom_order_requests
      ORDER BY created_at DESC`
    );
    
    console.log(`Found ${orders.length} custom order requests`);
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching custom order requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching custom order requests' 
    });
  }
};

// Get all custom orders - alias of getCustomOrderRequests for backward compatibility
const getAllCustomOrders = async (req, res) => {
  return getCustomOrderRequests(req, res);
};

// Update order payment status
const updateOrderPayment = async (req, res) => {
  try {
    const { requestId, paymentAmount, paymentStatus } = req.body;
    
    if (!requestId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request ID is required' 
      });
    }
    
    // Get current order to calculate remaining amount
    const [orders] = await pool.query(
      'SELECT total_amount, amount_paid FROM custom_order_requests WHERE request_id = ?',
      [requestId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const order = orders[0];
    const newAmountPaid = parseFloat(order.amount_paid || 0) + parseFloat(paymentAmount || 0);
    
    // Determine if fully paid
    const isPaid = newAmountPaid >= parseFloat(order.total_amount);
    const newStatus = isPaid ? 'paid' : paymentStatus || 'partial';
    
    // Update the order
    await pool.query(
      'UPDATE custom_order_requests SET amount_paid = ?, payment_status = ? WHERE request_id = ?',
      [newAmountPaid, newStatus, requestId]
    );
    
    res.json({
      success: true,
      message: 'Payment updated successfully',
      isPaid,
      newAmountPaid,
      totalAmount: order.total_amount
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment',
      error: error.message
    });
  }
};

// Register the routes
CustomRouter.get('/', getCustomOrderRequests);
CustomRouter.get('/all', getAllCustomOrders);
CustomRouter.post('/update-payment', updateOrderPayment);

export default CustomRouter;