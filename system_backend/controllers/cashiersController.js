import pool from '../config/db.js'; 
import bcrypt from "bcrypt";
import { createToken } from '../middleware/token.js';
import validator from "validator";

const registerCashier = async (req, res) => {
    const { username, email, password, tel_num } = req.body;
    try {
        // Validation checks
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }
        if (tel_num && tel_num.length !== 10) {
            return res.json({ success: false, message: "Please enter a valid phone number" });
        }

        // Check if cashier already exists
        const SELECT_CASHIER_QUERY = 'SELECT * FROM cashiers WHERE email = ?';
        const [existingCashiers] = await pool.query(SELECT_CASHIER_QUERY, [email]);

        if (existingCashiers.length > 0) {
            return res.json({ success: false, message: "Cashier already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Insert cashier into the database
        const INSERT_CASHIER_QUERY = 'INSERT INTO cashiers (username, email, password, tel_num) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(INSERT_CASHIER_QUERY, [username, email, hashedPassword, tel_num]);

        const token = createToken(result.insertId);
        res.json({ success: true, token });

    } catch (error) {
        console.error('Error registering cashier:', error);
        res.status(500).json({ success: false, message: "Error registering cashier" });
    }
};

const loginCashier = async (req, res) => {
    const { email, password } = req.body;
    try {
        const SELECT_CASHIER_QUERY = 'SELECT * FROM cashiers WHERE email = ?';
        const [rows] = await pool.query(SELECT_CASHIER_QUERY, [email]);

        if (rows.length === 0) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

        const cashier = rows[0];
        const isMatch = await bcrypt.compare(password, cashier.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

        const token = createToken(cashier.id);
        res.json({ success: true, token });

    } catch (error) {
        console.error('Error logging in cashier:', error);
        res.status(500).json({ success: false, message: "Error logging in cashier" });
    }
};

export { registerCashier, loginCashier };