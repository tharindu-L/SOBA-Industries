import { Alert, Button, Card, Col, Container, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';

const UserInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentOption, setPaymentOption] = useState('full'); // 'full' or 'advance'
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [approvalLoading, setApprovalLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication token not found. Please login again.');
          navigate('/login');
          return;
        }
        
        console.log("Using token:", token);
        
        const response = await axios.get('http://localhost:4000/api/quotation/get_invoice', {
          headers: { 
            token: token
          },
        });
        
        console.log("API response:", response.data);

        if (response.data.success) {
          const categorizedInvoices = response.data.invoices.reduce((acc, invoice) => {
            if (!acc[invoice.invoice_id]) {
              acc[invoice.invoice_id] = {
                ...invoice,
                items: [],
              };
            }
            acc[invoice.invoice_id].items = invoice.items;
            return acc;
          }, {});

          setInvoices(Object.values(categorizedInvoices));
          setError('');
        } else {
          setError('Failed to fetch invoices');
        }
      } catch (err) {
        console.error("Fetch invoices error:", err);
        if (err.response?.status === 401) {
          setError('Session expired. Please login again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError(`Error fetching invoices: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [paymentSuccess, navigate]);

  const handlePaymentClick = (invoice) => {
    setCurrentInvoice(invoice);
    const totalDue = invoice.total_amount - invoice.paid_amount;
    setPaymentAmount(totalDue);
    setPaymentOption('full'); // Default to full payment
    setShowPaymentModal(true);
    setPaymentError('');
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentError('');
    setCardDetails({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: ''
    });
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/[^0-9]/g, '');
    if (v.length >= 3) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return value;
  };

  const handlePaymentOptionChange = (option) => {
    setPaymentOption(option);
    if (currentInvoice) {
      const totalDue = currentInvoice.total_amount - currentInvoice.paid_amount;
      if (option === 'advance') {
        setPaymentAmount(totalDue * 0.3); // 30% of total due
      } else {
        setPaymentAmount(totalDue); // Full amount
      }
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setPaymentError('');

    try {
      // Validate card details
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardName) {
        throw new Error('Please fill all card details');
      }

      if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        throw new Error('Please enter a valid 16-digit card number');
      }

      if (cardDetails.cvv.length !== 3) {
        throw new Error('Please enter a valid 3-digit CVV');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token missing. Please login again.');
      }
      
      const response = await axios.post(
        'http://localhost:4000/api/quotation/invoice_payment',
        {
          invoiceId: currentInvoice.invoice_id,
          paymentAmount: paymentAmount,
          paymentType: paymentOption // Send payment type to backend
        },
        { headers: { token } }
      );

      if (response.data.success) {
        setPaymentSuccess(true);
        setTimeout(() => {
          setShowPaymentModal(false);
          setPaymentSuccess(false);
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Payment failed');
      }
    } catch (err) {
      console.error(err);
      setPaymentError(err.message || 'Error processing payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const downloadInvoice = (invoice) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    doc.text('SOBA Industries', 10, 10);
    doc.text('123 Castle Street, Kandy', 10, 20);
    doc.text('Phone: +94 716821170', 10, 30);
    doc.text('---------------------------------', 10, 40);

    doc.text(`Invoice ID: ${invoice.invoice_id}`, 10, 50);
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 10, 60);
    doc.text('---------------------------------', 10, 70);

    doc.text('Items:', 10, 80);
    let yPosition = 90;
    invoice.items.forEach((item, index) => {
      doc.text(`${item.material_name}`, 10, yPosition);
      doc.text(`Qty: ${item.quantity}`, 80, yPosition);
      doc.text(`LKR ${item.unit_price}`, 130, yPosition);
      yPosition += 10;
    });

    doc.text('---------------------------------', 10, yPosition);
    yPosition += 10;
    doc.text(`Total Amount: LKR ${invoice.total_amount}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Paid Amount: LKR ${invoice.paid_amount}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Payment Status: ${invoice.payment_status}`, 10, yPosition);
    yPosition += 20;

    doc.text('Thank you for your purchase!', 10, yPosition);

    doc.save(`Invoice_${invoice.invoice_id}.pdf`);
  };

  const handleApproveInvoice = async (invoiceId) => {
    try {
      setApprovalLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token missing. Please login again.');
        navigate('/login');
        return;
      }
      
      const response = await axios.post(
        'http://localhost:4000/api/quotation/update_approval_status',
        {
          invoiceId,
          status: 'approved'
        },
        { headers: { token } }
      );

      if (response.data.success) {
        // Update the invoice in the local state
        setInvoices(invoices.map(invoice => 
          invoice.invoice_id === invoiceId 
            ? { ...invoice, customer_approval_status: 'approved' } 
            : invoice
        ));
      } else {
        setError('Failed to approve invoice');
      }
    } catch (err) {
      console.error(err);
      setError('Error approving invoice');
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleCancelInvoice = async (invoiceId) => {
    try {
      setApprovalLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token missing. Please login again.');
        navigate('/login');
        return;
      }
      
      const response = await axios.post(
        'http://localhost:4000/api/quotation/update_approval_status',
        {
          invoiceId,
          status: 'cancelled'
        },
        { headers: { token } }
      );

      if (response.data.success) {
        // Update the invoice in the local state
        setInvoices(invoices.map(invoice => 
          invoice.invoice_id === invoiceId 
            ? { ...invoice, customer_approval_status: 'cancelled' } 
            : invoice
        ));
      } else {
        setError('Failed to cancel invoice');
      }
    } catch (err) {
      console.error(err);
      setError('Error cancelling invoice');
    } finally {
      setApprovalLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" variant="primary" className="d-block mx-auto mt-5" />;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Your Invoices</h2>
      {invoices.length === 0 ? (
        <Alert style={{ maxWidth: '80%', marginLeft: '50px' }} variant="info">No invoices found.</Alert>
      ) : (
        invoices.map((invoice) => (
          <Card className="mb-3 shadow-sm bill-card mx-auto" style={{ maxWidth: '80%' }} key={invoice.invoice_id}>
            <Card.Body>
              <h5 className="text-center">SOBA Industries</h5>
              <p className="text-center">123 Castle Street, Kandy</p>
              <p className="text-center">Phone: +94 716821170</p>
              <hr />
              <p><strong>Invoice ID:</strong> {invoice.invoice_id}</p>
              <p><strong>Date:</strong> {new Date(invoice.created_at).toLocaleDateString()}</p>
              <hr />
              <Table size="sm" bordered>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.material_name}</td>
                      <td>{item.quantity}</td>
                      <td>LKR {item.unit_price}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <hr />
              <p><strong>Total Amount:</strong> LKR {invoice.total_amount}(With Services Charges)</p>
              <p><strong>Paid Amount:</strong> LKR {invoice.paid_amount}</p>
              <p><strong>Payment Status:</strong> {invoice.payment_status}</p>
              {invoice.customer_approval_status && (
                <p><strong>Approval Status:</strong> 
                  <span className={`ms-2 badge bg-${
                    invoice.customer_approval_status === 'approved' ? 'success' : 
                    invoice.customer_approval_status === 'cancelled' ? 'danger' : 'warning'
                  }`}>
                    {invoice.customer_approval_status.toUpperCase()}
                  </span>
                </p>
              )}
              <hr />
              <p className="text-center">Thank you for your purchase!</p>
              <div className="d-flex gap-2 flex-wrap">
                <Button variant="primary" size="sm" className="mt-2 flex-grow-1 " style={{ color: 'white' }} onClick={() => downloadInvoice(invoice)}>
                  Download Invoice
                </Button>
                {invoice.payment_status !== 'Completed' && (
                  <Button 
                    variant="success" 
                    size="sm" 
                    className="mt-2 flex-grow-1" 
                    style={{ color: 'white' }}
                    onClick={() => handlePaymentClick(invoice)}
                  >
                    Make Payment
                  </Button>
                )}
                {(!invoice.customer_approval_status || invoice.customer_approval_status === 'pending') && (
                  <>
                    <Button 
                      variant="outline-success" 
                      size="sm" 
                      className="mt-2 flex-grow-1" 
                      onClick={() => handleApproveInvoice(invoice.invoice_id)}
                      disabled={approvalLoading}
                    >
                      {approvalLoading ? 'Processing...' : 'Approve Order'}
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      className="mt-2 flex-grow-1" 
                      onClick={() => handleCancelInvoice(invoice.invoice_id)}
                      disabled={approvalLoading}
                    >
                      {approvalLoading ? 'Processing...' : 'Cancel Order'}
                    </Button>
                  </>
                )}
              </div>
            </Card.Body>
          </Card>
        ))
      )}

      {/* Payment Modal */}
      <Modal show={showPaymentModal} onHide={handleClosePaymentModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Payment for Invoice #{currentInvoice?.invoice_id}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePaymentSubmit}>
          <Modal.Body>
            {paymentError && <Alert variant="danger">{paymentError}</Alert>}
            {paymentSuccess ? (
              <Alert variant="success">
                Payment processed successfully! Invoice will be updated.
              </Alert>
            ) : (
              <>
                <div className="mb-3">
                  <Form.Label><strong>Payment Option</strong></Form.Label>
                  <div className="d-flex gap-3">
                    <Button
                      variant={paymentOption === 'full' ? 'primary' : 'outline-primary'}
                      onClick={() => handlePaymentOptionChange('full')}
                      className="flex-grow-1"
                    >
                      Full Payment (LKR {(currentInvoice?.total_amount - currentInvoice?.paid_amount).toFixed(2)})
                    </Button>
                    <Button
                      variant={paymentOption === 'advance' ? 'primary' : 'outline-primary'}
                      onClick={() => handlePaymentOptionChange('advance')}
                      className="flex-grow-1"
                    >
                      30% Advance (LKR {((currentInvoice?.total_amount - currentInvoice?.paid_amount) * 0.3).toFixed(2)})
                    </Button>
                  </div>
                </div>

                <p className="mb-3">
                  <strong>Amount to Pay:</strong> LKR {paymentAmount.toFixed(2)}
                </p>

                <Form.Group className="mb-3">
                  <Form.Label>Card Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="cardNumber"
                    value={formatCardNumber(cardDetails.cardNumber)}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      setCardDetails(prev => ({
                        ...prev,
                        cardNumber: formatted
                      }));
                    }}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Expiry Date</Form.Label>
                      <Form.Control
                        type="text"
                        name="expiryDate"
                        value={formatExpiryDate(cardDetails.expiryDate)}
                        onChange={(e) => {
                          const formatted = formatExpiryDate(e.target.value);
                          setCardDetails(prev => ({
                            ...prev,
                            expiryDate: formatted
                          }));
                        }}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>CVV</Form.Label>
                      <Form.Control
                        type="text"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardChange}
                        placeholder="123"
                        maxLength={3}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Cardholder Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="cardName"
                    value={cardDetails.cardName}
                    onChange={handleCardChange}
                    placeholder="John Doe"
                    required
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            {!paymentSuccess && (
              <>
                <Button variant="secondary" onClick={handleClosePaymentModal}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={paymentLoading}>
                  {paymentLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Payment'
                  )}
                </Button>
              </>
            )}
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default UserInvoices;