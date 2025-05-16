import { Alert, Badge, Button, Form, Modal, Spinner, Table } from 'react-bootstrap';
import { useEffect, useState } from 'react';


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
      const response = await fetch('http://localhost:4000/api/order/all_order_update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: currentOrder.order_id,
          new_status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const result = await response.json();
      
      // Update local state
      setOrders(orders.map(order => 
        order.order_id === currentOrder.order_id 
          ? { ...order, current_status: newStatus } 
          : order
      ));

      setShowModal(false);
    } catch (err) {
      setError(err.message);
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

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        Error: {error}
      </Alert>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-4">Order Management</h2>
      
      <Table striped bordered hover responsive>
        <thead>
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
          {orders.map(order => (
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
        </tbody>
      </Table>

      {/* Status Update Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Order Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
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
    </div>
  );
};

export default OrderManagement;