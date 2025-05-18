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
