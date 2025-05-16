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
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { Download, FilterList, Print, Search } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';

import axios from 'axios';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    paymentStatus: 'all',
    orderStatus: 'all'
  });

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/quotation/get_all');
        if (response.data.success) {
          setInvoices(response.data.invoices);
        } else {
          setError('Failed to fetch invoices');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handleDownload = (invoiceId) => {
    // Find the invoice data
    const invoice = invoices.find(inv => inv.invoice_id === invoiceId);
    if (!invoice) return;
    
    // Create invoice HTML content
    const invoiceHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice #${invoice.invoice_id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #eee;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
          }
          .invoice-header {
            text-align: center;
            margin-bottom: 20px;
          }
          .invoice-header h1 {
            margin: 0;
            font-size: 24px;
            color: #333;
          }
          .company-details {
            margin-bottom: 20px;
            text-align: center;
          }
          .invoice-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .invoice-info-block {
            flex: 1;
          }
          .job-description {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f9f9f9;
            border-radius: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .totals {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .payment-details {
            flex: 1;
          }
          .total-amount {
            flex: 1;
            text-align: right;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <h1>INVOICE</h1>
          </div>
          
          <div class="company-details">
            <p>Your Company Name</p>
            <p>123 Business Street, City, Country, ZIP</p>
            <p>Phone: (123) 456-7890</p>
          </div>
          
          <div class="invoice-info">
            <div class="invoice-info-block">
              <p><strong>Invoice #:</strong> ${invoice.invoice_id}</p>
              <p><strong>Quotation #:</strong> ${invoice.quotation_id}</p>
              <p><strong>Customer ID:</strong> ${invoice.customer_id}</p>
            </div>
            <div class="invoice-info-block" style="text-align: right;">
              <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
              <p><strong>Payment Status:</strong> ${invoice.payment_status}</p>
              <p><strong>Order Status:</strong> ${invoice.order_status}</p>
            </div>
          </div>
          
          ${invoice.job_description ? `
            <div class="job-description">
              <h3>Job Description:</h3>
              <p>${invoice.job_description}</p>
            </div>
          ` : ''}
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items && invoice.items.map(item => `
                <tr>
                  <td>${item.material_name}</td>
                  <td>${item.quantity}</td>
                  <td>LKR${parseFloat(item.unit_price).toFixed(2)}</td>
                  <td>LKR${(item.quantity * parseFloat(item.unit_price)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="payment-details">
              <p><strong>Payment Details:</strong></p>
              <p>Amount Paid: LKR${parseFloat(invoice.paid_amount || 0).toFixed(2)}</p>
              <p>Balance Due: LKR${(parseFloat(invoice.total_amount) - parseFloat(invoice.paid_amount || 0)).toFixed(2)}</p>
            </div>
            <div class="total-amount">
              <p><strong>Total Amount:</strong> LKR${parseFloat(invoice.total_amount).toFixed(2)}</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Convert HTML content to a Blob
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Invoice-${invoice.invoice_id}.html`;
    
    // Append to the document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = (invoiceId) => {
    // Implement actual print logic here
    console.log(`Printing invoice ${invoiceId}`);
    // window.print();
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_id.toString().includes(searchQuery) ||
      invoice.customer_id.includes(searchQuery) ||
      invoice.job_description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPaymentStatus = filters.paymentStatus === 'all' || 
      invoice.payment_status === filters.paymentStatus;
      
    const matchesOrderStatus = filters.orderStatus === 'all' || 
      invoice.order_status === filters.orderStatus;

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
    <Container style={{marginTop:'-700px'}} maxWidth="lg">
      <Box mt={4} mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Invoice Management
        </Typography>

        {/* Control Bar */}
        <Card sx={{ mb: 3, p: 2, backgroundColor: 'background.paper' }}>
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
                sx={{ height: 56 }}
              >
                Clear All
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Results Section */}
        {filteredInvoices.length === 0 ? (
          <Box textAlign="center" p={4}>
            <Typography variant="h6" color="textSecondary">
              No invoices found matching your criteria
            </Typography>
          </Box>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.invoice_id} sx={{ mb: 3, boxShadow: 3 }}>
              <CardHeader
                title={`Invoice #${invoice.invoice_id}`}
                subheader={
                  <Box>
                    <Typography variant="caption">
                      Created: {new Date(invoice.created_at).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Last Updated: {new Date(invoice.updatedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                }
                action={
                  <Box display="flex" gap={1} alignItems="center">
                    <Box>
                      <Chip
                        label={invoice.payment_status}
                        color={
                          invoice.payment_status === 'Paid' ? 'success' :
                          invoice.payment_status === 'Partially Paid' ? 'warning' : 'default'
                        }
                      />
                      <Chip
                        label={invoice.order_status.replace('_', ' ')}
                        color={
                          invoice.order_status === 'completed' ? 'success' :
                          invoice.order_status === 'in_progress' ? 'warning' : 'default'
                        }
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    <Box>
                      <Tooltip title="Download Invoice">
                        <IconButton onClick={() => handleDownload(invoice.invoice_id)}>
                          <Download />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print Invoice">
                        <IconButton onClick={() => handlePrint(invoice.invoice_id)}>
                          <Print />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                }
              />
              
              <CardContent>
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
                          secondary={`LKR${(parseFloat(invoice.total_amount) - parseFloat(invoice.paid_amount)).toFixed(2)}`}
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
                <List dense>
                  {invoice.items.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={item.material_name}
                        secondary={`Quantity: ${item.quantity} × LKR${item.unit_price}`}
                      />
                      <Typography variant="body2">
                        LKR {(item.quantity * parseFloat(item.unit_price)).toFixed(2)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Container>
  );
};

export default InvoiceList;