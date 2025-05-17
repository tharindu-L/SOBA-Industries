import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

// Price configuration
const ITEM_PRICES = {
    medal: 15.00,
    batch: 10.00,
    mug: 8.00,
    souvenir: 20.00
};

// Create custom order request
export const createCustomOrderRequest = async (req, res) => {
    const { customerName, description, itemType, quantity } = req.body;
    const requestId = `CUST-REQ-${uuidv4().substr(0, 8)}`;
    
    if (!ITEM_PRICES[itemType]) {
        return res.status(400).json({
            success: false,
            message: 'Invalid item type selected'
        });
    }

    const unitPrice = ITEM_PRICES[itemType];
    const totalAmount = unitPrice * parseInt(quantity);

    let designImage = null;
    if (req.file) {
        designImage = `/uploads/custom-orders/${req.file.filename}`;
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        await connection.query(
            `INSERT INTO custom_order_requests (
                request_id, customer_name, description, item_type, 
                design_image, quantity, unit_price, total_amount
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                requestId, customerName, description, itemType,
                designImage, quantity, unitPrice, totalAmount
            ]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Custom order request submitted successfully',
            orderRequest: {
                requestId,
                customerName,
                description,
                itemType,
                designImage,
                quantity,
                unitPrice,
                totalAmount,
                status: 'pending'
            }
        });
    } catch (error) {
        if (connection) await connection.rollback();
        
        // Clean up uploaded file if error occurred
        if (req.file) {
            fs.unlink(path.join(__dirname, '../public/uploads/custom-orders', req.file.filename), err => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        
        console.error('Error creating custom order request:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating custom order request',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

// Get all custom order requests
export const getCustomOrderRequests = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        const [requests] = await connection.query(`
            SELECT 
                request_id as requestId,
                customer_name as customerName,
                description,
                item_type as itemType,
                design_image as designImage,
                quantity,
                CAST(unit_price AS DECIMAL(10,2)) as unitPrice,
                CAST(total_amount AS DECIMAL(10,2)) as totalAmount,
                status,
                DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt
            FROM custom_order_requests
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            message: 'Custom order requests fetched successfully',
            requests
        });
    } catch (error) {
        console.error('Error fetching custom order requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching custom order requests',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

// The function that retrieves all custom orders needs to include the want_date field in its query

export const getAllCustomOrders = async (req, res) => {
  try {
    // Add some debug logging
    console.log("Fetching all custom orders with want_date field");
    
    // This query already includes want_date
    const [orders] = await pool.query(
      `SELECT 
        co.order_id as orderId, 
        co.customer_id as customerId, 
        co.description, 
        co.quantity, 
        co.special_notes as specialNotes, 
        co.status, 
        co.created_at as createdAt,
        co.category,
        co.want_date as wantDate,
        GROUP_CONCAT(cod.file_name) as designFiles
      FROM custom_orders co
      LEFT JOIN custom_order_designs cod ON co.order_id = cod.order_id
      GROUP BY co.order_id
      ORDER BY co.created_at DESC`
    );

    // Add debug logging to check what's coming back
    console.log(`Retrieved ${orders.length} orders`);
    if (orders.length > 0) {
      console.log("Sample order data (first record):", 
        { 
          orderId: orders[0].orderId,
          wantDate: orders[0].wantDate,
          desc: orders[0].description.substring(0, 20) + '...'
        }
      );
    }

    // Process the results to format design files as arrays
    const formattedOrders = orders.map(order => ({
      ...order,
      designFiles: order.designFiles ? order.designFiles.split(',') : []
    }));

    res.status(200).json({
      success: true,
      orders: formattedOrders
    });
  } catch (err) {
    console.error("Error in getAllCustomOrders:", err);
    res.status(500).json({ success: false, message: "Error fetching custom orders" });
  }
};

export const createCustomOrder = async (req, res) => {
  try {
    // For FormData requests, wantDate will be in req.body
    console.log("Request body:", req.body); // Add this for debugging
    
    const { customerId, description, quantity, specialNotes, category, wantDate } = req.body;
    
    // Log the extracted wantDate to verify it's being received
    console.log("Received want date:", wantDate);
    
    // Validate required fields
    if (!customerId || !description) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID and description are required',
      });
    }
    
    // Explicitly prepare the wantDate for SQL insertion
    // Convert to proper SQL date format if needed or use null if missing
    const formattedWantDate = wantDate ? new Date(wantDate).toISOString().split('T')[0] : null;
    console.log("Formatted want date for SQL:", formattedWantDate);

    // Insert the order with the want_date
    const [orderResult] = await pool.query(
      `INSERT INTO custom_orders 
       (customer_id, description, quantity, special_notes, category, want_date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [customerId, description, quantity || 1, specialNotes || null, category || null, formattedWantDate]
    );
    
    // Process design files if any
    const designFiles = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const [fileResult] = await pool.query(
          'INSERT INTO custom_order_designs (order_id, file_name, file_type, file_path) VALUES (?, ?, ?, ?)',
          [orderResult.insertId, file.filename, file.mimetype, file.path]
        );
        designFiles.push(file.filename);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Custom order created successfully',
      order: {
        orderId: orderResult.insertId,
        customerId,
        description,
        quantity: quantity || 1,
        specialNotes: specialNotes || null,
        status: 'pending',
        category: category || null,
        wantDate: formattedWantDate, // Include this in the response
        designFiles
      }
    });
  } catch (err) {
    console.error('Error creating custom order:', err);
    res.status(500).json({
      success: false,
      message: 'Error creating custom order'
    });
  }
};