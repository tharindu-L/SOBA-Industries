import { useState } from 'react';
import { getInventoryReport, getSalesReport, downloadReport as downloadReportService } from '../services/reportService';

export const useReportGenerator = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const generateReport = async (reportType, params) => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (reportType === 'inventory') {
        response = await getInventoryReport(
          params.inventoryType, 
          params.startDate, 
          params.endDate
        );
      } else if (reportType === 'sales') {
        response = await getSalesReport(
          params.startDate, 
          params.endDate
        );
      }
      
      if (response && response.success) {
        console.log('Report data received:', response);
        setReportData(response);
      } else {
        if (response) {
          throw new Error(response.message || 'Failed to generate report');
        } else {
          throw new Error('No response from server');
        }
      }
    } catch (err) {
      console.error('Error generating report:', err);
      
      // Extract meaningful error message
      let errorMessage = 'Unknown error occurred';
      
      if (err.response && err.response.data) {
        errorMessage = err.response.data.message || 'Server error';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(`Failed to generate report: ${errorMessage}`);
      
      // Set reportData to null when there's an error
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };
  
  const downloadReport = async (reportType, options) => {
    try {
      setLoading(true);
      
      const params = {
        inventoryType: options.inventoryType,
        startDate: options.startDate || '',
        endDate: options.endDate || '',
        format: options.format || 'pdf'
      };
      
      await downloadReportService(reportType, params);
      alert(`${options.format.toUpperCase()} report is downloading...`);
    } catch (err) {
      console.error('Error downloading report:', err);
      
      let errorMessage = 'Please try again later';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(`Error downloading ${options.format} report: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  return {
    reportData,
    loading,
    error,
    setError, // Export setError function
    generateReport,
    downloadReport
  };
};