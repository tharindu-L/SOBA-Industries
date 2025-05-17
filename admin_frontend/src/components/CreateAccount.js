import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'cashier' // Default role
  });

  const [feedback, setFeedback] = useState({
    message: '',
    type: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.username.trim() || !formData.email.trim() || !formData.password || !formData.role) {
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
      const endpoint = formData.role === 'cashier' 
        ? 'http://localhost:4000/api/cashier/register'
        : 'http://localhost:4000/api/guides/register';
      
      const response = await axios.post(endpoint, {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

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
          role: 'cashier'
        });
      } else {
        setFeedback({
          message: response.data.message || 'Failed to create account',
          type: 'danger'
        });
      }
    } catch (error) {
      console.error('Error creating account:', error);
      setFeedback({
        message: error.response?.data?.message || 'An error occurred while creating the account',
        type: 'danger'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="p-0">
      <h2 className="mb-3">Account Management</h2>
      <Row className="justify-content-center g-0">
        <Col md={12}>
          <Card className="shadow-sm border-0">
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
                </Row>
                
                <div className="mt-3 d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button variant="primary" type="submit" disabled={isLoading} className="px-4">
                    {isLoading ? 'Creating...' : 'Create Account'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateAccount;