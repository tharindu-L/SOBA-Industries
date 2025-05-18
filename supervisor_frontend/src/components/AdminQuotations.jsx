import { Alert, Badge, Button, Card, Col, Container, Dropdown, Form, Modal, Row, Spinner, Table, Tooltip, OverlayTrigger } from 'react-bootstrap';
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
  },
  descriptionCell: {
    maxWidth: '150px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    cursor: 'help'
  }
};

const AdminQuotations = () => {
  const [orders, setOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [materialItems, setMaterialItems] = useState([]);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [status, setStatus] = useState('pending');
  const [stockErrors, setStockErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('customerId');
  const [sortDirection, setSortDirection] = useState('asc');
  const [successMessage, setSuccessMessage] = useState(null);
  const [invoiceData, setInvoiceData] = useState({});
  const [refreshInterval, setRefreshInterval] = useState(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch regular custom orders
      const response = await fetch('http://localhost:4000/api/order/all_custom_order', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache' // Prevent caching
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log("Custom orders received:", data.orders ? data.orders.slice(0, 2) : "No orders");
          setOrders(data.orders || []);
        }
      } else {
        console.error("Failed to fetch customer custom orders:", response.status);
      }
      
      // Fetch invoices for these orders to get customer approval status
      await fetchInvoicesForOrders();
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Network error while fetching orders. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch invoices for orders
  const fetchInvoicesForOrders = async () => {
    try {
      console.log("Fetching invoice data...");
      
      // Use a timestamp to bust cache completely
      const timestamp = new Date().getTime();
      const response = await fetch(`http://localhost:4000/api/quotation/get_all?t=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        // Important: Disable caching at fetch level
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Raw response data:", data);
      
      if (data.success) {
        console.log("Received invoice data:", data.invoices);
        
        // Create a map of order IDs to invoice data with their approval status
        const invoiceMap = {};
        data.invoices.forEach(invoice => {
          console.log(`Invoice ID ${invoice.invoice_id} for order ${invoice.quotation_id}:`, invoice);
          console.log(`Approval status: ${invoice.customer_approval_status}`);
          
          invoiceMap[invoice.quotation_id] = {
            invoiceId: invoice.invoice_id,
            approvalStatus: invoice.customer_approval_status || 'pending'
          };
        });
        
        console.log("Final invoice map:", invoiceMap);
        setInvoiceData(invoiceMap);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  useEffect(() => {
    console.log("Component mounted - fetching initial data");
    fetchOrders();
    
    // Set up an interval to refresh data every 10 seconds
    const interval = setInterval(() => {
      console.log("Auto-refresh triggered");
      fetchInvoicesForOrders(); // Only refresh invoice data to reduce load
    }, 10000); // 10 seconds refresh interval
    
    setRefreshInterval(interval);
    
    // Clear interval on component unmount
    return () => {
      console.log("Component unmounting - clearing interval");
      clearInterval(interval); // Use the interval directly, not the state which might be outdated
    };
  }, []); // Empty dependency array ensures this only runs once on mount

  // Fetch materials function with better error handling and retry capability
  const fetchMaterials = async (retryCount = 0) => {
    setError(null);
    try {
      console.log('Fetching materials...');
      
      // Try multiple endpoints to get materials (for redundancy)
      const endpoints = [
        'http://localhost:4000/api/material/get_all', 
        'http://localhost:4000/api/supervisors/materials',
        'http://localhost:4000/api/material/get'
      ];
      
      let response = null;
      let data = null;
      let success = false;
      
      // Try each endpoint until one succeeds
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          response = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            cache: 'no-store'
          });
          
          if (response.ok) {
            data = await response.json();
            if (data.success && data.materials && data.materials.length > 0) {
              console.log(`Successfully fetched ${data.materials.length} materials from ${endpoint}`);
              success = true;
              break;
            }
          }
        } catch (endpointError) {
          console.warn(`Error with endpoint ${endpoint}:`, endpointError);
        }
      }
      
      if (success) {
        console.log('Material data:', data.materials.slice(0, 2)); // Log first two materials for debugging
        setMaterials(data.materials);
        
        // Initialize with the first material
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
      } else if (retryCount < 3) {
        // Retry up to 3 times with exponential backoff
        console.log(`Retrying fetchMaterials (attempt ${retryCount + 1})...`);
        setTimeout(() => {
          fetchMaterials(retryCount + 1);
        }, 1000 * Math.pow(2, retryCount)); // 1s, 2s, 4s backoff
      } else {
        throw new Error('Failed to fetch materials from any endpoint');
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      setError('Failed to fetch materials. Please try again later.');
    }
  };

  // Handle update button click
  const handleUpdateClick = (order) => {
    setCurrentOrder(order);
    setStatus(order.status || 'pending');
    setServiceCharge(0); // Reset service charge when opening modal
    setMaterialItems([]); // Reset material items
    setStockErrors({});
    setError(null);
    setShowModal(true);
    
    // Always fetch materials regardless of status
    fetchMaterials();
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

  const validateOrderUpdate = () => {
    if (status === 'in_progress') {
      // Check if there are any stock errors
      if (Object.keys(stockErrors).length > 0) {
        setError('Please correct the quantities that exceed available stock');
        return false;
      }
      
      // Validate materials selection
      if (materialItems.length === 0) {
        setError('Please add at least one material for approved orders');
        return false;
      }
      
      // Check for zero quantities
      const hasZeroQuantity = materialItems.some(item => !item.quantity || item.quantity <= 0);
      if (hasZeroQuantity) {
        setError('Material quantities must be greater than zero');
        return false; 
      }
    }
    
    // If status is becoming cancelled, show confirmation
    if (status === 'cancelled') {
      setShowConfirmModal(true);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    // Validate before submission
    if (!validateOrderUpdate()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const endpoint = 'http://localhost:4000/api/order/status';
      const requestBody = {
        orderId: currentOrder.orderId,
        status
      };

      console.log("Updating order:", requestBody);

      // Update order status
      const statusResponse = await fetch(endpoint, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`Status response code: ${statusResponse.status}`);
      const responseText = await statusResponse.text();
      console.log(`Response text: ${responseText}`);
      
      const statusData = responseText ? JSON.parse(responseText) : {};
      if (!statusResponse.ok) {
        throw new Error(`HTTP error! Status: ${statusResponse.status}. Details: ${responseText}`);
      }

      if (!statusData.success) {
        throw new Error(statusData.message || 'Failed to update order status');
      }

      // Only proceed with invoice creation and stock reduction if status is in_progress
      if (status === 'in_progress') {
        // Prepare materials data with all required fields
        const materialsData = materialItems.map(item => {
          const material = materials.find(m => m.item_id === item.material_id);
          if (!material) {
            throw new Error(`Material not found for ID: ${item.material_id}`);
          };
          
          return {
            material_id: item.material_id,
            material_name: material.item_name,
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

        if (!invoiceResponse.ok) {
          const errorText = await invoiceResponse.text();
          throw new Error(`HTTP error creating invoice! Status: ${invoiceResponse.status}. Details: ${errorText}`);
        }

        const invoiceData = await invoiceResponse.json();
        if (!invoiceData.success) {
          throw new Error(invoiceData.message || 'Failed to create invoice');
        }

        // Then reduce the stock
        await reduceMaterialStock(materialItems);
      }

      // After successful status update
      if (statusResponse.ok) {
        // Clear isSubmitting state first
        setIsSubmitting(false);
        
        // Update the local orders state immediately with the new status
        const updatedOrders = orders.map(order => {
          if (order.orderId === currentOrder.orderId) {
            console.log(`Updating order ${order.orderId} status from ${order.status} to ${status}`);
            
            return {
              ...order,
              status: status
            };
          }
          return order;
        });
        
        // Set the updated orders in state to trigger UI refresh
        setOrders(updatedOrders);
        
        // Show success message
        setSuccessMessage(`Order #${currentOrder.orderId} has been successfully ${status === 'in_progress' ? 'approved' : status}`);
        
        // Close modal before further processing
        handleCloseModal();
        
        // Fetch invoices in the background
        fetchInvoicesForOrders();
        
        // Clear success message after a delay
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error.message || 'An error occurred during submission. Please try again.');
    } finally {
      // Make sure isSubmitting is false in all cases
      setIsSubmitting(false);
    }
  };

  const handleCancelConfirmation = async () => {
    setShowConfirmModal(false);
    await handleSubmit();
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
        
        if (newQuantity < 0) {
          throw new Error(`Not enough stock available for ${material.item_name}`);
        }
        
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

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(`Error updating stock for: ${material.item_name}`);
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

  const removeMaterialItem = (index) => {
    if (materialItems.length <= 1) return;
    
    const updatedItems = materialItems.filter((_, i) => i !== index);
    setMaterialItems(updatedItems);
    
    // Update error states
    setStockErrors(prev => {
      const newErrors = {...prev};
      delete newErrors[index];
      // Reindex the errors if needed
      const reindexedErrors = {};
      Object.keys(newErrors).forEach(key => {
        const keyNum = parseInt(key);
        if (keyNum > index) {
          reindexedErrors[keyNum - 1] = newErrors[key];
        } else {
          reindexedErrors[key] = newErrors[key];
        }
      });
      return reindexedErrors;
    });
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    (order.description && order.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.customerId && order.customerId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.orderId && order.orderId.toString().includes(searchTerm.toLowerCase())) ||
    (order.status && order.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortField === 'wantDate') {
      // Debug the sort field values
      console.log(`Sorting by wantDate: ${a.orderId}=${a.wantDate} vs ${b.orderId}=${b.wantDate}`);
      
      // Handle null or undefined dates
      if (!a.wantDate && !b.wantDate) return 0;
      if (!a.wantDate) return sortDirection === 'asc' ? 1 : -1;
      if (!b.wantDate) return sortDirection === 'asc' ? -1 : 1;
      
      // Compare dates - ensure they're Date objects
      const dateA = new Date(a.wantDate);
      const dateB = new Date(b.wantDate);
      
      return sortDirection === 'asc' 
        ? dateA - dateB
        : dateB - dateA;
    }
    
    if (sortField === 'createdAt') {
      return sortDirection === 'asc' 
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    }

    // Special handling for orderId (as numbers, not strings)
    if (sortField === 'orderId') {
      const idA = parseInt(a.orderId) || 0;
      const idB = parseInt(b.orderId) || 0;
      return sortDirection === 'asc' ? idA - idB : idB - idA;
    }

    // Handle regular fields
    if (!a[sortField]) return sortDirection === 'asc' ? 1 : -1;
    if (!b[sortField]) return sortDirection === 'asc' ? -1 : 1;

    if (a[sortField].toLowerCase && b[sortField].toLowerCase) {
      return sortDirection === 'asc'
        ? a[sortField].toLowerCase().localeCompare(b[sortField].toLowerCase())
        : b[sortField].toLowerCase().localeCompare(a[sortField].toLowerCase());
    }

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

  // Render customer approval badge
  const renderApprovalBadge = (orderId) => {
    const invoiceInfo = invoiceData[orderId];
    
    if (!invoiceInfo || !invoiceInfo.approvalStatus) {
      return (
        <Badge bg="secondary">
          Not Required
        </Badge>
      );
    }

    switch (invoiceInfo.approvalStatus) {
      case 'approved':
        return (
          <Badge bg="success">
            <CheckCircle className="me-1" /> Approved
          </Badge>
        );
      
      case 'cancelled':
        return (
          <Badge bg="danger">
            <XCircle className="me-1" /> Cancelled
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

  // Manual refresh for invoice approvals
  const handleRefreshApprovals = () => {
    fetchInvoicesForOrders();
  };

  // Render description with tooltip
  const renderDescription = (description, special_notes) => {
    let fullText = description || '';
    
    if (special_notes) {
      fullText = fullText ? `${fullText}\n\nSpecial Notes: ${special_notes}` : `Special Notes: ${special_notes}`;
    }
    
    if (!fullText) return 'Not specified';
    
    if (fullText.length <= 30) {
      return fullText;
    }
    
    return (
      <OverlayTrigger
        placement="right"
        overlay={
          <Tooltip id={`tooltip-description-${Math.random()}`} style={{maxWidth: '400px'}}>
            <div style={{whiteSpace: 'pre-wrap', textAlign: 'left'}}>{fullText}</div>
          </Tooltip>
        }
      >
        <div style={styles.descriptionCell}>
          {fullText}
        </div>
      </OverlayTrigger>
    );
  };

  return (
    <Container fluid className="py-4" style={styles.pageContainer} >
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">Job List Management</h2>
            <div>
              <Button 
                variant="outline-light" 
                size="sm" 
                className="me-2"
                onClick={handleRefreshApprovals}
                title="Refresh customer approvals"
              >
                <i className="bi bi-arrow-clockwise"></i> Refresh Approvals
              </Button>
              <Button 
                variant="outline-light" 
                size="sm"
                onClick={fetchOrders}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  'Refresh All'
                )}
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body style={styles.cardBody}>
          {successMessage && (
            <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
              <CheckCircle className="me-2" /> {successMessage}
            </Alert>
          )}
          
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <XCircle className="me-2" /> {error}
            </Alert>
          )}
          
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
            <Col md={6} className="text-end">
              <Badge bg="info">Total Jobs: {sortedOrders.length}</Badge>
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
                    <th onClick={() => handleSort('wantDate')} className="cursor-pointer">
                      Due Date
                      {sortField === 'wantDate' && (
                        <span className="ms-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
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
                    <th>Customer Approval</th>
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
                        <td>{renderDescription(order.description, order.special_notes)}</td>
                        <td>{order.quantity}</td>
                        <td>
                          {order.wantDate ? (
                            <span className={
                              new Date(order.wantDate) < new Date() 
                                ? 'text-danger fw-bold d-flex align-items-center' 
                                : 'd-flex align-items-center'
                            }>
                              {new Date(order.wantDate).toLocaleDateString()}
                              {new Date(order.wantDate) < new Date() && (
                                <span className="ms-2 badge bg-danger">Overdue</span>
                              )}
                            </span>
                          ) : 'Not specified'}
                        </td>
                        <td>
                          {order.designFiles && order.designFiles.length > 0 ? (
                            <a 
                              href={`http://localhost:4000${order.designFiles[0].startsWith('/') ? '' : '/images/'}${order.designFiles[0]}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-secondary"
                            >
                              View File
                            </a>
                          ) : 'No files'}
                        </td>
                        <td>{new Date(order.createdAt).toLocaleString()}</td>
                        <td>{renderStatusBadge(order.status)}</td>
                        <td>
                          {renderApprovalBadge(order.orderId)}
                          {order.status === 'in_progress' && !invoiceData[order.orderId] && (
                            <div className="mt-1">
                              <small className="text-muted">No invoice found</small>
                            </div>
                          )}
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleUpdateClick(order)}
                            disabled={order.status === 'completed' || order.status === 'cancelled' || 
                                     (invoiceData[order.orderId]?.approvalStatus === 'cancelled')}
                          >
                            Update
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className="text-center py-4">
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
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {isSubmitting ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Processing...</p>
            </div>
          ) : (
            <Form>
              <Form.Group controlId="status" className="mb-4">
                <Form.Label>Update Status</Form.Label>
                <div className="d-flex flex-wrap">
                  {statusOptions.map(option => (
                    <div key={option} className="form-check form-check-inline me-3 mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="statusOptions"
                        id={`status${option}`}
                        value={option}
                        checked={status === option}
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={
                          // Prevent changes to completed/cancelled orders
                          (currentOrder && (currentOrder.status === 'completed' || currentOrder.status === 'cancelled')) ||
                          // Prevent status changes that make no sense (e.g., from in_progress to pending)
                          (currentOrder && currentOrder.status === 'in_progress' && option === 'pending')
                        }
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
                                    onClick={() => removeMaterialItem(index)}
                                    disabled={materialItems.length <= 1}
                                    title="Remove item"
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
          <Button variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant={status === 'cancelled' ? "danger" : "primary"}
            onClick={handleSubmit}
            disabled={
              isSubmitting || 
              (status === 'in_progress' && Object.keys(stockErrors).length > 0) || 
              (status === 'in_progress' && materialItems.length === 0) ||
              // Prevent updates to already completed/cancelled orders
              (currentOrder && (currentOrder.status === 'completed' || currentOrder.status === 'cancelled'))
            }
          >
            {isSubmitting ? (
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

      {/* Confirmation Modal for Cancellation */}
      <Modal 
        show={showConfirmModal} 
        onHide={() => setShowConfirmModal(false)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Order Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to cancel Order #{currentOrder?.orderId}? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            No, Keep Order
          </Button>
          <Button variant="danger" onClick={handleCancelConfirmation}>
            Yes, Cancel Order
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