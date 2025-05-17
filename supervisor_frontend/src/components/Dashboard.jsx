import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshRounded, Notifications, Close } from '@mui/icons-material';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';

// Import chart components
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend
);

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
  
  // New state for low stock notifications
  const [lowStockMaterials, setLowStockMaterials] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchOrderStatistics = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await axios.get('http://localhost:4000/api/order/order-stats');
      console.log("API response:", response.data);
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

  // New function to fetch low stock materials
  const fetchLowStockMaterials = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/material/get');
      // Filter materials that are below preorder level
      const lowStock = response.data.materials.filter(
        material => parseInt(material.availableQty) <= parseInt(material.preorder_level || 10)
      );
      setLowStockMaterials(lowStock);
      console.log("Low stock materials:", lowStock);
    } catch (err) {
      console.error('Error fetching low stock materials:', err);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchOrderStatistics();
    fetchLowStockMaterials();
    
    // Set up auto-refresh every 5 minutes (300000ms)
    const intervalId = setInterval(() => {
      fetchLowStockMaterials();
    }, 300000);
    
    return () => clearInterval(intervalId); // Clean up the interval on component unmount
  }, []);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchOrderStatistics(true);
    fetchLowStockMaterials();
  };

  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Prepare chart data
  const barChartData = {
    labels: ['Total', 'Completed', 'Pending', 'Cancelled', 'Approved'],
    datasets: [
      {
        label: 'Order Statistics',
        data: [
          orderStats.total,
          orderStats.completed,
          orderStats.pending,
          orderStats.cancelled,
          orderStats.approved
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const doughnutChartData = {
    labels: ['Completed', 'Pending', 'Cancelled', 'Approved'],
    datasets: [
      {
        data: [
          orderStats.completed,
          orderStats.pending,
          orderStats.cancelled,
          orderStats.approved
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Order Statistics',
      },
    },
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
    <Container fluid className="dashboard-container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="dashboard-title">Production Management Dashboard</h2>
          {lastUpdated && (
            <p className="text-muted mb-0">
              <small>Last updated: {lastUpdated.toLocaleTimeString()}</small>
            </p>
          )}
        </div>
        <div className="d-flex align-items-center">
          {/* Notifications button with badge */}
          <div className="position-relative me-3">
            <Button 
              variant={showNotifications ? "primary" : "outline-primary"}
              className="notification-btn"
              onClick={toggleNotifications}
            >
              <Notifications />
              {lowStockMaterials.length > 0 && (
                <Badge 
                  bg="danger" 
                  className="notification-badge position-absolute"
                >
                  {lowStockMaterials.length}
                </Badge>
              )}
            </Button>
            
            {/* Notification Panel */}
            {showNotifications && (
              <Card className="notification-panel shadow">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Notifications</h5>
                  <Button variant="link" className="p-0" onClick={() => setShowNotifications(false)}>
                    <Close />
                  </Button>
                </Card.Header>
                <Card.Body className="p-0">
                  {lowStockMaterials.length === 0 ? (
                    <Alert variant="success" className="m-3">All materials are in stock!</Alert>
                  ) : (
                    <ul className="notification-list">
                      {lowStockMaterials.map(material => (
                        <li key={material.itemId} className="notification-item">
                          <div className="d-flex align-items-center">
                            <div className="notification-icon warning">
                              <WarningIconSVG />
                            </div>
                            <div className="notification-content">
                              <h6 className="mb-0">{material.itemName} is low on stock!</h6>
                              <p className="mb-0 text-muted small">
                                Current quantity: {material.availableQty} (Preorder level: {material.preorder_level || 10})
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card.Body>
                <Card.Footer className="bg-white">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    className="w-100"
                    onClick={() => window.location.href = '/list-material'}
                  >
                    View All Materials
                  </Button>
                </Card.Footer>
              </Card>
            )}
          </div>
          
          <Button 
            variant="gradient-primary" 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="refresh-button d-flex align-items-center"
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

      {/* Materials Low Stock Alert */}
      {lowStockMaterials.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <Alert.Heading>Low Stock Materials</Alert.Heading>
          <p>You have {lowStockMaterials.length} materials that are below the preorder level.</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button 
              variant="outline-warning" 
              onClick={() => window.location.href = '/materials'}
            >
              View Materials
            </Button>
          </div>
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <Card className="total-card text-center h-100 border-0 shadow">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <div className="status-indicator total-indicator mb-2"></div>
              <Card.Title className="text-primary fw-bold">Total Orders</Card.Title>
              <Card.Text className="order-count">{orderStats.total}</Card.Text>
              <Card.Text className="text-muted small">All orders in the system</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="stat-card completed-card text-center h-100 border-0 shadow-sm">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <div className="status-indicator completed-indicator mb-2"></div>
              <Card.Title className="fw-bold">Completed</Card.Title>
              <Card.Text className="order-count">{orderStats.completed}</Card.Text>
              <div className="progress w-75 mt-2">
                <div 
                  className="progress-bar bg-success" 
                  role="progressbar" 
                  style={{ width: `${orderStats.total ? (orderStats.completed / orderStats.total) * 100 : 0}%` }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card pending-card text-center h-100 border-0 shadow-sm">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <div className="status-indicator pending-indicator mb-2"></div>
              <Card.Title className="fw-bold">Pending</Card.Title>
              <Card.Text className="order-count">{orderStats.pending}</Card.Text>
              <div className="progress w-75 mt-2">
                <div 
                  className="progress-bar bg-warning" 
                  role="progressbar" 
                  style={{ width: `${orderStats.total ? (orderStats.pending / orderStats.total) * 100 : 0}%` }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card cancelled-card text-center h-100 border-0 shadow-sm">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <div className="status-indicator cancelled-indicator mb-2"></div>
              <Card.Title className="fw-bold">Cancelled</Card.Title>
              <Card.Text className="order-count">{orderStats.cancelled}</Card.Text>
              <div className="progress w-75 mt-2">
                <div 
                  className="progress-bar bg-danger" 
                  role="progressbar" 
                  style={{ width: `${orderStats.total ? (orderStats.cancelled / orderStats.total) * 100 : 0}%` }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card approved-card text-center h-100 border-0 shadow-sm">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <div className="status-indicator approved-indicator mb-2"></div>
              <Card.Title className="fw-bold">Approved</Card.Title>
              <Card.Text className="order-count">{orderStats.approved}</Card.Text>
              <div className="progress w-75 mt-2">
                <div 
                  className="progress-bar bg-primary" 
                  role="progressbar" 
                  style={{ width: `${orderStats.total ? (orderStats.approved / orderStats.total) * 100 : 0}%` }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h4 className="mb-4">Order Statistics</h4>
              <div style={{ height: '300px' }}>
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h4 className="mb-4">Order Distribution</h4>
              <div style={{ height: '300px' }} className="d-flex align-items-center justify-content-center">
                <Doughnut 
                  data={doughnutChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }} 
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add this to your component's JSX */}
      <style type="text/css">
        {`
          .dashboard-container {
            background-color: #f5f7fa;
            min-height: 100vh;
            padding: 20px;
          }
          
          .dashboard-title {
            color: #334155;
            font-weight: 600;
            font-size: 1.8rem;
            margin-bottom: 0.25rem;
          }
          
          .btn-gradient-primary {
            background: linear-gradient(135deg, #4169E1, #3F51B5);
            border: none;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          
          .refresh-button {
            border-radius: 50px;
            padding: 8px 16px;
            transition: all 0.3s ease;
          }
          
          .refresh-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }
          
          .total-card {
            background: linear-gradient(135deg, #f5f7fa, #e4e7eb);
            border-radius: 12px;
            height: 180px;
            transition: transform 0.3s ease;
          }
          
          .total-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          }
          
          .stat-card {
            border-radius: 12px;
            transition: all 0.3s ease;
            height: 160px;
          }
          
          .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          }
          
          .completed-card {
            background-color: #ebfbee;
          }
          
          .pending-card {
            background-color: #fff8e6;
          }
          
          .cancelled-card {
            background-color: #feeceb;
          }
          
          .approved-card {
            background-color: #e6f4ff;
          }
          
          .order-count {
            font-size: 2.5rem;
            font-weight: 700;
            margin: 5px 0;
            background: linear-gradient(135deg, #334155, #64748b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }
          
          .status-indicator {
            width: 40px;
            height: 4px;
            border-radius: 2px;
          }
          
          .total-indicator {
            background: linear-gradient(90deg, #4169E1, #3F51B5);
          }
          
          .completed-indicator {
            background: linear-gradient(90deg, #10B981, #059669);
          }
          
          .pending-indicator {
            background: linear-gradient(90deg, #F59E0B, #D97706);
          }
          
          .cancelled-indicator {
            background: linear-gradient(90deg, #EF4444, #DC2626);
          }
          
          .approved-indicator {
            background: linear-gradient(90deg, #3B82F6, #2563EB);
          }
          
          .progress {
            height: 5px;
            margin-top: 10px;
            background-color: rgba(0,0,0,0.05);
            border-radius: 10px;
          }
          
          @media (max-width: 768px) {
            .stat-card {
              margin-bottom: 15px;
            }
            .dashboard-title {
              font-size: 1.5rem;
            }
            .order-count {
              font-size: 1.8rem;
            }
          }

          /* New Notification Styles */
          .notification-btn {
            position: relative;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .notification-badge {
            top: -5px;
            right: -5px;
            font-size: 0.6rem;
            min-width: 18px;
            height: 18px;
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .notification-panel {
            position: absolute;
            top: 45px;
            right: 0;
            width: 320px;
            max-height: 400px;
            z-index: 1000;
            border-radius: 8px;
            border: none;
          }
          
          .notification-list {
            list-style: none;
            padding: 0;
            margin: 0;
            max-height: 300px;
            overflow-y: auto;
          }
          
          .notification-item {
            padding: 12px 15px;
            border-bottom: 1px solid rgba(0,0,0,0.05);
            transition: background-color 0.2s;
          }
          
          .notification-item:hover {
            background-color: rgba(0,0,0,0.02);
          }
          
          .notification-icon {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;
          }
          
          .notification-icon.warning {
            background-color: #fff3e0;
            color: #f57c00;
          }
          
          .notification-icon svg {
            width: 20px;
            height: 20px;
          }
          
          .notification-content {
            flex-grow: 1;
          }
        `}
      </style>
    </Container>
  );
};

// Helper component for the warning icon
const WarningIconSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 1.45l6.705 11.29A1 1 0 0 1 13.847 14H2.153a1 1 0 0 1-.858-1.51L8 1.45zM8 0a1 1 0 0 0-.866.5l-7 12A1 1 0 0 0 1 14h14a1 1 0 0 0 .866-1.5l-7-12A1 1 0 0 0 8 0zm0 8a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0V9a1 1 0 0 0-1-1zm0-3a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
  </svg>
);

export default Dashboard;