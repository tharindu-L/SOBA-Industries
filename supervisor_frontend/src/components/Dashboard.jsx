import { Alert, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { RefreshRounded } from '@mui/icons-material';

const Dashboard = () => {
  const [orderStats, setOrderStats] = useState({
    approved: 0,
    cancelled: 0,
    completed: 0,
    pending: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchOrderStatistics = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await axios.get('http://localhost:4000/api/order/order-stats');
      setOrderStats(response.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching order statistics:', err);
      setError('Failed to fetch order statistics. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchOrderStatistics();
  }, []);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchOrderStatistics(true);
  };

  if (loading && !refreshing) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Production Management Dashboard</h2>
        <div className="d-flex align-items-center">
          {lastUpdated && (
            <small className="text-muted me-3">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </small>
          )}
          <Button 
            variant="outline-primary" 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="d-flex align-items-center"
          >
            {refreshing ? (
              <>
                <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" className="me-1" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshRounded fontSize="small" className="me-1" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-4">
        <Col>
          <Card className="text-center h-100" bg="primary" text="white">
            <Card.Body>
              <Card.Title>Total Orders</Card.Title>
              <Card.Text style={{ fontSize: '2.5rem' }}>{orderStats.total}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={4}>
          <Card className="text-center h-100" bg="success" text="white">
            <Card.Body>
              <Card.Title>Completed Orders</Card.Title>
              <Card.Text style={{ fontSize: '2.5rem' }}>{orderStats.completed}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100" bg="warning" text="dark">
            <Card.Body>
              <Card.Title>Pending Orders</Card.Title>
              <Card.Text style={{ fontSize: '2.5rem' }}>{orderStats.pending}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100" bg="danger" text="white">
            <Card.Body>
              <Card.Title>Cancelled Orders</Card.Title>
              <Card.Text style={{ fontSize: '2.5rem' }}>{orderStats.cancelled}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6} className="mx-auto">
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Approved Orders</Card.Title>
              <Card.Text style={{ fontSize: '2.5rem', color: '#0056b3' }}>{orderStats.approved}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;