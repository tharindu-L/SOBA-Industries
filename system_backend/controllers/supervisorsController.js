import bcrypt from 'bcrypt';
import { createToken } from '../middleware/token.js';
import pool from '../config/db.js';
import validator from 'validator';

// Register Supervisor
const registerSupervisor = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Validation checks
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Please enter a valid email' });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: 'Please enter a strong password (at least 8 characters)' });
    }

    // Create the supervisors table if it doesn't exist
    const CREATE_TABLE_QUERY = `
      CREATE TABLE IF NOT EXISTS supervisors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    // Insert supervisor into the database - using 'name' column instead of 'username'
    const INSERT_SUPERVISOR_QUERY = 'INSERT INTO supervisors (name, email, password) VALUES (?, ?, ?)';
    const [result] = await pool.query(INSERT_SUPERVISOR_QUERY, [username, email, hashedPassword]);

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

    const token = createToken(supervisor.id);

    res.json({ success: true, token });
  } catch (error) {
    console.error('Error logging in supervisor:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

export { registerSupervisor, loginSupervisor };
