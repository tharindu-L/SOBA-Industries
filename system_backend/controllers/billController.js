// billController.js

import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

// Get all products
export const getProducts = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products');
        res.json({
            success: true,
            message: 'Products fetched successfully',
            products: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching products' });
    }
};

// Create manual order
export const createManualOrder = async (req, res) => {
    const { customerName, paymentMethod, items } = req.body;
    const orderId = `ORD-${uuidv4().substr(0, 8)}`;
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let connection;
    try {
        // Get a connection from the pool
        connection = await pool.getConnection();
        
        // Start transaction
        await connection.beginTransaction();

        // 1. Create the order
        await connection.query(
            'INSERT INTO manual_orders (order_id, customer_name, total_amount, payment_method, items) VALUES (?, ?, ?, ?, ?)',
            [orderId, customerName, totalAmount, paymentMethod, JSON.stringify(items)]
        );

        // 2. Update product stocks
        for (const item of items) {
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE product_id = ?',
                [item.quantity, item.productId]
            );
        }

        // Commit transaction
        await connection.commit();

        res.json({
            success: true,
            message: 'Order created successfully',
            orderId,
            totalAmount
        });
    } catch (error) {
        // Rollback transaction if error occurs
        if (connection) await connection.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: 'Error creating order' });
    } finally {
        // Release the connection back to the pool
        if (connection) connection.release();
    }
};
// Get all manual orders
// Get all orders without pagination
export const getAllOrders = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        // Query to get all orders with formatted date
        const [orders] = await connection.query(`
            SELECT 
                order_id as orderId,
                customer_name as customerName,
                total_amount as totalAmount,
                DATE_FORMAT(order_date, '%Y-%m-%d %H:%i:%s') as orderDate,
                payment_method as paymentMethod,
                items
            FROM manual_orders
            ORDER BY order_date DESC
        `);

        // Parse the JSON items for each order
        const formattedOrders = orders.map(order => ({
            ...order,
            items: JSON.parse(order.items),
            totalAmount: parseFloat(order.totalAmount)
        }));

        res.json({
            success: true,
            message: 'Orders fetched successfully',
            orders: formattedOrders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching orders',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};