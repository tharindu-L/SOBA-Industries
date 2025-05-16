import bcrypt from 'bcrypt';
import { createToken } from '../middleware/token.js';
import pool from '../config/db.js';
import validator from 'validator';

// Register User
const registerUser = async (req, res) => {
  const { name, password, email, tel_num } = req.body;
  try {
    // Validation checks
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Please enter a valid email' });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: 'Please enter a strong password' });
    }
    if (tel_num.length !== 10) {
      return res.json({ success: false, message: 'Please enter a valid phone number' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle profile image
    const profileImage = req.file ? req.file.filename : null; // If no file, store null

    // Insert user into the database
    const INSERT_USER_QUERY =
      'INSERT INTO customers (customer_name, email, password, tel_num, profile_image) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.query(INSERT_USER_QUERY, [
      name,
      email,
      hashedPassword,
      tel_num,
      profileImage,
    ]);

    // Generate token for the newly registered user
    const token = createToken(result.insertId);

    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: 'Email already exists or error occurred' });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const SELECT_USER_QUERY = 'SELECT * FROM customers WHERE email = ?';
    const [rows] = await pool.query(SELECT_USER_QUERY, [email]);

    if (rows.length === 0) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    const token = createToken(user.CustomerID);

    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: 'Error logging in user' });
  }
};

// Get Users
const getUsers = async (req, res) => {
  try {
    const SELECT_USERS_QUERY =
      'SELECT CustomerID, customer_name, email, tel_num, profile_image FROM customers';
    const [users] = await pool.query(SELECT_USERS_QUERY);

    res.json({ success: true, users });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ success: false, message: 'Error getting users' });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  const { userId } = req.body;
  try {
    const DELETE_USER_QUERY = 'DELETE FROM customers WHERE CustomerID = ?';
    const [result] = await pool.query(DELETE_USER_QUERY, [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
};

// Update Profile Image
const updateProfileImage = async (req, res) => {
  const userId = req.body.userId; // Get userId from the request body
  console.log('Received userId:', userId); // Debugging to check userId

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Image is required' });
  }

  const profileImage = req.file.filename; // Get the uploaded image filename

  const UPDATE_PROFILE_IMAGE_QUERY = `
    UPDATE customers SET profile_image = ? WHERE CustomerID = ?
  `;

  try {
    // Log the query and parameters to ensure it's correct
    console.log('Running query:', UPDATE_PROFILE_IMAGE_QUERY, [profileImage, userId]);

    // Execute the query to update the database with the new image filename
    await pool.query(UPDATE_PROFILE_IMAGE_QUERY, [profileImage, userId]);

    res.status(200).json({ success: true, message: 'Profile image updated', profile_image: profileImage });
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({ success: false, message: 'Error updating profile image' });
  }
};

// Get User by ID
const getUserById = async (req, res) => {
  const { userId } = req.body; // Get userId from the request body

  try {
    const SELECT_USER_QUERY =
      'SELECT CustomerID, customer_name, email, tel_num, profile_image, join_date FROM customers WHERE CustomerID = ?';
    const [rows] = await pool.query(SELECT_USER_QUERY, [userId]);

    if (rows.length === 0) {
      return res.json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ success: false, message: 'Error fetching user data' });
  }
};

export { loginUser, registerUser, getUsers, deleteUser, updateProfileImage, getUserById };
