import { Alert, Badge, Button, Card, Col, Container, Dropdown, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { CheckCircle, Clock, FileEarmarkCheck, Plus, Search, Trash, XCircle } from 'react-bootstrap-icons';
import React, { useEffect, useState } from 'react';

const statusOptions = ['pending', 'in_progress', 'completed', 'cancelled'];

const styles = {
  pageContainer: {
    maxWidth: '98%',     // Increase to 98% of viewport width
    width: '98%',        // Set explicit width
    margin: '0 auto',    // Center the container
    padding: '1rem 0.5rem' // Reduce padding to maximize space
  },
  tableContainer: {
    maxWidth: '100%',
    overflowX: 'auto'
  },
  wideTable: {
    minWidth: '1200px', // Increase this value to make the table wider
    width: '100%'
  },
  cardBody: {
    padding: '0.75rem' // Reduce card body padding
  }
};

const AdminQuotations = () => {
  const [orders, setOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [materialItems, setMaterialItems] = useState([]);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [status, setStatus] = useState('pending');
  const [stockErrors, setStockErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('customerId');
  const [sortDirection, setSortDirection] = useState('asc');

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:4000/api/order/all_custom_order', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders || []);
        } else {
          setError(data.message || 'Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Network error while fetching orders');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Fetch Materials
  const fetchMaterials = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/material/get_all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMaterials(data.materials);
        // Initialize with empty array if no materials
        if (data.materials.length > 0) {
          setMaterialItems([
            {
              material_name: data.materials[0].item_name,
              quantity: 1,
              unit_price: parseFloat(data.materials[0].unit_price),
              material_id: data.materials[0].item_id,
              available_qty: data.materials[0].available_qty
            }
          ]);
        } else {
          setMaterialItems([]);
        }
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      setError('Failed to fetch materials');
    }
  };

  const handleUpdateClick = (order) => {
    setCurrentOrder(order);
    setStatus(order.status || 'pending');
    setServiceCharge(0); // Reset service charge when opening modal
    setShowModal(true);
    if (order.status === 'in_progress' || status === 'in_progress') {
      fetchMaterials();
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setMaterialItems([]);
    setStockErrors({});
    setError(null);
  };

  const handleMaterialChange = (index, event) => {
    const { name, value } = event.target;
    const updatedItems = [...materialItems];
    
    if (name === 'material_name') {
      const selectedMaterial = materials.find(m => m.item_name === value);
      if (selectedMaterial) {
        updatedItems[index] = {
          ...updatedItems[index],
          material_name: selectedMaterial.item_name,
          material_id: selectedMaterial.item_id,
          unit_price: parseFloat(selectedMaterial.unit_price),
          available_qty: selectedMaterial.available_qty
        };
      }
    } else {
      updatedItems[index][name] = name === 'quantity' || name === 'unit_price' ? 
        parseFloat(value) || 0 : value;
    }
    
    setMaterialItems(updatedItems);

    // Check stock when quantity changes or material changes
    if (name === 'quantity' || name === 'material_name') {
      checkStockAvailability(
        index, 
        name === 'quantity' ? parseFloat(value) || 0 : updatedItems[index].quantity
      );
    }
  };

  const checkStockAvailability = (index, requestedQuantity) => {
    const material = materials.find(m => m.item_id === materialItems[index].material_id);
    if (material && requestedQuantity > material.available_qty) {
      setStockErrors(prev => ({
        ...prev,
        [index]: `Only ${material.available_qty} available in stock`
      }));
    } else {
      setStockErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[index];
        return newErrors;
      });
    }
  };

  const calculateTotalAmount = () => {
    const materialsTotal = materialItems.reduce((total, item) => 
      total + (item.quantity * item.unit_price), 0);
    return materialsTotal + parseFloat(serviceCharge || 0);
  };

  const handleSubmit = async () => {
    // Check if there are any stock errors before submitting (only for in_progress status)
    if (status === 'in_progress' && Object.keys(stockErrors).length > 0) {
      setError('Please correct the quantities that exceed available stock');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update the order status
      const statusResponse = await fetch('http://localhost:4000/api/order/status', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          orderId: currentOrder.orderId,
          status 
        }),
      });

      const statusData = await statusResponse.json();
      if (!statusData.success) {
        throw new Error('Failed to update order status');
      }

      // Only proceed with invoice creation and stock reduction if status is in_progress
      if (status === 'in_progress') {
        // Validate materials are selected
        if (materialItems.length === 0) {
          throw new Error('Please add at least one material for approved orders');
        }

        // Prepare materials data with all required fields
        const materialsData = materialItems.map(item => {
          if (!item.material_name) {
            // Find the material name if it's missing
            const material = materials.find(m => m.item_id === item.material_id);
            if (material) {
              item.material_name = material.item_name;
            } else {
              throw new Error(`Material not found for ID: ${item.material_id}`);
            }
          }
          
          return {
            material_id: item.material_id,
            material_name: item.material_name,
            quantity: item.quantity,
            unit_price: item.unit_price
          };
        });

        // Create the invoice
        const invoiceResponse = await fetch('http://localhost:4000/api/quotation/invoice_create', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            quotationId: currentOrder.orderId,
            invoiceAmount: calculateTotalAmount(),
            materials: materialsData,
            serviceCharge: parseFloat(serviceCharge || 0)
          }),
        });

        const invoiceData = await invoiceResponse.json();
        if (!invoiceData.success) {
          throw new Error(invoiceData.message || 'Failed to create invoice');
        }

        // Then reduce the stock
        await reduceMaterialStock(materialItems);
      }

      // Refresh orders list
      const refreshResponse = await fetch('http://localhost:4000/api/order/all_custom_order', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const refreshData = await refreshResponse.json();
      if (refreshData.success) {
        setOrders(refreshData.orders);
      }

      handleCloseModal();
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error.message || 'An error occurred during submission');
    } finally {
      setIsLoading(false);
    }
  };

  const reduceMaterialStock = async (items) => {
    try {
      const updateRequests = items.map(async (item) => {
        const material = materials.find(m => m.item_id === item.material_id);
        if (!material) {
          console.error(`Material not found for ID: ${item.material_id}`);
          return;
        }

        const newQuantity = material.available_qty - item.quantity;
        
        const response = await fetch('http://localhost:4000/api/material/update_all', {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            itemId: material.item_id,
            availableQty: newQuantity,
          }),
        });

        const data = await response.json();
        if (!data.success) {
          console.error(`Error updating stock for: ${item.material_name}`);
        }
      });

      await Promise.all(updateRequests);
    } catch (error) {
      console.error('Error reducing material stock:', error);
      throw error;
    }
  };

  const addNewMaterialItem = () => {
    if (materials.length === 0) return;
    
    setMaterialItems([...materialItems, {
      material_name: materials[0].item_name,
      quantity: 1,
      unit_price: parseFloat(materials[0].unit_price),
      material_id: materials[0].item_id,
      available_qty: materials[0].available_qty
    }]);
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderId.toString().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle sort change
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Status badge renderer
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Badge bg="success">
            <FileEarmarkCheck className="me-1" /> Completed
          </Badge>
        );

      case 'cancelled':
        return (
          <Badge bg="danger">
            <XCircle className="me-1" /> Cancelled
          </Badge>
        );

      case 'in_progress':
        return (
          <Badge bg="primary">
            <Clock className="me-1" /> Approved
          </Badge>
        );

      default:
        return (
          <Badge bg="warning" text="dark">
            <Clock className="me-1" /> Pending
          </Badge>
        );
    }
  };

  return (
    <Container fluid className="py-4" style={styles.pageContainer} >
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">Order Management</h2>
          </div>
        </Card.Header>
        <Card.Body style={styles.cardBody}>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Row className="mb-4">
            <Col md={6}>
              <div className="input-group">
                <span className="input-group-text">
                  <Search />
                </span>
                <Form.Control
                  type="text"
                  placeholder="Search by description, customer ID, order ID or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Col>
          </Row>

          {isLoading && !showModal ? (
            <div className="text-center py-5" >
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading orders...</p>
            </div>
          ) : (
            <div className="table-responsive" style={styles.tableContainer}>
              <Table striped hover className="align-middle" style={styles.wideTable}>
                <thead className="table-light">
                  <tr>
                    <th onClick={() => handleSort('orderId')} className="cursor-pointer">
                      Order ID
                      {sortField === 'orderId' && (
                        <span className="ms-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th onClick={() => handleSort('customerId')} className="cursor-pointer">
                      Customer ID
                      {sortField === 'customerId' && (
                        <span className="ms-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Special Notes</th>
                    <th>Design Files</th>
                    <th onClick={() => handleSort('createdAt')} className="cursor-pointer">
                      Created At
                      {sortField === 'createdAt' && (
                        <span className="ms-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th onClick={() => handleSort('status')} className="cursor-pointer">
                      Status
                      {sortField === 'status' && (
                        <span className="ms-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOrders.length > 0 ? (
                    sortedOrders.map((order) => (
                      <tr key={order.orderId}>
                        <td>{order.orderId}</td>
                        <td>{order.customerId}</td>
                        <td>{order.category || 'Not specified'}</td>
                        <td>{order.description}</td>
                        <td>{order.quantity}</td>
                        <td>
                          {order.specialNotes ? (
                            order.specialNotes.length > 20 
                              ? `${order.specialNotes.substring(0, 20)}...` 
                              : order.specialNotes
                          ) : '-'}
                        </td>
                        <td>
                          {order.designFiles && order.designFiles.length > 0 ? (
                            <a 
                              href={`http://localhost:4000/images/${order.designFiles[0]}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              View File
                            </a>
                          ) : 'No files'}
                        </td>
                        <td>{new Date(order.createdAt).toLocaleString()}</td>
                        <td>{renderStatusBadge(order.status)}</td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleUpdateClick(order)}
                          >
                            Update
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        {searchTerm 
                          ? "No orders match your search criteria" 
                          : "No orders available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal 
        show={showModal} 
        onHide={handleCloseModal} 
        size="lg" 
        backdrop="static"
        aria-labelledby="order-update-modal"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title id="order-update-modal">
            {currentOrder && (
              <>Update Order #{currentOrder.orderId}</>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {isLoading && showModal ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Processing...</p>
            </div>
          ) : (
            <Form>
              <Form.Group controlId="status" className="mb-4">
                <Form.Label>Update Status</Form.Label>
                <div className="d-flex">
                  {statusOptions.map(option => (
                    <div key={option} className="form-check form-check-inline me-3">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="statusOptions"
                        id={`status${option}`}
                        value={option}
                        checked={status === option}
                        onChange={(e) => setStatus(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor={`status${option}`}>
                        {renderStatusBadge(option)}
                      </label>
                    </div>
                  ))}
                </div>
              </Form.Group>

              {status === 'in_progress' && (
                <>
                  <Card className="mb-4 border-light">
                    <Card.Header className="bg-light">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Materials</h5>
                        <Button 
                          variant="outline-success"
                          size="sm"
                          onClick={addNewMaterialItem}
                          disabled={materials.length === 0}
                        >
                          <Plus className="me-1" /> Add Material
                        </Button>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      {materials.length === 0 ? (
                        <Alert variant="info">
                          No materials available. Please add materials to the inventory first.
                        </Alert>
                      ) : (
                        <>
                          {materialItems.map((material, index) => (
                            <div key={index} className="mb-3 p-3 border rounded bg-light">
                              <Row className="align-items-end">
                                <Col md={4}>
                                  <Form.Group controlId={`materialName${index}`}>
                                    <Form.Label>Material</Form.Label>
                                    <Form.Select 
                                      name="material_name" 
                                      value={material.material_name} 
                                      onChange={(e) => handleMaterialChange(index, e)}
                                      className="form-select-sm"
                                    >
                                      {materials.map((mat) => (
                                        <option key={mat.item_id} value={mat.item_name}>
                                          {mat.item_name} (Stock: {mat.available_qty})
                                        </option>
                                      ))}
                                    </Form.Select>
                                  </Form.Group>
                                </Col>

                                <Col md={2}>
                                  <Form.Group controlId={`materialQuantity${index}`}>
                                    <Form.Label>Quantity</Form.Label>
                                    <Form.Control 
                                      type="number" 
                                      name="quantity" 
                                      min="1"
                                      value={material.quantity} 
                                      onChange={(e) => handleMaterialChange(index, e)}
                                      isInvalid={!!stockErrors[index]}
                                      size="sm"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                      {stockErrors[index]}
                                    </Form.Control.Feedback>
                                  </Form.Group>
                                </Col>

                                <Col md={3}>
                                  <Form.Group controlId={`materialUnitPrice${index}`}>
                                    <Form.Label>Unit Price (LKR)</Form.Label>
                                    <Form.Control 
                                      type="number" 
                                      name="unit_price" 
                                      value={material.unit_price} 
                                      onChange={(e) => handleMaterialChange(index, e)}
                                      step="0.01"
                                      size="sm"
                                    />
                                  </Form.Group>
                                </Col>

                                <Col md={2}>
                                  <Form.Group>
                                    <Form.Label>Subtotal</Form.Label>
                                    <div className="form-control-plaintext fw-bold">
                                      LKR {(material.quantity * material.unit_price).toFixed(2)}
                                    </div>
                                  </Form.Group>
                                </Col>

                                <Col md={1} className="d-flex align-items-end justify-content-end">
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => {
                                      setMaterialItems(materialItems.filter((_, i) => i !== index));
                                      setStockErrors(prev => {
                                        const newErrors = {...prev};
                                        delete newErrors[index];
                                        return newErrors;
                                      });
                                    }}
                                    disabled={materialItems.length <= 1}
                                  >
                                    <Trash />
                                  </Button>
                                </Col>
                              </Row>
                            </div>
                          ))}
                        </>
                      )}
                    </Card.Body>
                  </Card>

                  <Card className="mb-4 border-light">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">Additional Charges</h5>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <Form.Group controlId="serviceCharge">
                            <Form.Label>Service Charge (LKR)</Form.Label>
                            <Form.Control 
                              type="number" 
                              value={serviceCharge} 
                              onChange={(e) => setServiceCharge(e.target.value)}
                              step="0.01"
                              min="0"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  <div className="d-flex justify-content-end mt-4">
                    <Card className="bg-light p-2 border-0">
                      <div className="d-flex justify-content-between align-items-center px-3">
                        <h5 className="mb-0 me-3">Total Amount:</h5>
                        <h4 className="mb-0 text-primary">LKR {calculateTotalAmount().toFixed(2)}</h4>
                      </div>
                    </Card>
                  </div>
                </>
              )}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={handleCloseModal} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant={status === 'cancelled' ? "danger" : "primary"}
            onClick={handleSubmit}
            disabled={
              isLoading || 
              (status === 'in_progress' && Object.keys(stockErrors).length > 0) || 
              (status === 'in_progress' && materialItems.length === 0)
            }
          >
            {isLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                Processing...
              </>
            ) : (
              status === 'cancelled' ? 'Cancel Order' : 'Update Order'
            )}
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

export default AdminQuotations;