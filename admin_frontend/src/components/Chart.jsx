import 'jspdf-autotable';

import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Tooltip as MuiTooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

import { CSVLink } from 'react-csv';
import DownloadIcon from '@mui/icons-material/Download';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import TableChartIcon from '@mui/icons-material/TableChart';
import { jsPDF } from 'jspdf';
import { useReactToPrint } from 'react-to-print';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const printRef = useRef();

  // For CSV export
  const [csvData, setCsvData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/analytics/analytics');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setAnalyticsData(data);
        
        // Prepare data for CSV export
        if (data && data.materialUsage) {
          const materialCsvData = [
            ['Material', 'Available Stock', 'Used Quantity', 'Usage Percentage'],
            ...data.materialUsage.map(material => {
              const total = material.available_qty + (material.used_qty || 0);
              const usagePercentage = total > 0 
                ? ((material.used_qty / total) * 100).toFixed(1)
                : 0;
              return [
                material.item_name, 
                material.available_qty, 
                material.used_qty || 0, 
                `${usagePercentage}%`
              ];
            })
          ];
          setCsvData(materialCsvData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Print functionality
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'SOBA Industries Analytics Dashboard',
    onAfterPrint: () => console.log('Print completed')
  });

  // PDF export functionality
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('SOBA Industries Analytics Dashboard', 20, 10);
    
    if (analyticsData && analyticsData.materialUsage) {
      doc.text('Material Inventory & Usage Report', 20, 20);
      
      // Convert material usage data to format for autoTable
      const tableData = analyticsData.materialUsage.map(material => {
        const total = material.available_qty + (material.used_qty || 0);
        const usagePercentage = total > 0 
          ? ((material.used_qty / total) * 100).toFixed(1)
          : 0;
        return [
          material.item_name, 
          material.available_qty, 
          material.used_qty || 0, 
          `${usagePercentage}%`
        ];
      });
      
      doc.autoTable({
        head: [['Material', 'Available Stock', 'Used Quantity', 'Usage Percentage']],
        body: tableData,
        startY: 25
      });
    }
    
    doc.save('soba-industries-analytics.pdf');
    handleMenuClose();
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Typography color="error" variant="h6">Error: {error}</Typography>
    </Box>
  );

  return (
    <Container style={{marginTop:'-730px'}} maxWidth="xl" sx={{ py: 4 }} ref={printRef}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
          SOBA Analytics Dashboard
        </Typography>
        
        <Box>
          {/* Print Button */}
          <MuiTooltip title="Print Dashboard">
            <Button 
              variant="outlined" 
              startIcon={<PrintIcon />} 
              onClick={handlePrint}
              sx={{ mr: 1 }}
            >
              Print
            </Button>
          </MuiTooltip>
          
          {/* Export Button with Menu */}
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleMenuClick}
            aria-controls={openMenu ? 'export-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openMenu ? 'true' : undefined}
          >
            Export
          </Button>
          
          <Menu
            id="export-menu"
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
          >
            <CSVLink 
              data={csvData} 
              filename="soba-materials.csv"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <MenuItem onClick={handleMenuClose}>
                <TableChartIcon fontSize="small" sx={{ mr: 1 }} />
                Export as CSV
              </MenuItem>
            </CSVLink>
            <MenuItem onClick={handleExportPDF}>
              <PictureAsPdfIcon fontSize="small" sx={{ mr: 1 }} />
              Export as PDF
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Sales Trends Line Chart */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              height: '100%',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-4px)'
              }
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="medium" color="text.primary">
                Monthly Sales Trends
              </Typography>
              <MuiTooltip title="Download Chart">
                <IconButton size="small">
                  <FileDownloadIcon fontSize="small" />
                </IconButton>
              </MuiTooltip>
            </Box>
            <Box height={300}>
              <Line
                data={{
                  labels: analyticsData.salesTrends.map(item => item.month),
                  datasets: [{
                    label: 'Total Sales (LKR)',
                    data: analyticsData.salesTrends.map(item => item.total_sales),
                    borderColor: 'rgb(79, 70, 229)',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.3
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Top Products Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              height: '100%',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-4px)'
              }
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="medium" color="text.primary">
                Top Selling Products
              </Typography>
              <MuiTooltip title="Download Chart">
                <IconButton size="small">
                  <FileDownloadIcon fontSize="small" />
                </IconButton>
              </MuiTooltip>
            </Box>
            <Box height={300}>
              <Bar
                data={{
                  labels: analyticsData.productSales.map(item => item.name),
                  datasets: [{
                    label: 'Units Sold',
                    data: analyticsData.productSales.map(item => item.total_sold),
                    backgroundColor: 'rgba(79, 70, 229, 0.8)',
                    borderColor: 'rgb(79, 70, 229)',
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Order Status Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-4px)'
              }
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="medium" color="text.primary">
                Order Status Distribution
              </Typography>
              <MuiTooltip title="Download Chart">
                <IconButton size="small">
                  <FileDownloadIcon fontSize="small" />
                </IconButton>
              </MuiTooltip>
            </Box>
            <Box height={300}>
              <Pie
                data={{
                  labels: analyticsData.orderStatus.map(item => item.status),
                  datasets: [{
                    data: analyticsData.orderStatus.map(item => item.count),
                    backgroundColor: [
                      '#EF4444',
                      '#3B82F6',
                      '#F59E0B',
                      '#10B981',
                      '#8B5CF6'
                    ]
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Payment Status Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-4px)'
              }
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="medium" color="text.primary">
                Payment Status Overview
              </Typography>
              <MuiTooltip title="Download Chart">
                <IconButton size="small">
                  <FileDownloadIcon fontSize="small" />
                </IconButton>
              </MuiTooltip>
            </Box>
            <Box height={300}>
              <Pie
                data={{
                  labels: analyticsData.paymentStatuses.map(item => item.payment_status),
                  datasets: [{
                    data: analyticsData.paymentStatuses.map(item => item.count),
                    backgroundColor: [
                      '#EF4444',
                      '#3B82F6',
                      '#F59E0B'
                    ]
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Material Usage Table */}
      <Paper elevation={2} sx={{ mt: 4, p: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="medium" color="text.primary">
            Material Inventory & Usage
          </Typography>
          
          <Box>
            <CSVLink 
              data={csvData}
              filename="material-inventory.csv"
              style={{ textDecoration: 'none' }}
            >
              <MuiTooltip title="Export to CSV">
                <IconButton size="small" sx={{ mr: 1 }}>
                  <TableChartIcon fontSize="small" />
                </IconButton>
              </MuiTooltip>
            </CSVLink>
            
            <MuiTooltip title="Print Table">
              <IconButton size="small">
                <PrintIcon fontSize="small" />
              </IconButton>
            </MuiTooltip>
          </Box>
        </Box>
        
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Material</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Available Stock</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Used Quantity</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Usage Percentage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analyticsData.materialUsage.map((material, index) => {
                const total = material.available_qty + (material.used_qty || 0);
                const usagePercentage = total > 0 
                  ? ((material.used_qty / total) * 100).toFixed(1)
                  : 0;

                return (
                  <TableRow 
                    key={index}
                    sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                  >
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                      {material.item_name}
                    </TableCell>
                    <TableCell>{material.available_qty}</TableCell>
                    <TableCell>{material.used_qty || 0}</TableCell>
                    <TableCell>
                      <Box 
                        sx={{ 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1, 
                          display: 'inline-flex',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          bgcolor: 
                            usagePercentage > 75 ? 'error.100' :
                            usagePercentage > 50 ? 'warning.100' :
                            'success.100',
                          color:
                            usagePercentage > 75 ? 'error.800' :
                            usagePercentage > 50 ? 'warning.800' :
                            'success.800'
                        }}
                      >
                        {usagePercentage}%
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default Dashboard;