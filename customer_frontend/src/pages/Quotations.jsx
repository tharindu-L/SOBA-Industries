import './Quotations.css';

import { Alert, Button, Form, Spinner, Table } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';

import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Quotations = () => {
  const [orders, setOrders] = useState([]);
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [specialNotes, setSpecialNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [designFiles, setDesignFiles] = useState([]);
  const [customerId, setCustomerId] = useState(null);
  const [category, setCategory] = useState('');
  const [wantDate, setWantDate] = useState('');
  const navigate = useNavigate();
  
  // Get tomorrow's date for the minimum date in the date picker
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const categoryOptions = ['Medals', 'Badges', 'Mugs', 'Other'];

  // Check authentication and get customer ID
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      //setError('You must be logged in to place custom orders');
      //localStorage.setItem('needsLogin', 'true');
      // Instead of redirecting to /login, set a flag and redirect to home
      localStorage.setItem('needsLogin', 'true');
      navigate('/'); // Redirect to home where the login modal can be shown
      return;
    }

    try {
      const decoded = jwtDecode(token);
      console.log("Decoded token:", decoded);
      setCustomerId(decoded.id);
      
      // Fetch orders after confirming user is authenticated
      fetchOrders(token);
    } catch (err) {
      console.error('Error decoding token:', err);
      setError('Authentication error. Please login again.');
      localStorage.removeItem('token'); // Remove invalid token
      localStorage.setItem('needsLogin', 'true');
      navigate('/');
    }
  }, [navigate]);

  const fetchOrders = async (token) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/order/all_customer_order_Id', {
        method: 'GET',
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        },
      });

      if (response.status === 401) {
        throw new Error('Authentication failed');
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Orders data:", data);
      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(`Error fetching orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setDesignFiles([...e.target.files]);
  };

  const handleCreateOrder = async () => {
    if (!description || !customerId || !category || !wantDate) {
      setError('Description, category and want date are required');
      return;
    }

    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in again.');
      setLoading(false);
      localStorage.setItem('needsLogin', 'true');
      navigate('/');
      return;
    }

    const formData = new FormData();
    formData.append('customerId', customerId);
    formData.append('description', description);
    formData.append('quantity', quantity);
    formData.append('specialNotes', specialNotes);
    formData.append('category', category);
    formData.append('wantDate', wantDate);
    
    console.log("FormData contents:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    designFiles.forEach(file => {
      formData.append('designFiles', file);
    });

    try {
      const response = await fetch('http://localhost:4000/api/order/custom-order', {
        method: 'POST',
        headers: {
          'token': token
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Success
        setDescription('');
        setQuantity(1);
        setSpecialNotes('');
        setCategory('');
        setWantDate('');
        setDesignFiles([]);
        
        // Refresh orders list after creating a new one
        fetchOrders(token);
        
        alert('Custom order created successfully!');
      } else {
        setError(data.message || 'Error creating order');
        console.error('Order creation failed:', data);
      }
    } catch (err) {
      setError(`Error creating order: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quotations-container">
      <h2>Custom Orders</h2>

      {/* Form for creating a new order */}
      <div className="order-form-container mb-3">
        <h3>Create New Custom Order</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form>
        <Form.Group className="mb-3">
          <Form.Label>Category *</Form.Label>
          <Form.Select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
          <Form.Group controlId="description" className="mb-3">
            <Form.Label>Description *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter order description"
              required
            />
          </Form.Group>

          <Form.Group controlId="quantity" className="mb-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="wantDate" className="mb-3">
            <Form.Label>Required By Date *</Form.Label>
            <Form.Control
              type="date"
              value={wantDate}
              onChange={(e) => setWantDate(e.target.value)}
              min={minDate}
              required
            />
            <Form.Text muted>
              Please select the date you need this order completed by
            </Form.Text>
          </Form.Group>

          <Form.Group controlId="specialNotes" className="mb-3">
            <Form.Label>Special Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="Any special instructions"
            />
          </Form.Group>

          <Form.Group controlId="designFiles" className="mb-3">
            <Form.Label>Design Files</Form.Label>
            <Form.Control
              type="file"
              multiple
              onChange={handleFileChange}
            />
            <Form.Text muted>
              Upload design files (images, PDFs, etc.)
            </Form.Text>
          </Form.Group>

          <Button 
            onClick={handleCreateOrder} 
            disabled={loading || !customerId} 
            variant="primary"
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Creating...
              </>
            ) : (
              'Create Order'
            )}
          </Button>
        </Form>
      </div>

      {/* Display list of orders in a table */}
      {loading && <Spinner animation="border" variant="primary" className="d-block mx-auto mt-3" />}
      
      {!loading && Array.isArray(orders) && orders.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Category</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Required By</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Design Files</th>
            </tr>
          </thead>
          <tbody>
            {orders.filter(order => order).map((order, index) => (
              <tr key={order.orderId || index}>
                <td>{index + 1}</td>
                <td>{order.category || 'Not specified'}</td>
                <td>{order.description || 'No description'}</td>
                <td>{order.quantity || 0}</td>
                <td>{order.wantDate ? new Date(order.wantDate).toLocaleDateString() : 'Not specified'}</td>
                <td>{order.status || 'Pending'}</td>
                <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</td>
                <td>
                  {order.designFiles && Array.isArray(order.designFiles) && order.designFiles.length > 0 ? (
                    <ul className="list-unstyled">
                      {order.designFiles.map((file, i) => (
                        <li key={i}>
                          <a 
                            href={`http://localhost:4000/images/${file}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {file}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : 'No files'}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        !loading && <p>No orders found.</p>
      )}
    </div>
  );
};

export default Quotations;