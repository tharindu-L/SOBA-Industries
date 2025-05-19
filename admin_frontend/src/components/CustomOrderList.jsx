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
  Link,
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

import axios from 'axios';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonIcon from '@mui/icons-material/Person';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CategoryIcon from '@mui/icons-material/Category';
import InfoIcon from '@mui/icons-material/Info';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

const CustomOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:4000/api/order/all_custom_order');
        if (response.data.success) {
          setOrders(response.data.orders);
          setFilteredOrders(response.data.orders);
        } else {
          setError('Failed to fetch orders');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [refreshKey]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, orders]);


  // Apply filters to orders
const applyFilters = () => {
  let result = [...orders];
  
  // Filter by status
  if (statusFilter !== 'all') {
    result = result.filter(order => order.status.toLowerCase() === statusFilter);
  }
  
  // Filter by search term (customer ID or order ID)
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    result = result.filter(order => 
      order.orderId.toString().includes(searchLower) ||
      order.customerId.toString().includes(searchLower) ||
      (order.description && order.description.toLowerCase().includes(searchLower)) ||
      (order.category && order.category.toLowerCase().includes(searchLower))
    );
  }
  
  setFilteredOrders(result);
};

// Handle status filter changes
const handleStatusFilter = (status) => {
  setStatusFilter(status);
};

// Handle search input changes
const handleSearch = (e) => {
  setSearchTerm(e.target.value);
};

// Reset all filters
const resetFilters = () => {
  setSearchTerm('');
  setStatusFilter('all');
};

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'pending':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            Custom Orders
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
                placeholder="Search by Order ID, Customer ID or Description"
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
                  color={statusFilter === 'pending' ? 'info' : 'default'}
                  variant={statusFilter === 'pending' ? 'filled' : 'outlined'}
                />
                <Chip 
                  label="In Progress" 
                  onClick={() => handleStatusFilter('in_progress')}
                  color={statusFilter === 'in_progress' ? 'warning' : 'default'}
                  variant={statusFilter === 'in_progress' ? 'filled' : 'outlined'}
                />
                <Chip 
                  label="Completed" 
                  onClick={() => handleStatusFilter('completed')}
                  color={statusFilter === 'completed' ? 'success' : 'default'}
                  variant={statusFilter === 'completed' ? 'filled' : 'outlined'}
                />
                <Chip 
                  label="Cancelled" 
                  onClick={() => handleStatusFilter('cancelled')}
                  color={statusFilter === 'cancelled' ? 'error' : 'default'}
                  variant={statusFilter === 'cancelled' ? 'filled' : 'outlined'}
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
            Showing {filteredOrders.length} of {orders.length} custom orders
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
                key={order.orderId} 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2, 
                  overflow: 'hidden',
                  boxShadow: expandedOrder === order.orderId ? 4 : 2,
                  transition: 'box-shadow 0.3s ease-in-out',
                  border: expandedOrder === order.orderId ? '1px solid #e0e0ff' : 'none',
                }}
                className="order-card"
              >
                {/* Order Header */}
                <CardHeader
                  sx={{ 
                    backgroundColor: expandedOrder === order.orderId ? '#f5f7ff' : '#f9f9f9',
                    transition: 'background-color 0.3s ease',
                    borderBottom: '1px solid #eaeaea',
                    '&:hover': {
                      backgroundColor: '#f0f2fa'
                    }
                  }}
                  title={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6" component="span">
                        Custom Order #{order.orderId}
                      </Typography>
                    </Box>
                  }
                  subheader={
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(order.createdAt)}
                      </Typography>
                    </Box>
                  }
                  action={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={order.status}
                        size="small"
                        color={getStatusColor(order.status)}
                        icon={<LocalShippingIcon />}
                      />
                      <Tooltip title={expandedOrder === order.orderId ? "Hide Details" : "View Details"}>
                        <IconButton 
                          size="small"
                          onClick={() => toggleOrderExpansion(order.orderId)}
                          sx={{ 
                            transform: expandedOrder === order.orderId ? 'rotate(90deg)' : 'none',
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
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Customer ID: <strong>{order.customerId}</strong>
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CategoryIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Category: <strong>{order.category || 'Not specified'}</strong>
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <InfoIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Quantity: <strong>{order.quantity}</strong>
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>

                {/* Expanded details section */}
                {expandedOrder === order.orderId && (
                  <>
                    <Divider />
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Order Details
                      </Typography>
                      
                      <Paper sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 1, mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Description
                        </Typography>
                        <Typography variant="body2" sx={{ pl: 1 }}>
                          {order.description || 'No description provided'}
                        </Typography>
                      </Paper>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Paper sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Order Information
                            </Typography>
                            <Box sx={{ pl: 1 }}>
                              <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2" color="text.secondary">Status:</Typography>
                                <Chip 
                                  label={order.status} 
                                  size="small"
                                  color={getStatusColor(order.status)}
                                />
                              </Box>
                              <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2" color="text.secondary">Created:</Typography>
                                <Typography variant="body2">
                                  {formatDate(order.createdAt)}
                                </Typography>
                              </Box>
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">Last Updated:</Typography>
                                <Typography variant="body2">
                                  {formatDate(order.updatedAt)}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Paper sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Additional Information
                            </Typography>
                            <Box sx={{ pl: 1 }}>
                              <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2" color="text.secondary">Category:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {order.category || 'Not specified'}
                                </Typography>
                              </Box>
                              <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2" color="text.secondary">Quantity:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {order.quantity}
                                </Typography>
                              </Box>
                              <Box display="flex" mb={1}>
                                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Special Notes:</Typography>
                                <Typography variant="body2" sx={{ flexGrow: 1, textAlign: 'right' }}>
                                  {order.specialNotes || 'None'}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid>

                      {order.designFiles && order.designFiles.length > 0 && (
                        <Box mt={3}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Design Files
                          </Typography>
                          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 1 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                  <TableCell>#</TableCell>
                                  <TableCell>Filename</TableCell>
                                  <TableCell align="right">Action</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {order.designFiles.map((file, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{file.split('-').pop()}</TableCell>
                                    <TableCell align="right">
                                      <Button
                                        component={Link}
                                        href={`http://localhost:4000/images/${file}`}
                                        target="_blank"
                                        rel="noopener"
                                        startIcon={<AttachFileIcon />}
                                        size="small"
                                        variant="outlined"
                                      >
                                        View
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}
                    </CardContent>
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

export default CustomOrderList;