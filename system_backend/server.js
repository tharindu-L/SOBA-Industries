import 'dotenv/config';

import AnalyticsRouter from './routes/analyticsRoutes.js';
import CustomRouter from './routes/customOrderRoutes.js';
import OrderRoutes from './routes/orderRoutes.js';
import ProductRouter from './routes/productRoutes.js';
import adminRouter from './routes/adminRouter.js';
import assignRouter from './routes/assignEmployeesRouter.js';
import billRoutes from './routes/billRoutes.js';
import cors from 'cors';
import express from 'express';
import { fileURLToPath } from 'url';
import machineRouter from './routes/machineRouter.js';
import materialRouter from './routes/addmaterialRoutes.js';
import path from 'path';
import pool from './config/db.js';
import quotationRouter from './routes/addquotation.js';
import reportRouter from './routes/reportRouter.js';
import supervisorsRouter from './routes/supervisorsRouter.js';
import userRouter from './routes/UserRouter.js';
import cashierRouter from './routes/cashierRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Middleware
app.use(express.json());
app.use(cors());

// Serve static images
app.use('/images', express.static('uploads'));

// API endpoints
app.use('/api/material', materialRouter);
app.use('/api/user', userRouter); 
app.use('/api/admin', adminRouter);
app.use('/api/report', reportRouter);
// Remove or comment out this line
// app.use('/api/guides', supervisorsRouter);
app.use('/api/quotation', quotationRouter);
app.use('/api/product', ProductRouter);
app.use('/api/jobs', assignRouter);
app.use('/api/machine', machineRouter);
app.use('/api/order',OrderRoutes);
app.use('/api/analytics',AnalyticsRouter);
app.use('/api/bill', billRoutes);
app.use('/api/custom-orders', CustomRouter);
app.use('/api/cashier', cashierRouter);
// Keep this line to ensure consistent routing
app.use('/api/supervisors', supervisorsRouter);

// Add a test endpoint for the supervisors API
app.get('/api/supervisors/test', (req, res) => {
  res.json({ success: true, message: 'Supervisors API is working!' });
});

// Ensure supervisors can access material APIs
app.get('/api/supervisors/materials', supervisorsRouter);

// Make material routes available to supervisors
app.get('/api/material/get_all', async (req, res) => {
  try {
    console.log('Server endpoint: Fetching all materials');
    const [materials] = await pool.query(
      'SELECT itemId as item_id, itemName as item_name, availableQty as available_qty, unitPrice as unit_price, preorder_level FROM materials'
    );
    
    console.log(`Found ${materials.length} materials`);
    res.json({ success: true, materials });
  } catch (error) {
    console.error('Error fetching all materials:', error);
    res.status(500).json({ success: false, message: 'Error fetching materials' });
  }
});

// Add endpoint to get low stock materials
app.get('/api/material/low-stock', async (req, res) => {
  try {
    const [materials] = await pool.query(
      'SELECT * FROM materials WHERE availableQty <= preorder_level'
    );
    res.json({ success: true, lowStockMaterials: materials });
  } catch (error) {
    console.error('Error fetching low stock materials:', error);
    res.status(500).json({ success: false, message: 'Error fetching low stock materials' });
  }
});

// Add endpoint to get low stock products - Fix the query to handle NULL preorder_level
app.get('/api/product/low-stock', async (req, res) => {
  try {
    console.log('Fetching low stock products...');
    const [products] = await pool.query(
      'SELECT * FROM products WHERE stock <= COALESCE(preorder_level, 10)'
    );
    console.log(`Found ${products.length} low stock products:`, products);
    res.json({ success: true, lowStockProducts: products });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ success: false, message: 'Error fetching low stock products' });
  }
});

