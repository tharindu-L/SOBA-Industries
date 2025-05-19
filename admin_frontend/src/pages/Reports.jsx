import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Button, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select,
  TextField,
  Tabs,
  Tab,
  Paper,
  CircularProgress
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InventoryIcon from '@mui/icons-material/Inventory';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import { useReportGenerator } from '../hooks/useReportGenerator';
import ReportViewer from '../components/ReportViewer';

const Reports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [reportType, setReportType] = useState('inventory');
  const [inventoryType, setInventoryType] = useState('materials');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const { 
    generateReport, 
    reportData, 
    loading, 
    error, 
    downloadReport,
    setError // Make sure we get the setError function from the hook 
  } = useReportGenerator();
  
  // Handle tab change (Inventory/Sales)
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setReportType(newValue === 0 ? 'inventory' : 'sales');
  };
  
  // Handle inventory type change (Materials/Products)
  const handleInventoryTypeChange = (event) => {
    setInventoryType(event.target.value);
  };
  
  // Handle generate report
  const handleGenerateReport = () => {
    generateReport(reportType, {
      inventoryType,
      startDate,
      endDate
    });
  };
  
  // Handle download report
  const handleDownloadReport = (format) => {
    downloadReport(reportType, {
      inventoryType,
      startDate,
      endDate,
      format
    });
  };
  
  return (
    <Box sx={{ p: 3 }} marginLeft={'95px'} bgcolor={'#f4f7fc'}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', marginLeft:'350px'} }>
        <AssessmentIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" >Reports</Typography>
      </Box>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<InventoryIcon />} label="Inventory Reports" />
          <Tab icon={<PointOfSaleIcon />} label="Sales Reports" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={activeTab === 0 ? 4 : 6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={activeTab === 0 ? 4 : 6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            {/* Inventory Type Dropdown (only for Inventory Reports) */}
            {activeTab === 0 && (
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Inventory Type</InputLabel>
                  <Select
                    value={inventoryType}
                    label="Inventory Type"
                    onChange={handleInventoryTypeChange}
                  >
                    <MenuItem value="materials">Raw Materials</MenuItem>
                    <MenuItem value="products">Finished Products</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={handleGenerateReport}
                  disabled={loading || !startDate || !endDate}
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </Button>
                
                {reportData && (
                  <>
                    <Button 
                      variant="outlined" 
                      onClick={() => handleDownloadReport('pdf')}
                    >
                      Download PDF
                    </Button>
                    <Button 
                      variant="outlined"
                      onClick={() => handleDownloadReport('excel')}
                    >
                      Download Excel
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light' }}>
          <Typography color="error">
            <strong>Error:</strong> {error}
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            size="small" 
            onClick={() => setError(null)} 
            sx={{ mt: 1 }}
          >
            Dismiss
          </Button>
        </Paper>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : reportData ? (
        <ReportViewer 
          data={reportData}
          type={reportType}
          inventoryType={inventoryType}
          startDate={startDate}
          endDate={endDate}
        />
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            No Reports Generated Yet
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Please select a date range and generate a report to view data.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Reports;