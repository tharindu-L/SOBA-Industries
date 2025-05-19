import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

// Price configuration
const ITEM_PRICES = {
    medal: 450.00,
    batch: 50.00,
    mug: 500.00,
    souvenir: 700.00
};

// Function to get the next sequential custom order ID
const getNextCustomOrderId = async (connection) => {
    try {
        // Get the highest current ID number
        const [result] = await connection.query(`
            SELECT request_id FROM custom_order_requests 
            WHERE request_id LIKE 'CC%' 
            ORDER BY CAST(SUBSTRING(request_id, 3) AS UNSIGNED) DESC 
            LIMIT 1
        `);
        
        let nextNumber = 1;
        if (result.length > 0) {
            // Extract the number part and increment
            const currentId = result[0].request_id;
            const currentNumber = parseInt(currentId.substring(2), 10);
            nextNumber = currentNumber + 1;
        }
        
        // Format with leading zeros (e.g., CC001)
        return `CC${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
        console.error('Error generating next custom order ID:', error);
        // Fallback to the old format if there's an error
        return `CUST-REQ-${uuidv4().substr(0, 8)}`;
    }
};

// Create custom order request
export const createCustomOrderRequest = async (req, res) => {
    console.log("Received custom order request:", req.body);
    console.log("Files received:", req.files);
    
    const { 
        customerName, 
        description, 
        itemType, 
        quantity, 
        specialNotes, 
        wantDate,
        // Add payment information - change variable name to match field
        paymentMethod, // We'll still use this variable name in our code
        totalAmount: reqTotalAmount,
        amountPaid: reqAmountPaid,
        // Add service charge
        serviceCharge
    } = req.body;
    
    // Validate required fields
    if (!customerName || !description || !itemType || !quantity) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }
    
    let connection;
    let requestId;
    
    try {
        connection = await pool.getConnection();
        // Get sequential ID instead of UUID
        requestId = await getNextCustomOrderId(connection);
        
        // Map from front-end item types to database enum values
        const itemTypeMap = {
            'Medals': 'medal',
            'Badges': 'batch',
            'Mugs': 'mug',
            'Souvenirs': 'souvenir'  // Changed from 'Other' to 'Souvenirs'
        };
        
        const dbItemType = itemTypeMap[itemType] || 'souvenir';
        
        if (!ITEM_PRICES[dbItemType]) {
            return res.status(400).json({
                success: false,
                message: 'Invalid item type selected'
            });
        }

        const unitPrice = ITEM_PRICES[dbItemType];
        const baseAmount = unitPrice * parseInt(quantity);
        // Add service charge to calculation
        const serviceChargeAmount = parseFloat(serviceCharge) || 0;
        const calculatedTotalAmount = baseAmount + serviceChargeAmount;
        
        // Use the provided total amount or calculate it
        const totalAmount = reqTotalAmount ? parseFloat(reqTotalAmount) : calculatedTotalAmount;
        
        // Determine payment status and amount paid
        const paymentStatus = paymentMethod === 'advance' ? 'partially_paid' : 'paid';
        const amountPaid = reqAmountPaid ? parseFloat(reqAmountPaid) : 
                          (paymentMethod === 'advance' ? totalAmount * 0.3 : totalAmount);

        // Handle the design image
        let designImage = null;
        if (req.files && req.files.designImage && req.files.designImage[0]) {
            designImage = `/uploads/custom-orders/${req.files.designImage[0].filename}`;
        }

        // Format want date for SQL
        const formattedWantDate = wantDate ? new Date(wantDate).toISOString().split('T')[0] : null;

        await connection.beginTransaction();

        // Log the query we're about to execute
        console.log(`Inserting custom order request with values:`, {
            requestId, customerName, description, dbItemType,
            designImage, quantity, unitPrice, totalAmount,
            specialNotes, formattedWantDate,
            paymentMethod, paymentStatus, amountPaid,
            serviceCharge: serviceChargeAmount
        });

        // Update the column names to match the database schema and add service_charge
        await connection.query(
            `INSERT INTO custom_order_requests (
                request_id, customer_name, description, item_type, 
                design_image, quantity, unit_price, total_amount,
                special_notes, want_date, payment_option, payment_status, amount_paid,
                service_charge
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                requestId, customerName, description, dbItemType,
                designImage, quantity, unitPrice, totalAmount,
                specialNotes || null, formattedWantDate,
                paymentMethod || 'full', paymentStatus, amountPaid,
                serviceChargeAmount
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
                serviceCharge: serviceChargeAmount,
                totalAmount,
                specialNotes,
                wantDate: formattedWantDate,
                designFiles,
                status: 'pending',
                paymentOption: paymentMethod || 'full', // Update variable name here too
                paymentStatus,
                amountPaid
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

// Get all custom order requests with payment information
export const getCustomOrderRequests = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        // Update SQL query to include service_charge
        const [requests] = await connection.query(`
            SELECT 
                request_id as requestId,
                customer_name as customerName,
                description,
                item_type as itemType,
                design_image as designImage,
                quantity,
                CAST(unit_price AS DECIMAL(10,2)) as unitPrice,
                CAST(service_charge AS DECIMAL(10,2)) as serviceCharge,
                CAST(total_amount AS DECIMAL(10,2)) as totalAmount,
                status,
                DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
                DATE_FORMAT(want_date, '%Y-%m-%d') as wantDate,
                special_notes as specialNotes,
                payment_option as paymentMethod,
                payment_status as paymentStatus,
                CAST(amount_paid AS DECIMAL(10,2)) as amountPaid
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

// Get all custom orders from custom_order_requests table with payment information
export const getAllCustomOrders = async (req, res) => {
  try {
    // Add some debug logging
    console.log("Fetching all custom orders from custom_order_requests table");
    
    // Update the SQL query to include service_charge
    const [orders] = await pool.query(
      `SELECT 
        request_id as requestId, 
        customer_name as customerName,
        description,
        item_type as itemType,
        design_image as designImage,
        quantity,
        CAST(unit_price AS DECIMAL(10,2)) as unitPrice,
        CAST(service_charge AS DECIMAL(10,2)) as serviceCharge,
        CAST(total_amount AS DECIMAL(10,2)) as totalAmount,
        status,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
        DATE_FORMAT(want_date, '%Y-%m-%d') as wantDate,
        special_notes as specialNotes,
        payment_method as paymentMethod,
        payment_status as paymentStatus,
        CAST(amount_paid AS DECIMAL(10,2)) as amountPaid,
        CAST(total_amount AS DECIMAL(10,2)) - CAST(amount_paid AS DECIMAL(10,2)) as remainingAmount
      FROM custom_order_requests
      ORDER BY created_at DESC`
    );

    // Process orders to ensure payment status is correct
    const processedOrders = orders.map(order => {
      // Double-check payment status based on actual values
      const totalAmount = parseFloat(order.totalAmount || 0);
      const amountPaid = parseFloat(order.amountPaid || 0);
      
      // Override payment status if needed
      if (amountPaid <= 0) {
        order.paymentStatus = 'unpaid';
      } else if (amountPaid < totalAmount) {
        order.paymentStatus = 'partial';
      } else if (amountPaid >= totalAmount) {
        order.paymentStatus = 'paid';
      }
      
      // Add a user-friendly payment status label
      order.paymentStatusLabel = order.paymentStatus === 'partial' ? 
        'Partially Paid' : 
        (order.paymentStatus === 'paid' ? 'Fully Paid' : 'Unpaid');
        
      return order;
    });

    // Add debug logging to check what's coming back
    console.log(`Retrieved ${orders.length} custom order requests`);
    if (orders.length > 0) {
      console.log("Sample custom order data (first record):", 
        { 
          requestId: orders[0].requestId,
          customerName: orders[0].customerName,
          paymentMethod: orders[0].paymentMethod,
          paymentStatus: orders[0].paymentStatus,
          amountPaid: orders[0].amountPaid,
          totalAmount: orders[0].totalAmount
        }
      );
    }

    res.status(200).json({
      success: true,
      orders: processedOrders
    });
  } catch (err) {
    console.error("Error in getAllCustomOrders:", err);
    res.status(500).json({ success: false, message: "Error fetching custom orders" });
  }
};

// Add endpoint to update the payment for an order
export const updateOrderPayment = async (req, res) => {
  const { orderId, paymentAmount } = req.body;
  
  if (!orderId || !paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment information'
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get current order information
    const [orderResult] = await connection.query(
      'SELECT * FROM custom_order_requests WHERE request_id = ?',
      [orderId]
    );

    if (orderResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orderResult[0];
    const currentAmountPaid = parseFloat(order.amount_paid || 0);
    const totalAmount = parseFloat(order.total_amount);
    const newAmountPaid = currentAmountPaid + parseFloat(paymentAmount);

    // Validate that we're not overpaying
    if (newAmountPaid > totalAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount would exceed the total. Maximum additional payment: ${(totalAmount - currentAmountPaid).toFixed(2)}`
      });
    }

    // Update order with new payment amount and status
    const newStatus = newAmountPaid >= totalAmount ? 'paid' : 'partially_paid';
    
    await connection.query(
      `UPDATE custom_order_requests 
       SET amount_paid = ?, payment_status = ? 
       WHERE request_id = ?`,
      [newAmountPaid, newStatus, orderId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Payment updated successfully',
      order: {
        orderId,
        totalAmount,
        previouslyPaid: currentAmountPaid,
        newPayment: parseFloat(paymentAmount),
        totalPaid: newAmountPaid,
        newStatus
      }
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error updating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
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