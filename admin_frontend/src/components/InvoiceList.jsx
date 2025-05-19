import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
  ToggleButton, 
  ToggleButtonGroup
} from '@mui/material';
import { Download, FilterList, Print, Search } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';

import axios from 'axios';
// Add these imports for PDF generation
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [billType, setBillType] = useState('custom'); // 'custom' or 'normal'
  const [filters, setFilters] = useState({
    paymentStatus: 'all',
    orderStatus: 'all'
  });

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        
        let endpoint;
        if (billType === 'custom') {
          endpoint = 'http://localhost:4000/api/quotation/get_all';
        } else {
          // Use the same endpoint as in OrderList.jsx
          endpoint = 'http://localhost:4000/api/order/all_order';
        }
        
        const response = await axios.get(endpoint);
        if (billType === 'custom') {
          if (response.data.success) {
            setInvoices(response.data.invoices);
          } else {
            setError('Failed to fetch custom invoices');
          }
        } else {
          // Direct assignment as in OrderList.jsx
          setInvoices(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [billType]);

  const handleDownload = (invoiceId) => {
    // Find the invoice data
    const invoice = invoices.find(inv => 
      billType === 'custom' ? inv.invoice_id === invoiceId : inv.order_id === invoiceId
    );
    if (!invoice) return;
    
    // Create a temporary div to render the invoice
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);

    // Generate different HTML based on bill type
    if (billType === 'custom') {
      tempDiv.innerHTML = generateCustomInvoiceHTML(invoice);
    } else {
      tempDiv.innerHTML = generateNormalInvoiceHTML(invoice);
    }
    
    // Convert the HTML to PDF
    setTimeout(() => {
      html2canvas(tempDiv, {
        scale: 2,
        logging: false,
        useCORS: true
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`Invoice-${billType === 'custom' ? invoice.invoice_id : invoice.order_id}.pdf`);
        
        // Clean up
        document.body.removeChild(tempDiv);
      });
    }, 500);
  };

  const generateCustomInvoiceHTML = (invoice) => {
    return `
      <div style="font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; width: 750px;">
        <div style="max-width: 750px; margin: 0 auto; border: 1px solid #eee; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px; color: #333;">INVOICE</h1>
          </div>
          
          <div style="margin-bottom: 20px; text-align: center;">
            <p>SOBA Industries</p>
            <p>123 Business Street, Colombo, Sri Lanka</p>
            <p>Phone: (123) 456-7890</p>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <p><strong>Invoice #:</strong> ${invoice.invoice_id}</p>
              <p><strong>Quotation #:</strong> ${invoice.quotation_id || 'N/A'}</p>
              <p><strong>Customer ID:</strong> ${invoice.customer_id}</p>
            </div>
            <div style="text-align: right;">
              <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
              <p><strong>Payment Status:</strong> ${invoice.payment_status}</p>
              <p><strong>Order Status:</strong> ${invoice.order_status}</p>
            </div>
          </div>
          
          ${invoice.job_description ? `
            <div style="margin-bottom: 20px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
              <h3 style="margin-top: 0;">Job Description:</h3>
              <p>${invoice.job_description}</p>
            </div>
          ` : ''}
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left; background-color: #f2f2f2;">Item</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left; background-color: #f2f2f2;">Quantity</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left; background-color: #f2f2f2;">Unit Price</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left; background-color: #f2f2f2;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items && invoice.items.map(item => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">${item.material_name}</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">${item.quantity}</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">LKR${parseFloat(item.unit_price).toFixed(2)}</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">LKR${(item.quantity * parseFloat(item.unit_price)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <p><strong>Payment Details:</strong></p>
              <p>Amount Paid: LKR${parseFloat(invoice.paid_amount || 0).toFixed(2)}</p>
              <p>Balance Due: LKR${(parseFloat(invoice.total_amount) - parseFloat(invoice.paid_amount || 0)).toFixed(2)}</p>
            </div>
            <div style="text-align: right;">
              <p><strong>Total Amount:</strong> LKR${parseFloat(invoice.total_amount).toFixed(2)}</p>
            </div>
          </div>
          
          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #777;">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    `;
  };

  const generateNormalInvoiceHTML = (invoice) => {
    return `
      <div style="font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; width: 750px;">
        <div style="max-width: 750px; margin: 0 auto; border: 1px solid #eee; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px; color: #333;">ORDER INVOICE</h1>
          </div>
          
          <div style="margin-bottom: 20px; text-align: center;">
            <p>SOBA Industries</p>
            <p>123 Business Street, Colombo, Sri Lanka</p>
            <p>Phone: (123) 456-7890</p>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <p><strong>Order #:</strong> ${invoice.order_id}</p>
              <p><strong>Customer ID:</strong> ${invoice.customer_id}</p>
              <p><strong>Payment Method:</strong> ${invoice.payment_method || 'N/A'}</p>
            </div>
            <div style="text-align: right;">
              <p><strong>Order Date:</strong> ${new Date(invoice.order_date).toLocaleDateString()}</p>
              <p><strong>Payment Status:</strong> ${invoice.payment_status || 'Pending'}</p>
              <p><strong>Order Status:</strong> ${invoice.current_status}</p>
            </div>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left; background-color: #f2f2f2;">Product</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left; background-color: #f2f2f2;">Quantity</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left; background-color: #f2f2f2;">Unit Price</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left; background-color: #f2f2f2;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items && invoice.items.map(item => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">${item.product_name || 'Product'}</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">${item.quantity}</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">LKR${parseFloat(item.unit_price || 0).toFixed(2)}</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">LKR${(item.quantity * parseFloat(item.unit_price || 0)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
            <div style="text-align: right; width: 250px;">
              <p style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 5px 0;">
                <span><strong>Subtotal:</strong></span>
                <span>LKR${parseFloat(invoice.total_amount || 0).toFixed(2)}</span>
              </p>
              <p style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; padding: 5px 0;">
                <span>Total:</span>
                <span>LKR${parseFloat(invoice.total_amount || 0).toFixed(2)}</span>
              </p>
            </div>
          </div>
          
          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #777;">
            <p>Thank you for shopping with SOBA Industries!</p>
          </div>
        </div>
      </div>
    `;
  };

  const handlePrint = (invoiceId) => {
    // Implement actual print logic here
    console.log(`Printing invoice ${invoiceId}`);
    // window.print();
  };

  const handleBillTypeChange = (event, newBillType) => {
    if (newBillType !== null) {
      setBillType(newBillType);
      setFilters({ paymentStatus: 'all', orderStatus: 'all' });
      setSearchQuery('');
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    // Handle search differently based on bill type
    let matchesSearch;
    
    if (billType === 'custom') {
      matchesSearch = (invoice.invoice_id?.toString() || '').includes(searchQuery) ||
        (invoice.customer_id?.toString() || '').includes(searchQuery) ||
        ((invoice.job_description || '').toLowerCase()).includes(searchQuery.toLowerCase());
    } else {
      matchesSearch = (invoice.order_id?.toString() || '').includes(searchQuery) ||
        (invoice.customer_id?.toString() || '').includes(searchQuery) ||
        ((invoice.current_status || '').toLowerCase()).includes(searchQuery.toLowerCase());
    }

    let matchesPaymentStatus, matchesOrderStatus;
    
    if (billType === 'custom') {
      matchesPaymentStatus = filters.paymentStatus === 'all' || 
        (invoice.payment_status === filters.paymentStatus);
        
      matchesOrderStatus = filters.orderStatus === 'all' || 
        (invoice.order_status === filters.orderStatus);
    } else {
      // Adapt to normal order status structure from OrderList.jsx
      matchesPaymentStatus = filters.paymentStatus === 'all' || 
        invoice.payment_status === filters.paymentStatus;
        
      matchesOrderStatus = filters.orderStatus === 'all' || 
        invoice.current_status === filters.orderStatus;
    }

    return matchesSearch && matchesPaymentStatus && matchesOrderStatus;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 5 }} style={{marginLeft:'65px', backgroundColor:'#f4f7fc'}}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          backgroundColor: 'transparent'
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {billType === 'custom' ? 'Custom Orders Bills' : 'Normal Orders Bills'}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<FilterList />}
            onClick={() => {
              setFilters({ paymentStatus: 'all', orderStatus: 'all' });
              setSearchQuery('');
            }}
          >
            Clear Filters
          </Button>
        </Box>

        {/* Bill Type Toggle */}
        <Box display="flex" justifyContent="center" mb={3}>
          <ToggleButtonGroup
            value={billType}
            exclusive
            onChange={handleBillTypeChange}
            aria-label="bill type"
            color="primary"
          >
            <ToggleButton value="custom" aria-label="custom bills">
              Custom Order Bills
            </ToggleButton>
            <ToggleButton value="normal" aria-label="normal bills">
              Standard Order Bills
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Search and Filter */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            mb: 4, 
            borderRadius: 2,
            backgroundColor: 'white'
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                select
                fullWidth
                label="Payment Status"
                value={filters.paymentStatus}
                onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                variant="outlined"
                size="small"
              >
                <MenuItem value="all">All Payments</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Partially Paid">Partially Paid</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                select
                fullWidth
                label="Order Status"
                value={filters.orderStatus}
                onChange={(e) => setFilters({ ...filters, orderStatus: e.target.value })}
                variant="outlined"
                size="small"
              >
                <MenuItem value="all">All Orders</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setFilters({ paymentStatus: 'all', orderStatus: 'all' });
                  setSearchQuery('');
                }}
                sx={{ height: 40 }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Order count */}
        <Box mb={3}>
          <Typography variant="body1" color="text.secondary">
            Showing {filteredInvoices.length} of {invoices.length} {billType === 'custom' ? 'custom' : 'normal'} order bills
          </Typography>
        </Box>

        {/* Results Section */}
        {filteredInvoices.length === 0 ? (
          <Box textAlign="center" py={5}>
            <Typography variant="h6" color="text.secondary">
              No {billType === 'custom' ? 'custom' : 'normal'} order bills found matching your criteria
            </Typography>
            <Button 
              variant="text" 
              color="primary"
              onClick={() => {
                setFilters({ paymentStatus: 'all', orderStatus: 'all' });
                setSearchQuery('');
              }}
              sx={{ mt: 2 }}
            >
              Reset Filters
            </Button>
          </Box>
        ) : (
          <Box className="orders-container">
            {filteredInvoices.map((invoice) => (
              <Card 
                key={billType === 'custom' ? invoice.invoice_id : invoice.order_id} 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2, 
                  overflow: 'hidden',
                  boxShadow: 2,
                  transition: 'box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: 4
                  }
                }}
                className="order-card"
              >
                <CardHeader
                  sx={{ 
                    backgroundColor: '#f9f9f9',
                    transition: 'background-color 0.3s ease',
                    borderBottom: '1px solid #eaeaea',
                    '&:hover': {
                      backgroundColor: '#f0f2fa'
                    }
                  }}
                  title={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6" component="span">
                        {billType === 'custom' 
                          ? `Invoice #${invoice.invoice_id}`
                          : `Order #${invoice.order_id}`
                        }
                      </Typography>
                    </Box>
                  }
                  subheader={
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Created: {new Date(billType === 'custom' ? invoice.created_at : invoice.order_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                  action={
                    <Box display="flex" gap={1} alignItems="center">
                      <Box>
                        <Chip
                          label={billType === 'custom' ? invoice.payment_status : invoice.payment_status || 'Unpaid'}
                          size="small"
                          color={
                            (billType === 'custom' ? invoice.payment_status : invoice.payment_status) === 'Paid' ? 'success' :
                            (billType === 'custom' ? invoice.payment_status : invoice.payment_status) === 'Partially Paid' ? 'warning' : 'default'
                          }
                        />
                        <Chip
                          label={billType === 'custom' 
                            ? (invoice.order_status ? invoice.order_status.replace('_', ' ') : 'Unknown')
                            : invoice.current_status
                          }
                          size="small"
                          color={
                            (billType === 'custom' ? invoice.order_status : invoice.current_status) === 'completed' ? 'success' :
                            (billType === 'custom' ? invoice.order_status : invoice.current_status) === 'in_progress' || 
                            (billType !== 'custom' && invoice.current_status === 'processing') ? 'warning' : 'default'
                          }
                          sx={{ ml: 1 }}
                        />
                      </Box>
                      <Box>
                        <Tooltip title="Download Invoice">
                          <IconButton size="small" onClick={() => handleDownload(billType === 'custom' ? invoice.invoice_id : invoice.order_id)}>
                            <Download />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Print Invoice">
                          <IconButton size="small" onClick={() => handlePrint(billType === 'custom' ? invoice.invoice_id : invoice.order_id)}>
                            <Print />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  }
                />
                
                <CardContent>
                  {billType === 'custom' ? (
                    // Custom order bill content
                    <>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <List dense>
                            <ListItem>
                              <ListItemText 
                                primary="Quotation ID" 
                                secondary={invoice.quotation_id} 
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary="Customer ID" 
                                secondary={invoice.customer_id} 
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Payment Progress"
                                secondary={`LKR${invoice.paid_amount} of LKR${invoice.total_amount}`}
                              />
                            </ListItem>
                          </List>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <List dense>
                            <ListItem>
                              <ListItemText
                                primary="Total Amount"
                                secondary={`LKR${invoice.total_amount}`}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Amount Due"
                                secondary={`LKR${(parseFloat(invoice.total_amount || 0) - parseFloat(invoice.paid_amount || 0)).toFixed(2)}`}
                              />
                            </ListItem>
                          </List>
                        </Grid>
                      </Grid>

                      {invoice.job_description && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle2" gutterBottom>
                            Job Description:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {invoice.job_description}
                          </Typography>
                        </>
                      )}

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" gutterBottom>
                        Items Breakdown:
                      </Typography>
                      <List dense sx={{ backgroundColor: '#f9f9f9', borderRadius: 1, p: 1 }}>
                        {invoice.items && invoice.items.map((item, index) => (
                          <ListItem key={index} sx={{ borderBottom: index < invoice.items.length - 1 ? '1px solid #eee' : 'none' }}>
                            <ListItemText
                              primary={item.material_name}
                              secondary={`Quantity: ${item.quantity} × LKR${item.unit_price}`}
                            />
                            <Typography variant="body2" fontWeight="medium">
                              LKR {(item.quantity * parseFloat(item.unit_price || 0)).toFixed(2)}
                            </Typography>
                          </ListItem>
                        ))}
                      </List>
                    </>
                  ) : (
                    // Normal order bill content
                    <>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <List dense>
                            <ListItem>
                              <ListItemText 
                                primary="Customer ID" 
                                secondary={invoice.customer_id} 
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary="Order Date" 
                                secondary={new Date(invoice.order_date).toLocaleDateString()} 
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Payment Status"
                                secondary={invoice.payment_status || "Pending"}
                              />
                            </ListItem>
                          </List>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <List dense>
                            <ListItem>
                              <ListItemText
                                primary="Total Amount"
                                secondary={`LKR${invoice.total_amount}`}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Payment Method"
                                secondary={invoice.payment_method || "N/A"}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Order Status"
                                secondary={invoice.current_status}
                              />
                            </ListItem>
                          </List>
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" gutterBottom>
                        Items Ordered:
                      </Typography>
                      <List dense sx={{ backgroundColor: '#f9f9f9', borderRadius: 1, p: 1 }}>
                        {invoice.items && invoice.items.map((item, index) => (
                          <ListItem key={index} sx={{ borderBottom: index < invoice.items.length - 1 ? '1px solid #eee' : 'none' }}>
                            <ListItemText
                              primary={item.product_name || "Product"}
                              secondary={`Quantity: ${item.quantity} × LKR${item.unit_price}`}
                            />
                            <Typography variant="body2" fontWeight="medium">
                              LKR {(item.quantity * parseFloat(item.unit_price || 0)).toFixed(2)}
                            </Typography>
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default InvoiceList;