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