// Add report endpoints specifically for inventory and sales reports
app.get('/api/reports/inventory/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;
    
    console.log(`Generating inventory report for ${type} from ${startDate || 'all time'} to ${endDate || 'all time'}`);
    
    let items = [];
    let summary = {};
    
    if (type === 'materials') {
      // Query for materials
      console.log('Fetching materials data...');
      
      // Fix the column name from 'itemId' to 'item_id'
      const [materials] = await pool.query(
        `SELECT 
          m.item_id as id, 
          m.item_name as name, 
          m.available_qty as currentStock, 
          'kg' as unit, 
          COALESCE(m.preorder_level, 0) as minimumRequired,
          CASE
            WHEN m.available_qty > COALESCE(m.preorder_level, 0) THEN 'Normal'
            WHEN m.available_qty > 0 AND m.available_qty <= COALESCE(m.preorder_level, 0) THEN 'Low'
            ELSE 'Out'
          END as stockStatus,
          0 as inventory_change
        FROM materials m`
      );
      
      console.log(`Found ${materials.length} materials`);
      
      // Get inventory changes if dates are provided
      if (startDate && endDate) {
        try {
          // Update quantity changes after query
          for (const material of materials) {
            material.change = material.inventory_change; // Copy from inventory_change to change
            delete material.inventory_change; // Remove the temporary property
          }
        } catch (changeErr) {
          console.error('Error setting material changes:', changeErr);
          // Continue with the report without changes data
        }
      } else {
        // No dates, just rename the property
        for (const material of materials) {
          material.change = material.inventory_change;
          delete material.inventory_change;
        }
      }
      
      items = materials;
      
      // Calculate summary
      const lowStockCount = materials.filter(m => m.stockStatus === 'Low').length;
      const outOfStockCount = materials.filter(m => m.stockStatus === 'Out').length;
      
      summary = {
        totalItems: materials.length,
        lowStockItems: lowStockCount,
        outOfStockItems: outOfStockCount
      };
      
    } else if (type === 'products') {
      // Query for products
      console.log('Fetching products data...');
      
      // Update the query to NOT reference preorder_level since it doesn't exist
      // Use a fixed value (10) as the minimum required quantity for all products
      const [products] = await pool.query(
        `SELECT 
          p.product_id as id,
          p.name as name,
          p.stock as currentStock,
          'pc' as unit,
          10 as minimumRequired,
          CASE
            WHEN p.stock > 10 THEN 'Normal'
            WHEN p.stock > 0 AND p.stock <= 10 THEN 'Low'
            ELSE 'Out'
          END as stockStatus,
          0 as inventory_change
        FROM products p`
      );
      
      console.log(`Found ${products.length} products`);
      
      // Get inventory changes if dates are provided
      if (startDate && endDate) {
        try {
          console.log('Fetching product inventory changes...');
          
          for (let product of products) {
            try {
              const [changes] = await pool.query(
                `SELECT 
                  COALESCE(SUM(oi.quantity), 0) as used_quantity
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.order_id
                WHERE oi.product_id = ? AND o.order_date BETWEEN ? AND ?`,
                [product.id, startDate, endDate]
              );
              
              if (changes.length > 0) {
                product.change = -1 * (changes[0].used_quantity || 0); // Negative because it's used
              } else {
                product.change = 0;
              }
            } catch (productErr) {
              console.error(`Error getting changes for product ${product.id}:`, productErr);
              product.change = 0; // Set default value if error
            }
            
            delete product.inventory_change; // Remove the temporary property
          }
        } catch (changeErr) {
          console.error('Error fetching product changes:', changeErr);
          // Set default changes
          for (const product of products) {
            product.change = product.inventory_change; 
            delete product.inventory_change;
          }
        }
      } else {
        // No dates, just rename the property
        for (const product of products) {
          product.change = product.inventory_change;
          delete product.inventory_change;
        }
      }
      
      items = products;
      
      // Calculate summary
      const lowStockCount = products.filter(p => p.stockStatus === 'Low').length;
      const outOfStockCount = products.filter(p => p.stockStatus === 'Out').length;
      
      summary = {
        totalItems: products.length,
        lowStockItems: lowStockCount,
        outOfStockItems: outOfStockCount
      };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid inventory type' });
    }
    
    return res.json({ 
      success: true, 
      items,
      summary
    });
  } catch (error) {
    console.error('Error generating inventory report:', error);
    return res.status(500).json({ success: false, message: `Error generating inventory report: ${error.message}` });
  }
});

