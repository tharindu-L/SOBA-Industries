import bcrypt from 'bcrypt';
import { createToken } from '../middleware/token.js';
import pool from '../config/db.js';
import validator from 'validator';

// Register Supervisor
const registerSupervisor = async (req, res) => {
  const { username, email, password, tel_num } = req.body;
  try {
    // Validation checks
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Please enter a valid email' });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: 'Please enter a strong password (at least 8 characters)' });
    }
    if (!tel_num || tel_num.length !== 10) {
      return res.json({ success: false, message: 'Please enter a valid phone number' });
    }

    // Create the supervisors table if it doesn't exist
    const CREATE_TABLE_QUERY = `
      CREATE TABLE IF NOT EXISTS supervisors (
        SupervisorID INT AUTO_INCREMENT PRIMARY KEY,
        supervisor_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        tel_num VARCHAR(15),
        profile_image VARCHAR(255),
        join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await pool.query(CREATE_TABLE_QUERY);

    // Check if supervisor with that email already exists
    const CHECK_EMAIL_QUERY = 'SELECT * FROM supervisors WHERE email = ?';
    const [existingSupervisors] = await pool.query(CHECK_EMAIL_QUERY, [email]);

    if (existingSupervisors.length > 0) {
      return res.json({ success: false, message: 'Email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert supervisor into the database - using 'supervisor_name' column instead of 'name'
    const INSERT_SUPERVISOR_QUERY = 'INSERT INTO supervisors (supervisor_name, email, password, tel_num) VALUES (?, ?, ?, ?)';
    const [result] = await pool.query(INSERT_SUPERVISOR_QUERY, [username, email, hashedPassword, tel_num]);

    // Generate token for the newly registered supervisor
    const token = createToken(result.insertId);

    res.json({ success: true, token, message: 'Supervisor registered successfully' });
  } catch (error) {
    console.error('Error registering supervisor:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// Login Supervisor
const loginSupervisor = async (req, res) => {
  const { email, password } = req.body;
  try {
    const SELECT_SUPERVISOR_QUERY = 'SELECT * FROM supervisors WHERE email = ?';
    const [rows] = await pool.query(SELECT_SUPERVISOR_QUERY, [email]);

    if (rows.length === 0) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    const supervisor = rows[0];
    const isMatch = await bcrypt.compare(password, supervisor.password);

    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    const token = createToken(supervisor.SupervisorID);

    res.json({ success: true, token });
  } catch (error) {
    console.error('Error logging in supervisor:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// Get Supervisor Profile
const getSupervisorProfile = async (req, res) => {
  try {
    const supervisorId = req.body.userId; // Changed from req.userId to req.body.userId
    
    // Fetch supervisor data from the database
    const SELECT_SUPERVISOR_QUERY = 'SELECT SupervisorID, supervisor_name, email, tel_num, profile_image, join_date FROM supervisors WHERE SupervisorID = ?';
    const [rows] = await pool.query(SELECT_SUPERVISOR_QUERY, [supervisorId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    // Return supervisor data (excluding the password)
    res.json({ success: true, ...rows[0] });
  } catch (error) {
    console.error('Error fetching supervisor profile:', error);
    res.status(500).json({ success: false, message: 'Server error during profile fetch' });
  }
};

// Get low stock materials
const getLowStockMaterials = async (req, res) => {
  try {
    const [materials] = await pool.query(
      'SELECT * FROM materials WHERE availableQty <= preorder_level'
    );
    
    res.json({ 
      success: true, 
      lowStockMaterials: materials 
    });
  } catch (error) {
    console.error('Error fetching low stock materials:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching low stock materials' 
    });
  }
};

// Update material quantities when used in production
const useMaterials = async (req, res) => {
  const { materials } = req.body;
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Validate input
    if (!Array.isArray(materials) || materials.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid materials data. Please provide an array of materials.'
      });
    }
    
    // Process each material
    for (const material of materials) {
      const { itemId, quantity } = material;
      
      if (!itemId || !quantity || isNaN(quantity) || quantity <= 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Each material must have a valid itemId and quantity.'
        });
      }
      
      // Check if we have enough of this material
      const [materialData] = await connection.query(
        'SELECT availableQty FROM materials WHERE itemId = ?',
        [itemId]
      );
      
      if (materialData.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: `Material with ID ${itemId} not found.`
        });
      }
      
      const availableQty = materialData[0].availableQty;
      
      if (availableQty < quantity) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient quantity for material ID ${itemId}. Available: ${availableQty}, Requested: ${quantity}`
        });
      }
      
      // Update material quantity
      await connection.query(
        'UPDATE materials SET availableQty = availableQty - ? WHERE itemId = ?',
        [quantity, itemId]
      );
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Materials updated successfully'
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error updating material quantities:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating material quantities'
    });
  } finally {
    connection.release();
  }
};

export { registerSupervisor, loginSupervisor, getSupervisorProfile, getLowStockMaterials, useMaterials };
