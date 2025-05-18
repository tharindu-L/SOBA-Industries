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
    console.log("Received custom order request:", req.body);
    console.log("Files received:", req.files);
    
    const { customerName, description, itemType, quantity, specialNotes, wantDate } = req.body;
    
    // Validate required fields
    if (!customerName || !description || !itemType || !quantity) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }
    
    const requestId = `CUST-REQ-${uuidv4().substr(0, 8)}`;
    
    // Map from front-end item types to database enum values
    const itemTypeMap = {
        'Medals': 'medal',
        'Badges': 'batch',
        'Mugs': 'mug',
        'Other': 'souvenir'
    };
    
    const dbItemType = itemTypeMap[itemType] || 'souvenir';
    
    if (!ITEM_PRICES[dbItemType]) {
        return res.status(400).json({
            success: false,
            message: 'Invalid item type selected'
        });
    }

    const unitPrice = ITEM_PRICES[dbItemType];
    const totalAmount = unitPrice * parseInt(quantity);

    // Handle the design image
    let designImage = null;
    if (req.files && req.files.designImage && req.files.designImage[0]) {
        designImage = `/uploads/custom-orders/${req.files.designImage[0].filename}`;
    }

    // Format want date for SQL
    const formattedWantDate = wantDate ? new Date(wantDate).toISOString().split('T')[0] : null;

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Log the query we're about to execute
        console.log(`Inserting custom order request with values:`, {
            requestId, customerName, description, dbItemType,
            designImage, quantity, unitPrice, totalAmount,
            specialNotes, formattedWantDate
        });

        await connection.query(
            `INSERT INTO custom_order_requests (
                request_id, customer_name, description, item_type, 
                design_image, quantity, unit_price, total_amount,
                special_notes, want_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                requestId, customerName, description, dbItemType,
                designImage, quantity, unitPrice, totalAmount,
                specialNotes || null, formattedWantDate
            ]
        );

        // Handle additional design files if any
        const designFiles = [];
        if (req.files && req.files.designFiles) {
            for (const file of req.files.designFiles) {
                const filePath = `/uploads/custom-orders/${file.filename}`;
                await connection.query(
                    `INSERT INTO custom_order_designs (
                        request_id, file_name, file_path, file_type
                    ) VALUES (?, ?, ?, ?)`,
                    [requestId, file.filename, filePath, file.mimetype]
                );
                designFiles.push(filePath);
            }
        }

        await connection.commit();

        // Send successful response
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
                specialNotes,
                wantDate: formattedWantDate,
                designFiles,
                status: 'pending'
            }
        });
    } catch (error) {
        if (connection) await connection.rollback();
        
        // Clean up uploaded files if error occurred
        if (req.files) {
            if (req.files.designImage) {
                req.files.designImage.forEach(file => {
                    fs.unlink(file.path, err => {
                        if (err) console.error('Error deleting file:', err);
                    });
                });
            }
            if (req.files.designFiles) {
                req.files.designFiles.forEach(file => {
                    fs.unlink(file.path, err => {
                        if (err) console.error('Error deleting file:', err);
                    });
                });
            }
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
                DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
                DATE_FORMAT(want_date, '%Y-%m-%d') as wantDate,
                special_notes as specialNotes
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

// Get all custom orders from custom_order_requests table
export const getAllCustomOrders = async (req, res) => {
  try {
    // Add some debug logging
    console.log("Fetching all custom orders from custom_order_requests table");
    
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
        status,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
        DATE_FORMAT(want_date, '%Y-%m-%d') as wantDate,
        special_notes as specialNotes
      FROM custom_order_requests
      ORDER BY created_at DESC`
    );

    // Add debug logging to check what's coming back
    console.log(`Retrieved ${orders.length} custom order requests`);
    if (orders.length > 0) {
      console.log("Sample custom order data (first record):", 
        { 
          requestId: orders[0].requestId,
          customerName: orders[0].customerName,
          itemType: orders[0].itemType,
          createdAt: orders[0].createdAt,
          wantDate: orders[0].wantDate
        }
      );
    }

    res.status(200).json({
      success: true,
      orders: orders
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