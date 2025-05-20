import 'dotenv/config';

// Import route modules for different parts of the application
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
import PDFDocument from 'pdfkit'; // For generating PDF reports
import ExcelJS from 'exceljs'; // For generating Excel reports

// Convert ESM module URL to filesystem path (ES6 module compatibility)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express application
const app = express();
const port = process.env.PORT || 4000;

// Serve static content from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware for parsing JSON in request bodies and enabling CORS
app.use(express.json());
app.use(cors());

// Serve static images from uploads directory
app.use('/images', express.static('uploads'));

// Debugging middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Register API routes for different modules of the application
app.use('/api/material', materialRouter);   // Material inventory management
app.use('/api/user', userRouter);           // User authentication and management
app.use('/api/admin', adminRouter);         // Admin-specific functionality
app.use('/api/report', reportRouter);       // Reports generation
// app.use('/api/guides', supervisorsRouter); // Removed or commented out line

app.use('/api/quotation', quotationRouter);  // Quotation management
app.use('/api/product', ProductRouter);      // Product catalog management
app.use('/api/jobs', assignRouter);          // Job assignments
app.use('/api/machine', machineRouter);      // Machine management
app.use('/api/order',OrderRoutes);           // Order processing
app.use('/api/analytics',AnalyticsRouter);   // Analytics and dashboards
app.use('/api/bill', billRoutes);            // Billing and invoicing
app.use('/api/custom-orders', CustomRouter); // Custom order management
app.use('/api/user/cashier', cashierRouter); // Cashier-specific operations
app.use('/api/supervisors', supervisorsRouter); // Supervisor-specific operations

// Test endpoint to verify supervisors API functionality
app.get('/api/supervisors/test', (req, res) => {
  res.json({ success: true, message: 'Supervisors API is working!' });
});

// Endpoint for supervisors to access material data
app.get('/api/supervisors/materials', supervisorsRouter);

