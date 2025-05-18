// billController.js

import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

// Function to get the next sequential manual order ID
const getNextOrderId = async (connection) => {
    try {
        // Get the highest current ID number
        const [result] = await connection.query(`
            SELECT order_id FROM manual_orders 
            WHERE order_id LIKE 'CC%' 
            ORDER BY CAST(SUBSTRING(order_id, 3) AS UNSIGNED) DESC 
            LIMIT 1
        `);
        
        let nextNumber = 1;
        if (result.length > 0) {
            // Extract the number part and increment
            const currentId = result[0].order_id;
            const currentNumber = parseInt(currentId.substring(2), 10);
            nextNumber = currentNumber + 1;
        }
        
        // Format with leading zeros (e.g., CC001)
        return `CC${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
        console.error('Error generating next order ID:', error);
        // Fallback to the old format if there's an error
        return `ORD-${uuidv4().substr(0, 8)}`;
    }
};

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
    // Replace UUID with sequential ID
    let connection;
    let orderId;
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
        // Get a connection from the pool
        connection = await pool.getConnection();
        
        // Start transaction
        await connection.beginTransaction();

        // Generate sequential order ID
        orderId = await getNextOrderId(connection);

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