import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import axios from 'axios';

// Status color mapping - make sure 'completed' has a distinct color
const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'success'; // Change to success for completed
    default: return 'warning'; // pending
  }
};

const CustomOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Fetch custom orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:4000/api/supervisors/custom-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrders(response.data.orders);
        setError(null);
      } else {
        setError(response.data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // View order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
    setStatusToUpdate(order.status);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  // Update order status
  const handleUpdateStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Add logging to track what's happening
      console.log(`Updating order ${selectedOrder.requestId} status from ${selectedOrder.status} to ${statusToUpdate}`);
      
      const response = await axios.post(
        'http://localhost:4000/api/supervisors/custom-orders/update-status',
        {
          requestId: selectedOrder.requestId,
          status: statusToUpdate
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Update local state
        const updatedOrders = orders.map(order => 
          order.requestId === selectedOrder.requestId 
            ? { ...order, status: statusToUpdate } 
            : order
        );
        
        setOrders(updatedOrders);
        setOpenDialog(false);
        
        // Show appropriate success message based on status
        let message = statusToUpdate === 'completed' 
          ? 'Order marked as completed successfully'
          : 'Order status updated to pending';
        
        setSnackbarMessage(message);
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        
        // Refresh the orders list if we're completing an order
        if (statusToUpdate === 'completed') {
          fetchOrders();
        }
      } else {
        // Show error message
        setSnackbarMessage(response.data.message || 'Failed to update status');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setSnackbarMessage(err.response?.data?.message || 'An error occurred');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Custom Orders Management
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 4, boxShadow: 3 }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.light' }}>
                  <TableCell>Request ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Item Type</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => (
                    <TableRow key={order.requestId} hover>
                      <TableCell>{order.requestId}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{order.itemType}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>LKR {parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={order.status} 
                          color={getStatusColor(order.status)} 
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button 
                          variant="contained" 
                          size="small" 
                          onClick={() => handleViewOrder(order)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No custom orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={orders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {/* Order Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              <Typography variant="h6">
                Custom Order Details - {selectedOrder.requestId}
              </Typography>
              <Chip 
                label={selectedOrder.status} 
                color={getStatusColor(selectedOrder.status)} 
                size="small"
                sx={{ 
                  ml: 1, 
                  textTransform: 'capitalize',
                  verticalAlign: 'middle'
                }}
              />
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card elevation={0}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Order Information
                      </Typography>
                      
                      <Box mt={2}>
                        <Typography variant="body2" color="text.secondary">Customer Name</Typography>
                        <Typography variant="body1" gutterBottom>{selectedOrder.customerName}</Typography>
                        
                        <Typography variant="body2" color="text.secondary">Item Type</Typography>
                        <Typography variant="body1" gutterBottom sx={{ textTransform: 'capitalize' }}>
                          {selectedOrder.itemType}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">Description</Typography>
                        <Typography variant="body1" gutterBottom>
                          {selectedOrder.description || 'No description provided'}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">Special Notes</Typography>
                        <Typography variant="body1" gutterBottom>
                          {selectedOrder.specialNotes || 'No special notes'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card elevation={0}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Order Details
                      </Typography>
                      
                      <Box mt={2}>
                        <Typography variant="body2" color="text.secondary">Quantity</Typography>
                        <Typography variant="body1" gutterBottom>{selectedOrder.quantity} units</Typography>
                        
                        <Typography variant="body2" color="text.secondary">Unit Price</Typography>
                        <Typography variant="body1" gutterBottom>
                          LKR {parseFloat(selectedOrder.unitPrice).toFixed(2)}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                        <Typography variant="body1" gutterBottom fontWeight="bold">
                          LKR {parseFloat(selectedOrder.totalAmount).toFixed(2)}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">Created Date</Typography>
                        <Typography variant="body1" gutterBottom>
                          {new Date(selectedOrder.createdAt).toLocaleString()}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">Required By</Typography>
                        <Typography variant="body1" gutterBottom>
                          {selectedOrder.wantDate ? new Date(selectedOrder.wantDate).toLocaleDateString() : 'Not specified'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {selectedOrder.designImage && (
                  <Grid item xs={12}>
                    <Card elevation={0}>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                          Design Image
                        </Typography>
                      </CardContent>
                      <CardMedia
                        component="img"
                        image={`http://localhost:4000${selectedOrder.designImage}`}
                        alt="Design Image"
                        sx={{ 
                          height: 300, 
                          objectFit: 'contain',
                          backgroundColor: '#f5f5f5'
                        }}
                      />
                    </Card>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Box mt={2}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      Update Status
                    </Typography>
                    
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusToUpdate}
                        onChange={(e) => setStatusToUpdate(e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="completed">Completed - Order Fulfilled</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button 
                onClick={handleUpdateStatus}
                variant="contained"
                color="primary"
                disabled={statusToUpdate === selectedOrder.status}
              >
                Update Status
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomOrdersPage;