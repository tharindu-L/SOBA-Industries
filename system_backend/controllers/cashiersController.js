import bcrypt from 'bcrypt';
import { createToken } from '../middleware/token.js';
import pool from '../config/db.js';
import validator from 'validator';

// Register Cashier
const registerCashier = async (req, res) => {
  const { username, password, email, tel_num } = req.body;
  try {
    // Validation checks
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Please enter a valid email' });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: 'Please enter a strong password' });
    }
    if (!tel_num || tel_num.length !== 10) {
      return res.json({ success: false, message: 'Please enter a valid 10-digit phone number' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert cashier into the database - map username to cashier_name
    const INSERT_CASHIER_QUERY =
      'INSERT INTO cashiers (cashier_name, email, password, tel_num, is_admin) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.query(INSERT_CASHIER_QUERY, [
      username, // mapping username to cashier_name
      email,
      hashedPassword,
      tel_num,
      0 // Default is_admin value (not an admin)
    ]);

    // Generate token for the newly registered cashier
    const token = createToken(result.insertId);

    res.json({ success: true, token, message: 'Cashier registered successfully' });
  } catch (error) {
    console.error('Error registering cashier:', error);
    res.json({ success: false, message: 'Email already exists or error occurred' });
  }
};

// Login Cashier
const loginCashier = async (req, res) => {
  const { email, password } = req.body;
  try {
    const SELECT_CASHIER_QUERY = 'SELECT * FROM cashiers WHERE email = ?';
    const [rows] = await pool.query(SELECT_CASHIER_QUERY, [email]);

    if (rows.length === 0) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    const cashier = rows[0];
    const isMatch = await bcrypt.compare(password, cashier.password);

    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    const token = createToken(cashier.CashierID);

    res.json({ success: true, token });
  } catch (error) {
    console.error('Error logging in cashier:', error);
    res.json({ success: false, message: 'Error logging in cashier' });
  }
};

export { registerCashier, loginCashier };