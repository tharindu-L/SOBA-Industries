import { Alert, Badge, Button, Form, Modal, Spinner, Table, Card, Row, Col, ButtonGroup, InputGroup, Container } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { ArrowClockwise, FunnelFill } from 'react-bootstrap-icons';

const styles = {
  pageContainer: {
    maxWidth: '98%',
    width: '98%',
    margin: '0 auto',
    padding: '1rem 0.5rem'
  },
  tableContainer: {
    maxWidth: '100%',
    overflowX: 'auto'
  },
  wideTable: {
    minWidth: '1200px', 
    width: '100%'
  },
  itemsList: {
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },
  itemRow: {
    padding: '4px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  itemName: {
    fontWeight: '500'
  },
  itemDetails: {
    color: '#666',
    fontSize: '0.9rem'
  },
  cardBody: {
    padding: '0.75rem' // Reduce card body padding to match AdminQuotations.jsx
  },
  descriptionCell: {
    maxWidth: '150px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    cursor: 'help'
  }
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  // Add new state for filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/order/all_order');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update order status
  const updateOrderStatus = async () => {
    if (!currentOrder || !newStatus) return;

    try {
      setUpdating(true);
      setError(null); // Clear any previous errors
      
      // Create the request body with multiple formats to handle different API expectations
      const requestBody = JSON.stringify({
        orderId: currentOrder.order_id,
        status: newStatus,
        // Include alternative property names that the API might expect
        order_id: currentOrder.order_id,
        new_status: newStatus
      });
      
      // Try the correct endpoint
      const endpoint = 'http://localhost:4000/api/order/all_order_update'; // Using the original endpoint name
      
      console.log(`Trying to update order status at ${endpoint} with:`, JSON.parse(requestBody));
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      // Handle the response
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update order status');
        } else {
          const textResponse = await response.text();
          console.error('Non-JSON error response:', textResponse);
          throw new Error(`Server error (${response.status}): Please check the server logs`);
        }
      }

      // Update the local state with the new status
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.order_id === currentOrder.order_id 
            ? { ...order, current_status: newStatus } 
            : order
        )
      );
      
      // Show success message or feedback
      alert(`Order #${currentOrder.order_id} status updated to ${newStatus}`);
      setShowModal(false);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(`Failed to update order status: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'processing':
        return <Badge bg="warning">Processing</Badge>;
      case 'shipped':
        return <Badge bg="primary">Shipped</Badge>;
      case 'delivered':
        return <Badge bg="success">Delivered</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  // Payment status badge
  const PaymentBadge = ({ status }) => {
    switch (status) {
      case 'paid':
        return <Badge bg="success">Paid</Badge>;
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'failed':
        return <Badge bg="danger">Failed</Badge>;
      case 'refunded':
        return <Badge bg="info">Refunded</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  // Payment method badge
  const PaymentMethodBadge = ({ method }) => {
    switch (method) {
      case 'full':
        return <Badge bg="primary">Full Payment</Badge>;
      case 'advance':
        return <Badge bg="info">Advance Payment</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  // Filter orders based on selected filters and search query
  const getFilteredOrders = () => {
    return orders.filter(order => {
      // Status filter
      if (statusFilter !== 'all' && order.current_status !== statusFilter) {
        return false;
      }
      
      // Payment filter
      if (paymentFilter !== 'all' && order.payment_status !== paymentFilter) {
        return false;
      }
      
      // Search query (check order_id or customer_id)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const orderId = order.order_id.toString().toLowerCase();
        const customerId = (order.customer_id || '').toString().toLowerCase();
        
        if (!orderId.includes(query) && !customerId.includes(query)) {
          return false;
        }
      }
      
      return true;
    });
  };

  const filteredOrders = getFilteredOrders();
  
  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('all');
    setPaymentFilter('all');
    setSearchQuery('');
  };

  return (
    <Container fluid className="py-6" style={{...styles.pageContainer, marginLeft: '75px'}} >
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">Standard Order Management</h2>
            <div>
              <Button 
                variant="outline-light" 
                size="sm"
                onClick={fetchOrders}
                disabled={loading}
                className="d-flex align-items-center"
              >
                <ArrowClockwise className="me-1" />
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  'Refresh Orders'
                )}
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body style={styles.cardBody}>
          {/* Filter card */}
          <Card className="mb-4 shadow-sm">
            <Card.Header style={{backgroundColor: '#1E90FF'}}>
              <h5 className="mb-0 text-white">
              <FunnelFill className="me-2" />
              Filter Orders</h5>
            </Card.Header>
            <Card.Body style={styles.cardBody}>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Status Filter</Form.Label>
                    <Form.Select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Payment Filter</Form.Label>
                    <Form.Select 
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                    >
                      <option value="all">All Payment Statuses</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Search by Order/Customer ID</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Enter order or customer ID"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <Button 
                          variant="outline-secondary"
                          onClick={() => setSearchQuery('')}
                        >
                          Clear
                        </Button>
                      )}
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <small className="text-muted">
                    Showing {filteredOrders.length} of {orders.length} orders
                  </small>
                </div>
                <div>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={clearFilters}
                    disabled={statusFilter === 'all' && paymentFilter === 'all' && !searchQuery}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Error handling */}
          {error && (
            <Alert variant="danger" className="my-4">
              Error: {error}
            </Alert>
          )}
          
          {/* Loading state */}
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p>Loading orders...</p>
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <Table striped bordered hover responsive style={styles.wideTable} className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Order ID</th>
                    <th>Customer ID</th>
                    <th>Order Date</th>
                    <th>Total Amount</th>
                    <th>Payment Status</th>
                    <th>Payment Method</th>
                    <th>Amount Paid</th>
                    <th>Status</th>
                    <th>Items</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.order_id}>
                      <td>{order.order_id}</td>
                      <td>{order.customer_id}</td>
                      <td>{new Date(order.order_date).toLocaleString()}</td>
                      <td>LKR {order.total_amount}</td>
                      <td><PaymentBadge status={order.payment_status} /></td>
                      <td><PaymentMethodBadge method={order.payment_method} /></td>
                      <td>LKR {order.amount_paid}</td>
                      <td><StatusBadge status={order.current_status} /></td>
                      <td>
                      <ul style={styles.itemsList}>
                          {order.items.map(item => (
                            <li key={item.order_item_id} style={styles.itemRow}>
                              <div style={styles.itemName}>
                                {item.product_name || `Product #${item.product_id}`}
                              </div>
                              <div style={styles.itemDetails}>
                                Qty: {item.quantity} × LKR {item.unit_price} = LKR {(item.quantity * item.unit_price).toFixed(2)}
                              </div>
                            </li>
                        ))}
                      </ul>
                      </td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => {
                            setCurrentOrder(order);
                            setNewStatus(order.current_status);
                            setShowModal(true);
                          }}
                        >
                          Update Status
                        </Button>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan="10" className="text-center py-4">
                        {orders.length === 0 ? (
                          "No orders found in the system"
                        ) : (
                          "No orders match the selected filters"
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Status Update Modal with updated styling */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        backdrop="static"
        size="lg"
        style={{marginLeft:'145px'}}
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Update Order Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Card className="mb-4 border-light">
              <Card.Header style={{backgroundColor:'#1E90FF'}}>
                <h5 className="mb-0 text-white">Order Information</h5>
              </Card.Header>
              <Card.Body style={styles.cardBody}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Status</Form.Label>
                  <Form.Control 
                    plaintext 
                    readOnly 
                    value={currentOrder?.current_status} 
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>New Status</Form.Label>
                  <Form.Select 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={updateOrderStatus}
            disabled={updating || !newStatus || newStatus === currentOrder?.current_status}
          >
            {updating ? (
              <>
                <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" />
                {' Updating...'}
              </>
            ) : 'Update Status'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
        .table-responsive {
          overflow-x: auto;
        }
      `}</style>
    </Container>
  );
};
export default OrderManagement;