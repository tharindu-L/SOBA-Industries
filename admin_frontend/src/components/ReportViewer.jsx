import React from 'react';
import { 
  Box, 
  Paper, 
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const ReportViewer = ({ data, type, inventoryType, startDate, endDate }) => {
  
  const renderInventoryReport = () => {
    if (!data || !data.items) return <Typography>No inventory data available</Typography>;
    
    const { items, summary } = data;
    
    return (
      <>
        <Typography variant="h6" gutterBottom>
          {inventoryType === 'materials' ? 'Raw Materials' : 'Finished Products'} Inventory Report
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Items
                </Typography>
                <Typography variant="h4">
                  {summary?.totalItems || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">
                  Low Stock Items
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {summary?.lowStockItems || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">
                  Out of Stock Items
                </Typography>
                <Typography variant="h4" color="error.main">
                  {summary?.outOfStockItems || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Item Name</strong></TableCell>
                <TableCell><strong>Current Stock</strong></TableCell>
                <TableCell><strong>Min. Required</strong></TableCell>
                <TableCell><strong>Stock Status</strong></TableCell>
                <TableCell><strong>Change in Period</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.currentStock}</TableCell>
                  <TableCell>{item.minimumRequired}</TableCell>
                  <TableCell>
                    {item.stockStatus === 'Normal' && (
                      <Chip label="Normal" color="success" size="small" />
                    )}
                    {item.stockStatus === 'Low' && (
                      <Chip label="Low Stock" color="warning" size="small" />
                    )}
                    {item.stockStatus === 'Out' && (
                      <Chip label="Out of Stock" color="error" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {item.change > 0 ? (
                        <>
                          <TrendingUpIcon fontSize="small" color="success" />
                          <Typography variant="body2" sx={{ ml: 1, color: 'success.main' }}>
                            +{item.change} {item.unit}
                          </Typography>
                        </>
                      ) : item.change < 0 ? (
                        <>
                          <TrendingDownIcon fontSize="small" color="error" />
                          <Typography variant="body2" sx={{ ml: 1, color: 'error.main' }}>
                            {item.change} {item.unit}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2">
                          No change
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };
  
  const renderSalesReport = () => {
    if (!data || !data.sales) return <Typography>No sales data available</Typography>;
    
    const { sales, summary } = data;
    
    return (
      <>
        <Typography variant="h6" gutterBottom>
          Sales Report
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Orders
                </Typography>
                <Typography variant="h4">
                  {summary?.totalOrders || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Revenue
                </Typography>
                <Typography variant="h4">
                  LKR {summary?.totalRevenue?.toFixed(2) || '0.00'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">
                  Average Order Value
                </Typography>
                <Typography variant="h4">
                  LKR {summary?.averageOrderValue?.toFixed(2) || '0.00'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">
                  Top Product
                </Typography>
                <Typography variant="h6" noWrap>
                  {summary?.topProduct || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Order ID</strong></TableCell>
                <TableCell><strong>Customer</strong></TableCell>
                <TableCell><strong>Items</strong></TableCell>
                <TableCell><strong>Order Type</strong></TableCell>
                <TableCell><strong>Total</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                  <TableCell>{sale.orderId}</TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>{sale.items}</TableCell>
                  <TableCell>
                    <Chip 
                      label={sale.type === 'normal' ? 'Normal' : 'Custom'} 
                      color={sale.type === 'normal' ? 'primary' : 'secondary'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>LKR {parseFloat(sale.total || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={sale.status} 
                      color={
                        sale.status === 'delivered' || sale.status === 'completed' ? 'success' : 
                        sale.status === 'processing' || sale.status === 'in_progress' ? 'warning' : 
                        'default'
                      } 
                      size="small" 
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };
  
  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="textSecondary">
            Report Period: {startDate ? new Date(startDate).toLocaleDateString() : 'N/A'} to {endDate ? new Date(endDate).toLocaleDateString() : 'N/A'}
          </Typography>
          <Divider sx={{ mt: 1 }} />
        </Box>
        
        {type === 'inventory' ? renderInventoryReport() : renderSalesReport()}
      </Paper>
    </Box>
  );
};

export default ReportViewer;