app.get('/api/reports/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    console.log(`Generating sales report from ${startDate || 'all time'} to ${endDate || 'all time'}`);
    
    let dateFilter = '';
    let dateParams = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE o.order_date BETWEEN ? AND ?';
      dateParams = [startDate, endDate];
    }
    
    // Query for orders within date range
    console.log('Fetching orders...');
    
    const [orders] = await pool.query(
      `SELECT 
        o.order_id as id,
        o.order_date as date,
        o.order_id as orderId,
        COALESCE(o.customer_id, 'Guest') as customer,
        (
          SELECT COUNT(*) 
          FROM order_items oi 
          WHERE oi.order_id = o.order_id
        ) as items,
        'normal' as type,
        COALESCE(o.total_amount, 0) as total,
        COALESCE(o.current_status, 'pending') as status,
        COALESCE(o.payment_status, 'pending') as payment_status
      FROM orders o
      ${dateFilter}
      ORDER BY o.order_date DESC
      LIMIT 100`,
      dateParams
    );
    
    console.log(`Found ${orders.length} orders`);
    
    // Get custom orders if they exist in the database
    let customOrders = [];
    try {
      console.log('Checking for custom_orders table...');
      
      // Check if custom_orders table exists
      const [tables] = await pool.query(
        `SELECT table_name FROM information_schema.tables 
         WHERE table_schema = DATABASE() 
         AND table_name = 'custom_orders'`
      );
      
      if (tables.length > 0) {
        console.log('Fetching custom orders...');
        let customFilter = '';
        let customParams = [];
        
        if (startDate && endDate) {
          customFilter = 'WHERE co.createdAt BETWEEN ? AND ?';
          customParams = [startDate, endDate];
        }
        
        const [customResults] = await pool.query(
          `SELECT 
            co.orderId as id,
            co.createdAt as date,
            co.orderId as orderId,
            COALESCE(co.customerId, 'Guest') as customer,
            1 as items,
            'custom' as type,
            COALESCE(co.price, 0) as total,
            COALESCE(co.status, 'pending') as status,
            'pending' as payment_status
          FROM custom_orders co
          ${customFilter}
          ORDER BY co.createdAt DESC`,
          customParams
        );
        
        customOrders = customResults;
        console.log(`Found ${customOrders.length} custom orders`);
      } else {
        console.log('custom_orders table does not exist');
      }
    } catch (err) {
      console.log('Error fetching custom orders:', err.message);
      // Continue without custom orders
    }
    
    // Combine regular and custom orders
    const allOrders = [...orders, ...customOrders];
    
    // Calculate summary statistics
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, order) => 
      sum + (parseFloat(order.total) || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Get top selling product
    let topProduct = 'None';
    try {
      const [topProducts] = await pool.query(
        `SELECT 
          p.name as product_name,
          SUM(oi.quantity) as total_sold
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        JOIN orders o ON oi.order_id = o.order_id
        ${dateFilter}
        GROUP BY oi.product_id
        ORDER BY total_sold DESC
        LIMIT 1`,
        dateParams
      );
      
      topProduct = topProducts.length > 0 ? topProducts[0].product_name : 'None';
    } catch (topErr) {
      console.error('Error fetching top product:', topErr);
      // Continue with default "None" for top product
    }
    
    return res.json({
      success: true,
      sales: allOrders,
      summary: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        topProduct
      }
    });
  } catch (error) {
    console.error('Error generating sales report:', error);
    return res.status(500).json({ success: false, message: `Error generating sales report: ${error.message}` });
  }
});

// Download report endpoints
app.get('/api/reports/inventory/:type/download', async (req, res) => {
  try {
    const { type } = req.params;
    const { format } = req.query;
    
    // This is a simple implementation - in production, generate proper PDF/Excel files
    res.setHeader('Content-Disposition', `attachment; filename=inventory_${type}_report.${format}`);
    
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      // Generate PDF content here
      res.send(`Inventory ${type} report in PDF format`);
    } else {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      // Generate Excel content here
      res.send(`Inventory ${type} report in Excel format`);
    }
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ success: false, message: 'Error downloading report' });
  }
});

app.get('/api/reports/sales/download', async (req, res) => {
  try {
    const { format } = req.query;
    
    // This is a simple implementation - in production, generate proper PDF/Excel files
    res.setHeader('Content-Disposition', `attachment; filename=sales_report.${format}`);
    
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      // Generate PDF content here
      res.send('Sales report in PDF format');
    } else {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      // Generate Excel content here
      res.send('Sales report in Excel format');
    }
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ success: false, message: 'Error downloading report' });
  }
});

// Test database connection
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.json({ success: true, message: 'Database connected!', result: rows[0] });
    } catch (error) {
        console.error('Error connecting to the database:', error);
        res.status(500).json({ success: false, message: 'Error connecting to the database', error });
    }
});

// Root route
app.get('/', (req, res) => {
    res.send('API WORKING');
});

// Start the server
app.listen(port, () => {
    console.log(`Server starting on http://localhost:${port}`);

});