// Global endpoint to fetch all materials
app.get('/api/material/get_all', async (req, res) => {
  try {
    console.log('Server endpoint: Fetching all materials');
    // Query the database for all materials with field name standardization
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

// Endpoint to get materials with stock levels at or below preorder level
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

// Endpoint to get products with low stock levels
// COALESCE handles NULL preorder_level values by defaulting to 10
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

// Advanced endpoint for generating inventory reports (materials/products)
app.get('/api/reports/inventory/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;
    
    console.log(`Generating inventory report for ${type} from ${startDate || 'all time'} to ${endDate || 'all time'}`);
    
    let items = [];
    let summary = {};
    
    // Handle different inventory types (materials or products)
    if (type === 'materials') {
      // Query for materials inventory data
      console.log('Fetching materials data...');
      
      // Get materials with standardized column names
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
      
      // If date range provided, get inventory changes during that period
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
      
      // Calculate summary statistics for materials
      const lowStockCount = materials.filter(m => m.stockStatus === 'Low').length;
      const outOfStockCount = materials.filter(m => m.stockStatus === 'Out').length;
      
      summary = {
        totalItems: materials.length,
        lowStockItems: lowStockCount,
        outOfStockItems: outOfStockCount
      };
      
    } else if (type === 'products') {
      // Query for product inventory data
      console.log('Fetching products data...');
      
      // Get products with stock status calculation 
      // Using fixed value (10) as minimum required since preorder_level may not exist for products
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
      
      // If date range provided, get product usage during that period
      if (startDate && endDate) {
        try {
          console.log('Fetching product inventory changes...');
          
          // Calculate usage for each product
          for (let product of products) {
            try {
              // Get total quantity used for this product in the date range
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
      
      // Calculate summary statistics for products
      const lowStockCount = products.filter(p => p.stockStatus === 'Low').length;
      const outOfStockCount = products.filter(p => p.stockStatus === 'Out').length;
      
      summary = {
        totalItems: products.length,
        lowStockItems: lowStockCount,
        outOfStockItems: outOfStockCount
      };
    } else {
      // Invalid inventory type requested
      return res.status(400).json({ success: false, message: 'Invalid inventory type' });
    }
    
    // Return the inventory report data
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

// Advanced endpoint for generating sales reports
app.get('/api/reports/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    console.log(`Generating sales report from ${startDate || 'all time'} to ${endDate || 'all time'}`);
    
    // Build date filter for SQL queries if start and end dates are provided
    let dateFilter = '';
    let dateParams = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE o.order_date BETWEEN ? AND ?';
      dateParams = [startDate, endDate];
    }
    
    // Query for orders within date range
    console.log('Fetching orders...');
    
    // Get regular orders with computed fields and standardized naming
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
      
      // Check if custom_orders table exists in database
      const [tables] = await pool.query(
        `SELECT table_name FROM information_schema.tables 
         WHERE table_schema = DATABASE() 
         AND table_name = 'custom_orders'`
      );
      
      // If table exists, fetch custom orders
      if (tables.length > 0) {
        console.log('Fetching custom orders...');
        let customFilter = '';
        let customParams = [];
        
        // Apply date filter if needed
        if (startDate && endDate) {
          customFilter = 'WHERE co.createdAt BETWEEN ? AND ?';
          customParams = [startDate, endDate];
        }
        
        // Query custom orders with standardized fields
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
      // Query for product with highest sales volume
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
    
    // Return sales report data
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

// Endpoint to download inventory report as PDF or Excel
app.get('/api/reports/inventory/:type/download', async (req, res) => {
  try {
    const { type } = req.params;
    const { format, startDate, endDate } = req.query;
    
    console.log(`Generating downloadable ${format} inventory report for ${type}`);
    
    // Fetch the appropriate data based on inventory type (materials or products)
    let items = [];
    if (type === 'materials') {
      // Query for materials data with relevant fields
      const [materials] = await pool.query(
        `SELECT 
          item_id as id, 
          item_name as name,
          available_qty as currentStock,
          unit_price as unitPrice,
          preorder_level as minimumRequired
        FROM materials`
      );
      items = materials;
    } else if (type === 'products') {
      // Query for products data with relevant fields
      // Use 'price' column for products instead of 'unit_price'
      const [products] = await pool.query(
        `SELECT 
          product_id as id,
          name,
          stock as currentStock,
          price as unitPrice,
          10 as minimumRequired
        FROM products`
      );
      items = products;
    }
    
    // Generate the appropriate file format (PDF or Excel)
    if (format === 'pdf') {
      // Create a PDF document for the report
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=inventory_${type}_report.pdf`);
      
      // Pipe the PDF document to the response
      doc.pipe(res);
      
      // Add title and header content to the PDF
      doc.fontSize(25).text(`${type.charAt(0).toUpperCase() + type.slice(1)} Inventory Report`, {
        align: 'center'
      });
      
      doc.moveDown();
      doc.fontSize(10).text(`Report Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
      if (startDate && endDate) {
        doc.fontSize(10).text(`Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`, { align: 'center' });
      }
      
      doc.moveDown(2);
      
      // Create table headers
      const tableTop = 150;
      const columnSpacing = 20;
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('ID', 50, tableTop);
      doc.text('Name', 100, tableTop);
      doc.text('Current Stock', 250, tableTop);
      doc.text('Unit Price', 350, tableTop);
      doc.text('Min Required', 450, tableTop);
      
      // Add a horizontal line under headers
      doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();
      
      // Add table rows for each item
      let rowTop = tableTop + 30;
      doc.fontSize(10).font('Helvetica');
      
      items.forEach(item => {
        doc.text(item.id.toString(), 50, rowTop);
        doc.text(item.name, 100, rowTop);
        doc.text(item.currentStock.toString(), 250, rowTop);
        doc.text(`LKR ${parseFloat(item.unitPrice || 0).toFixed(2)}`, 350, rowTop);
        doc.text(item.minimumRequired.toString(), 450, rowTop);
        rowTop += 20;
        
        // Create a new page if current page is full
        if (rowTop > 700) {  // Start a new page if we're near the bottom
          doc.addPage();
          rowTop = 50;
          
          // Add headers on the new page
          doc.fontSize(12).font('Helvetica-Bold');
          doc.text('ID', 50, rowTop);
          doc.text('Name', 100, rowTop);
          doc.text('Current Stock', 250, rowTop);
          doc.text('Unit Price', 350, rowTop);
          doc.text('Min Required', 450, rowTop);
          
          doc.moveTo(50, rowTop + 20).lineTo(550, rowTop + 20).stroke();
          rowTop += 30;
          doc.fontSize(10).font('Helvetica');
        }
      });
      
      // Add summary section at the end
      doc.moveDown(2);
      doc.fontSize(12).font('Helvetica-Bold').text('Summary', 50, rowTop + 20);
      doc.fontSize(10).font('Helvetica').text(`Total Items: ${items.length}`, 50, rowTop + 40);
      
      // Calculate and add low stock count
      const lowStockCount = items.filter(item => item.currentStock <= item.minimumRequired).length;
      doc.text(`Low Stock Items: ${lowStockCount}`, 50, rowTop + 60);
      
      // Calculate and add out-of-stock count
      const outOfStockCount = items.filter(item => item.currentStock <= 0).length;
      doc.text(`Out of Stock Items: ${outOfStockCount}`, 50, rowTop + 80);
      
      // Finalize the PDF document
      doc.end();
      
    } else {
      // Create an Excel workbook for the report
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`${type} Inventory`);
      
      // Define columns for the worksheet
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Current Stock', key: 'currentStock', width: 15 },
        { header: 'Unit Price (LKR)', key: 'unitPrice', width: 15 },
        { header: 'Minimum Required', key: 'minimumRequired', width: 15 },
        { header: 'Status', key: 'status', width: 15 }
      ];
      
      // Add rows for each inventory item
      items.forEach(item => {
        worksheet.addRow({
          id: item.id,
          name: item.name,
          currentStock: item.currentStock,
          unitPrice: item.unitPrice || 0,
          minimumRequired: item.minimumRequired,
          status: item.currentStock <= 0 ? 'Out of Stock' : 
                 item.currentStock <= item.minimumRequired ? 'Low Stock' : 'Normal'
        });
      });
      
      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' } // Light gray
      };
      
      // Add summary section at the end of the worksheet
      worksheet.addRow([]); // Empty row for spacing
      worksheet.addRow(['Summary']);
      worksheet.addRow(['Total Items', items.length]);
      
      // Calculate and add low stock count
      const lowStockCount = items.filter(item => item.currentStock <= item.minimumRequired).length;
      worksheet.addRow(['Low Stock Items', lowStockCount]);
      
      // Calculate and add out-of-stock count
      const outOfStockCount = items.filter(item => item.currentStock <= 0).length;
      worksheet.addRow(['Out of Stock Items', outOfStockCount]);
      
      // Style the summary title
      const summaryTitleRow = worksheet.lastRow.number - 3;
      worksheet.getCell(`A${summaryTitleRow}`).font = { bold: true };
      
      // Set response headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=inventory_${type}_report.xlsx`);
      
      // Generate Excel buffer and send response
      const buffer = await workbook.xlsx.writeBuffer();
      res.send(buffer);
    }
  } catch (error) {
    console.error('Error generating downloadable report:', error);
    res.status(500).json({ success: false, message: 'Error generating downloadable report' });
  }
});

// Endpoint to download sales report as PDF or Excel
app.get('/api/reports/sales/download', async (req, res) => {
  try {
    const { format, startDate, endDate } = req.query;
    
    console.log(`Generating downloadable ${format} sales report from ${startDate || 'all time'} to ${endDate || 'all time'}`);
    
    // Build date filter for SQL queries if dates provided
    let dateFilter = '';
    let dateParams = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE o.order_date BETWEEN ? AND ?';
      dateParams = [startDate, endDate];
    }
    
    // Query for orders within date range
    const [orders] = await pool.query(
      `SELECT 
        o.order_id as id,
        o.order_date as date,
        COALESCE(o.customer_id, 'Guest') as customer,
        (
          SELECT COUNT(*) 
          FROM order_items oi 
          WHERE oi.order_id = o.order_id
        ) as items,
        'normal' as type,
        COALESCE(o.total_amount, 0) as total,
        COALESCE(o.current_status, 'pending') as status
      FROM orders o
      ${dateFilter}
      ORDER BY o.order_date DESC`,
      dateParams
    );
    
    // Include custom orders if available
    let allOrders = [...orders];
    
    // Calculate summary statistics
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, order) => 
      sum + (parseFloat(order.total) || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Generate the appropriate file format (PDF or Excel)
    if (format === 'pdf') {
      // Create a PDF document for the sales report
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=sales_report.pdf`);
      
      // Pipe the PDF document to the response
      doc.pipe(res);
      
      // Add title and header content
      doc.fontSize(25).text('Sales Report', { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(10).text(`Report Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
      if (startDate && endDate) {
        doc.fontSize(10).text(`Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`, { align: 'center' });
      }
      
      doc.moveDown(2);
      
      // Add summary section
      doc.fontSize(14).font('Helvetica-Bold').text('Summary', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Total Orders: ${totalOrders}`);
      doc.text(`Total Revenue: LKR ${totalRevenue.toFixed(2)}`);
      doc.text(`Average Order Value: LKR ${averageOrderValue.toFixed(2)}`);
      
      doc.moveDown(2);
      
      // Create table for orders
      doc.fontSize(12).font('Helvetica-Bold');
      const tableTop = doc.y;
      doc.text('Date', 50, tableTop);
      doc.text('Order ID', 130, tableTop);
      doc.text('Customer', 200, tableTop);
      doc.text('Items', 300, tableTop);
      doc.text('Total (LKR)', 350, tableTop);
      doc.text('Status', 450, tableTop);
      
      // Add a horizontal line under headers
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
      
      // Add rows for each order (limited to first 100 to avoid huge PDFs)
      let rowTop = tableTop + 25;
      doc.fontSize(9).font('Helvetica');
      
      allOrders.forEach((order, index) => {
        if (index < 100) { // Limit to first 100 orders
          const orderDate = new Date(order.date).toLocaleDateString();
          doc.text(orderDate, 50, rowTop);
          doc.text(order.id.toString(), 130, rowTop);
          doc.text(order.customer, 200, rowTop);
          doc.text(order.items.toString(), 300, rowTop);
          doc.text(parseFloat(order.total || 0).toFixed(2), 350, rowTop);
          doc.text(order.status, 450, rowTop);
          
          rowTop += 20;
          
          // Create a new page if current page is full
          if (rowTop > 700) {  
            doc.addPage();
            rowTop = 50;
            
            // Add headers on the new page
            doc.fontSize(12).font('Helvetica-Bold');
            doc.text('Date', 50, rowTop);
            doc.text('Order ID', 130, rowTop);
            doc.text('Customer', 200, rowTop);
            doc.text('Items', 300, rowTop);
            doc.text('Total (LKR)', 350, rowTop);
            doc.text('Status', 450, rowTop);
            
            doc.moveTo(50, rowTop + 15).lineTo(550, rowTop + 15).stroke();
            rowTop += 25;
            doc.fontSize(9).font('Helvetica');
          }
        }
      });
      
      // Add note if we're showing a limited set of orders
      if (allOrders.length > 100) {
        doc.moveDown();
        doc.text(`Showing first 100 out of ${allOrders.length} orders.`);
      }
      
      // Finalize the PDF
      doc.end();
      
    } else {
      // Create an Excel workbook for the sales report
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales Report');
      
      // Add title and header information
      worksheet.mergeCells('A1:F1');
      worksheet.getCell('A1').value = 'Sales Report Summary';
      worksheet.getCell('A1').font = { bold: true, size: 14 };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };
      
      worksheet.getCell('A2').value = 'Report Date:';
      worksheet.getCell('B2').value = new Date().toLocaleDateString();
      
      // Add date range if provided
      if (startDate && endDate) {
        worksheet.getCell('A3').value = 'Period:';
        worksheet.getCell('B3').value = `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
      }
      
      // Add summary statistics
      worksheet.getCell('A4').value = 'Total Orders:';
      worksheet.getCell('B4').value = totalOrders;
      
      worksheet.getCell('A5').value = 'Total Revenue:';
      worksheet.getCell('B5').value = `LKR ${totalRevenue.toFixed(2)}`;
      
      worksheet.getCell('A6').value = 'Average Order Value:';
      worksheet.getCell('B6').value = `LKR ${averageOrderValue.toFixed(2)}`;
      
      // Add empty row for spacing
      worksheet.addRow([]);
      
      // Add section header for order data
      worksheet.addRow(['Order Data:']);
      worksheet.getRow(8).font = { bold: true };
      
      // Add column headers
      worksheet.addRow(['Date', 'Order ID', 'Customer', 'Items', 'Total (LKR)', 'Status']);
      const headerRow = worksheet.lastRow;
      headerRow.eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' } // Light gray
        };
      });
      
      // Add rows for each order
      allOrders.forEach(order => {
        worksheet.addRow([
          new Date(order.date).toLocaleDateString(),
          order.id,
          order.customer,
          order.items,
          parseFloat(order.total || 0).toFixed(2),
          order.status
        ]);
      });
      
      // Format column widths
      worksheet.columns.forEach(column => {
        column.width = 15;
      });
      
      // Set response headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=sales_report.xlsx`);
      
      // Generate Excel buffer and send response
      const buffer = await workbook.xlsx.writeBuffer();
      res.send(buffer);
    }
  } catch (error) {
    console.error('Error generating downloadable sales report:', error);
    res.status(500).json({ success: false, message: 'Error generating downloadable sales report' });
  }
});

// Endpoint to fetch all custom orders
app.get('/api/custom-orders/all', async (req, res) => {
  try {
    console.log('Fetching all custom orders');
    // Query the database for all custom orders with standardized field names
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
    
    console.log(`Found ${orders.length} custom orders`);
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching all custom orders:', error);
    res.status(500).json({ success: false, message: 'Error fetching custom orders' });
  }
});

// Database migration endpoint to add service_charge column to custom_order_requests
app.get('/api/db/migrate/add-service-charge', async (req, res) => {
  try {
    console.log('Running migration to add service_charge column to custom_order_requests table');
    
    // Check if the column already exists in the table
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'custom_order_requests' 
      AND COLUMN_NAME = 'service_charge'
    `);
    
    // Only add the column if it doesn't already exist
    if (columns.length === 0) {
      // Execute ALTER TABLE SQL to add the new column
      await pool.query(`
        ALTER TABLE custom_order_requests
        ADD COLUMN service_charge DECIMAL(10,2) DEFAULT 0 NOT NULL
        AFTER total_amount
      `);
      console.log('Migration successful - added service_charge column');
      res.json({ success: true, message: 'Added service_charge column to custom_order_requests table' });
    } else {
      console.log('Migration skipped - service_charge column already exists');
      res.json({ success: true, message: 'Service charge column already exists' });
    }
  } catch (error) {
    console.error('Migration failed:', error);
    res.status(500).json({ success: false, message: 'Migration failed', error: error.message });
  }
});

// Comprehensive database migration endpoint for payment-related columns in custom_order_requests
app.get('/api/db/migrate/custom-orders-payment', async (req, res) => {
  try {
    console.log('Running migrations for custom_order_requests payment columns');
    
    // Check which columns currently exist in the table
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'custom_order_requests'
    `);
    
    // Create a list of existing column names (case insensitive)
    const existingColumns = columns.map(col => col.COLUMN_NAME.toLowerCase());
    const additions = [];
    
    // Add service_charge column if it doesn't exist
    if (!existingColumns.includes('service_charge')) {
      await pool.query(`
        ALTER TABLE custom_order_requests
        ADD COLUMN service_charge DECIMAL(10,2) DEFAULT 0 NOT NULL
        AFTER total_amount
      `);
      additions.push('service_charge');
    }
    
    // Add payment_method column if it doesn't exist
    if (!existingColumns.includes('payment_method')) {
      await pool.query(`
        ALTER TABLE custom_order_requests
        ADD COLUMN payment_method VARCHAR(50) DEFAULT 'Full' NOT NULL
      `);
      additions.push('payment_method');
    }
    
    // Add amount_paid column if it doesn't exist
    if (!existingColumns.includes('amount_paid')) {
      await pool.query(`
        ALTER TABLE custom_order_requests
        ADD COLUMN amount_paid DECIMAL(10,2) DEFAULT 0 NOT NULL
      `);
      additions.push('amount_paid');
    }
    
    // Add payment_status column if it doesn't exist
    if (!existingColumns.includes('payment_status')) {
      await pool.query(`
        ALTER TABLE custom_order_requests
        ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending' NOT NULL
      `);
      additions.push('payment_status');
    }
    
    // Return appropriate response based on what was added
    if (additions.length > 0) {
      res.json({ 
        success: true, 
        message: `Added the following columns: ${additions.join(', ')}` 
      });
    } else {
      res.json({ 
        success: true, 
        message: 'All required columns already exist in the table' 
      });
    }
  } catch (error) {
    console.error('Migration failed:', error);
    res.status(500).json({ success: false, message: 'Migration failed', error: error.message });
  }
});

// Endpoint to create new custom order request
app.post('/api/custom-orders', async (req, res) => {
  try {
    console.log('Creating new custom order request');
    // Extract data from request body
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

    // Handle file upload if design image is provided
    let designImagePath = null;
    if (req.files && req.files.designImage) {
      const file = req.files.designImage;
      const uploadPath = path.join(__dirname, 'uploads', file.name);
      await file.mv(uploadPath);
      designImagePath = `/uploads/${file.name}`;
    }

    // Generate a unique request ID with prefix REQ- and a random number
    const requestId = `REQ-${Math.floor(100000 + Math.random() * 900000)}`;

    // Insert the new custom order request into the database
    const [result] = await pool.query(
      `INSERT INTO custom_order_requests (
        request_id, 
        customer_name, 
        description, 
        item_type, 
        design_image, 
        quantity, 
        unit_price, 
        total_amount,
        service_charge,
        status, 
        want_date, 
        special_notes,
        payment_method,
        amount_paid
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        requestId,
        customerName,
        description,
        itemType,
        designImagePath,
        quantity,
        totalAmount / quantity,  // Calculate unit price from total and quantity
        totalAmount,
        serviceCharge || 0,
        'pending',               // Default status for new orders
        wantDate,
        specialNotes || '',
        paymentMethod,
        amountPaid
      ]
    );

    // Return success response with order details
    res.json({
      success: true,
      message: 'Custom order request created successfully',
      orderRequest: {
        requestId,
        customerName,
        totalAmount,
        amountPaid
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

// Test endpoint to verify database connection
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.json({ success: true, message: 'Database connected!', result: rows[0] });
    } catch (error) {
        console.error('Error connecting to the database:', error);
        res.status(500).json({ success: false, message: 'Error connecting to the database', error });
    }
});

// Root route to verify API is running
app.get('/', (req, res) => {
    res.send('API WORKING');
});

// Start the server and listen for requests
app.listen(port, () => {
    console.log(`Server starting on http://localhost:${port}`);
    // Output information about cashier routes for quick reference
    console.log('Cashier routes registered at: /api/user/cashier');
});
