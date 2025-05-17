import './OrderList.css';

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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoIcon from '@mui/icons-material/Info';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

// Icons











// CSS


const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Statuses with their respective colors
  const statusColors = {
    pending: 'warning',
    processing: 'info',
    shipped: 'success',
    delivered: 'success',
    cancelled: 'error',
    returned: 'error',
    default: 'default'
  };

  // Payment status colors
  const paymentStatusColors = {
    paid: 'success',
    pending: 'warning',
    failed: 'error',
    refunded: 'info',
    default: 'default'
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:4000/api/order/all_order');
        setOrders(response.data);
        setFilteredOrders(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [refreshKey]);

  useEffect(() => {
    // Filter orders based on search term and status filter
    let filtered = orders;
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.order_id.toString().includes(searchTerm) ||
        (order.customer_id && order.customer_id.toString().includes(searchTerm))
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => 
        order.current_status.toLowerCase() === statusFilter
      );
    }
    
    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const refreshOrders = () => {
    setRefreshKey(oldKey => oldKey + 1);
  };

  const toggleOrderExpansion = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateTotalItems = (items) => {
    return items.reduce((sum, item) => sum + parseInt(item.quantity, 10), 0);
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" mt={2} color="text.secondary">
          Loading orders...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4} display="flex" justifyContent="center">
        <Alert 
          severity="error" 
          sx={{ width: '100%', maxWidth: 800 }}
          action={
            <Button color="inherit" size="small" onClick={refreshOrders}>
              Try Again
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 5 }}>
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
            Normal Orders
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={refreshOrders}
          >
            Refresh
          </Button>
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
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by Order ID or Customer ID"
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip 
                  icon={<FilterListIcon />} 
                  label="All" 
                  onClick={() => handleStatusFilter('all')}
                  color={statusFilter === 'all' ? 'primary' : 'default'}
                  variant={statusFilter === 'all' ? 'filled' : 'outlined'}
                />
                <Chip 
                  label="Pending" 
                  onClick={() => handleStatusFilter('pending')}
                  color={statusFilter === 'pending' ? 'warning' : 'default'}
                  variant={statusFilter === 'pending' ? 'filled' : 'outlined'}
                />
                <Chip 
                  label="Processing" 
                  onClick={() => handleStatusFilter('processing')}
                  color={statusFilter === 'processing' ? 'info' : 'default'}
                  variant={statusFilter === 'processing' ? 'filled' : 'outlined'}
                />
                <Chip 
                  label="Shipped" 
                  onClick={() => handleStatusFilter('shipped')}
                  color={statusFilter === 'shipped' ? 'success' : 'default'}
                  variant={statusFilter === 'shipped' ? 'filled' : 'outlined'}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box display="flex" justifyContent="flex-end">
                <Button 
                  variant="outlined" 
                  startIcon={<FilterAltOffIcon />}
                  onClick={resetFilters}
                  disabled={statusFilter === 'all' && !searchTerm}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Order count */}
        <Box mb={3}>
          <Typography variant="body1" color="text.secondary">
            Showing {filteredOrders.length} of {orders.length} orders
          </Typography>
        </Box>

        {/* Orders list */}
        {filteredOrders.length === 0 ? (
          <Box textAlign="center" py={5}>
            <Typography variant="h6" color="text.secondary">
              No orders found matching your criteria
            </Typography>
            <Button 
              variant="text" 
              color="primary" 
              onClick={resetFilters} 
              sx={{ mt: 2 }}
            >
              Reset Filters
            </Button>
          </Box>
        ) : (
          <Box className="orders-container">
            {filteredOrders.map((order) => (
              <Card 
                key={order.order_id} 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2, 
                  overflow: 'hidden',
                  boxShadow: expandedOrder === order.order_id ? 4 : 2,
                  transition: 'box-shadow 0.3s ease-in-out',
                  border: expandedOrder === order.order_id ? '1px solid #e0e0ff' : 'none',
                }}
                className="order-card"
              >
                {/* Order Header */}
                <CardHeader
                  sx={{ 
                    backgroundColor: expandedOrder === order.order_id ? '#f5f7ff' : '#f9f9f9',
                    transition: 'background-color 0.3s ease',
                    borderBottom: '1px solid #eaeaea',
                    '&:hover': {
                      backgroundColor: '#f0f2fa'
                    }
                  }}
                  title={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6" component="span">
                        Order #{order.order_id}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        component="span" 
                        sx={{ ml: 1, fontSize: '0.8rem' }}
                      >
                        ({calculateTotalItems(order.items)} items)
                      </Typography>
                    </Box>
                  }
                  subheader={
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(order.order_date)}
                      </Typography>
                    </Box>
                  }
                  action={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={order.current_status}
                        size="small"
                        color={statusColors[order.current_status.toLowerCase()] || statusColors.default}
                        icon={<LocalShippingIcon />}
                      />
                      <Chip
                        label={order.payment_status}
                        size="small"
                        color={paymentStatusColors[order.payment_status.toLowerCase()] || paymentStatusColors.default}
                        icon={<PaymentIcon />}
                      />
                      <Tooltip title={expandedOrder === order.order_id ? "Hide Details" : "View Details"}>
                        <IconButton 
                          size="small" 
                          onClick={() => toggleOrderExpansion(order.order_id)}
                          sx={{ 
                            transform: expandedOrder === order.order_id ? 'rotate(90deg)' : 'none',
                            transition: 'transform 0.3s ease'
                          }}
                        >
                          <ArrowForwardIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />

                {/* Order Summary (visible on all cards) */}
                <CardContent sx={{ pt: 2, pb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <InfoIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Customer ID: <strong>{order.customer_id}</strong>
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PaymentIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Payment: <strong>{order.payment_method}</strong>
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ReceiptIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Total: <strong>LKR {parseFloat(order.total_amount).toFixed(2)}</strong>
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>

                {/* Expanded details section */}
                {expandedOrder === order.order_id && (
                  <>
                    <Divider />
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Order Items
                      </Typography>
                      
                      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 1, mb: 3 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                              <TableCell>Item ID</TableCell>
                              <TableCell>Product ID</TableCell>
                              <TableCell>Quantity</TableCell>
                              <TableCell>Unit Price</TableCell>
                              <TableCell align="right">Subtotal</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {order.items.map((item) => {
                              const subtotal = item.quantity * parseFloat(item.unit_price);
                              return (
                                <TableRow key={item.order_item_id}>
                                  <TableCell>{item.order_item_id}</TableCell>
                                  <TableCell>{item.product_id}</TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell>LKR{parseFloat(item.unit_price).toFixed(2)}</TableCell>
                                  <TableCell align="right">LKR{subtotal.toFixed(2)}</TableCell>
                                </TableRow>
                              );
                            })}
                            <TableRow>
                              <TableCell colSpan={3} />
                              <TableCell sx={{ fontWeight: 'bold' }}>
                                Total
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                LKR{parseFloat(order.total_amount).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Paper sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Payment Details
                            </Typography>
                            <Box sx={{ pl: 1 }}>
                              <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2" color="text.secondary">Method:</Typography>
                                <Typography variant="body2">{order.payment_method}</Typography>
                              </Box>
                              <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2" color="text.secondary">Status:</Typography>
                                <Chip 
                                  label={order.payment_status} 
                                  size="small"
                                  color={paymentStatusColors[order.payment_status.toLowerCase()] || 'default'}
                                />
                              </Box>
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">Amount Paid:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  LKR {parseFloat(order.amount_paid).toFixed(2)}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
  <Paper sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
    <Typography variant="subtitle2" gutterBottom>
      Shipping Status
    </Typography>
    <Box sx={{ pl: 1 }}>
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="body2" color="text.secondary">Current Status:</Typography>
        <Chip 
          label={order.current_status} 
          size="small"
          color={statusColors[order.current_status.toLowerCase()] || 'default'}
        />
      </Box>
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="body2" color="text.secondary">Delivery Date:</Typography>
        <Typography variant="body2">
          {order.delivery_date ? formatDate(order.delivery_date) : 'Not specified'}
        </Typography>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">Last Updated:</Typography>
        <Typography variant="body2">
          {formatDate(order.order_date)} {/* Ideally use a status_updated_date field */}
        </Typography>
      </Box>
    </Box>
  </Paper>
</Grid>
                      </Grid>
                    </CardContent>
                   {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, backgroundColor: '#f9f9f9', borderTop: '1px solid #eeeeee' }}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="small"
                        onClick={() => console.log(`View order details for Order #${order.order_id}`)}
                      >
                        View Full Details
                      </Button>
                    </Box>*/}
                  </>
                )}
              </Card>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default OrderList;