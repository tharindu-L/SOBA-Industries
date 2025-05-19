import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Card, Alert, Table, Tabs, Tab } from 'react-bootstrap';

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    tel_num: '',  // Add telephone number field
    role: 'cashier' // Default role
  });

  const [feedback, setFeedback] = useState({
    message: '',
    type: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  
  // Add state for storing account data
  const [accounts, setAccounts] = useState({
    cashiers: [],
    supervisors: []
  });

  // Function to fetch existing accounts with improved error handling and debugging
  const fetchAccounts = async () => {
    try {
      // Use the regular endpoint now
      console.log('Fetching cashier accounts...');
      const cashierResponse = await axios.get('http://localhost:4000/api/user/cashier/all')
        .catch(err => {
          console.error('Error fetching cashiers:', err.message);
          return { data: [] };
        });
      
      console.log('Cashier response:', cashierResponse);
      
      // Fetch supervisor accounts
      console.log('Fetching supervisor accounts...');
      const supervisorResponse = await axios.get('http://localhost:4000/api/supervisors/all')
        .catch(err => {
          console.error('Error fetching supervisor accounts:', err.message);
          return { data: [] };
        });

      // Log detailed response information to diagnose issues
      console.log('Cashier response:', cashierResponse);
      console.log('Supervisor response:', supervisorResponse);
      
      // Map the property names to match what the tables expect
      const supervisorData = Array.isArray(supervisorResponse.data) ? 
        supervisorResponse.data.map(supervisor => ({
          username: supervisor.username || supervisor.supervisor_name,
          email: supervisor.email,
          password: supervisor.password,
          tel_num: supervisor.tel_num
        })) : [];
      
      console.log('Processed cashier data:', cashierResponse.data);
      console.log('Processed supervisor data:', supervisorData);

      // Use test data for cashiers
      setAccounts({
        cashiers: cashierResponse.data || [],
        supervisors: supervisorData
      });
      
      // Clear any error feedback if the fetch was successful
      if (feedback.type === 'danger' && feedback.message.includes('Failed to load')) {
        setFeedback({ message: '', type: '' });
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setFeedback({
        message: `Failed to load existing accounts: ${error.message || 'Unknown error'}`,
        type: 'danger'
      });
    }
  };

  // Load accounts when component mounts, with a small delay to ensure API is responsive
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAccounts();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.username.trim() || !formData.email.trim() || !formData.password || !formData.role || !formData.tel_num) {
      setFeedback({
        message: 'All fields are required',
        type: 'danger'
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setFeedback({
        message: 'Passwords do not match',
        type: 'danger'
      });
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFeedback({
        message: 'Please enter a valid email address',
        type: 'danger'
      });
      return false;
    }

    // Password length check
    if (formData.password.length < 8) {
      setFeedback({
        message: 'Password must be at least 8 characters long',
        type: 'danger'
      });
      return false;
    }

    // Phone number validation - basic check for numeric and length
    if (!/^\d{10}$/.test(formData.tel_num)) {
      setFeedback({
        message: 'Please enter a valid 10-digit phone number',
        type: 'danger'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Determine endpoint based on selected role
      let endpoint = '';
      if (formData.role === 'cashier') {
        endpoint = 'http://localhost:4000/api/user/cashier/register';
      } else if (formData.role === 'supervisor') {
        endpoint = 'http://localhost:4000/api/supervisors/register';
      } else {
        throw new Error('Invalid role selected');
      }
      
      console.log(`Submitting to endpoint: ${endpoint}`);
      
      const response = await axios.post(endpoint, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        tel_num: formData.tel_num  // Include telephone number in the request
      });

      console.log('Response received:', response.data);

      if (response.data.success) {
        setFeedback({
          message: `${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} account created successfully!`,
          type: 'success'
        });
        
        // Reset form
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          tel_num: '',
          role: 'cashier'
        });
        
        // Refresh account list after successful creation
        fetchAccounts();
      } else {
        setFeedback({
          message: response.data.message || 'Failed to create account',
          type: 'danger'
        });
      }
    } catch (error) {
      console.error('Error creating account:', error);
      setFeedback({
        message: error.response?.data?.message || 'Server error during registration',
        type: 'danger'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="p-0" style={{marginLeft:'65px', backgroundColor:'#f4f7fc'}}>
      <h2 className="mb-3" style={{marginLeft:'350px', fontWeight:'bolder'}}>Account Management</h2>
      <Row className="justify-content-center g-0">
        <Col md={10}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-primary text-white py-2">
              <h4 className="mb-0">Create New Account</h4>
            </Card.Header>
            <Card.Body className="px-4 py-3">
              {feedback.message && (
                <Alert variant={feedback.type} className="py-2">
                  {feedback.message}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Account Type</Form.Label>
                      <Form.Select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                      >
                        <option value="cashier">Cashier</option>
                        <option value="supervisor">Production Manager</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter username"
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        required
                      />
                      <Form.Text className="text-muted">
                        Password must be at least 8 characters long.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="tel_num"
                        value={formData.tel_num}
                        onChange={handleChange}
                        placeholder="Enter 10-digit phone number"
                        required
                      />
                      <Form.Text className="text-muted">
                        Phone number must be 10 digits.
                      </Form.Text>
                      </Form.Group>
                  </Col>
                </Row>
                
                <div className="mt-3 d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button variant="primary" type="submit" disabled={isLoading} className="px-4">
                    {isLoading ? 'Creating...' : 'Create Account'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Account Display Section */}
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-primary text-white py-2">
              <h4 className="mb-0">Account List</h4>
            </Card.Header>
            <Card.Body>
              <Tabs defaultActiveKey="cashiers" className="mb-3">
                <Tab eventKey="cashiers" title="Cashiers">
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Password</th>
                        <th>Phone Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.cashiers.length > 0 ? (
                        accounts.cashiers.map((cashier, index) => (
                          <tr key={cashier._id || index}>
                            <td>{index + 1}</td>
                            <td>{cashier.username || cashier.name || 'N/A'}</td>
                            <td>{cashier.email || 'N/A'}</td>
                            <td>{cashier.password || cashier.plainPassword || 'N/A'}</td>
                            <td>{cashier.tel_num || cashier.phone || cashier.phoneNumber || 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No cashier accounts found. 
                            <Button 
                              variant="link" 
                              onClick={fetchAccounts}
                              className="p-0 ms-2"
                            >
                              Refresh
                            </Button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Tab>
                <Tab eventKey="supervisors" title="Production Managers">
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Password</th>
                        <th>Phone Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.supervisors.length > 0 ? (
                        accounts.supervisors.map((supervisor, index) => (
                          <tr key={supervisor._id || index}>
                            <td>{index + 1}</td>
                            <td>{supervisor.username || supervisor.name || 'N/A'}</td>
                            <td>{supervisor.email || 'N/A'}</td>
                            <td>{supervisor.password || supervisor.plainPassword || 'N/A'}</td>
                            <td>{supervisor.tel_num || supervisor.phone || supervisor.phoneNumber || 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No production manager accounts found. 
                            <Button 
                              variant="link" 
                              onClick={fetchAccounts}
                              className="p-0 ms-2"
                            >
                              Refresh
                            </Button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Tab>
              </Tabs>
              <div className="d-flex justify-content-end">
                <Button 
                  variant="outline-primary" 
                  className="mt-2"
                  onClick={fetchAccounts}
                >
                  Refresh Account List
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateAccount;