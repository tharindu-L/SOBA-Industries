import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Helper function to get authenticated header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? {
    headers: {
      Authorization: `Bearer ${token}`
    }
  } : {};
};

// Get inventory report
export const getInventoryReport = async (inventoryType, startDate, endDate) => {
  try {
    console.log(`Fetching inventory report for ${inventoryType} from ${startDate} to ${endDate}`);
    
    const response = await axios.get(`${API_URL}/reports/inventory/${inventoryType}`, {
      params: { startDate, endDate },
      ...getAuthHeader()
    });
    
    console.log('Inventory report response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      throw error;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      throw error;
    }
  }
};

// Get sales report
export const getSalesReport = async (startDate, endDate) => {
  try {
    console.log(`Fetching sales report from ${startDate} to ${endDate}`);
    
    const response = await axios.get(`${API_URL}/reports/sales`, {
      params: { startDate, endDate },
      ...getAuthHeader()
    });
    
    console.log('Sales report response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching sales report:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      throw error;
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('No response received from server');
    } else {
      console.error('Request setup error:', error.message);
      throw error;
    }
  }
};

// Download report in specified format
export const downloadReport = async (reportType, params) => {
  let endpoint = '';
  
  if (reportType === 'inventory') {
    endpoint = `${API_URL}/reports/inventory/${params.inventoryType}/download`;
  } else {
    endpoint = `${API_URL}/reports/sales/download`;
  }
  
  try {
    const response = await axios.get(endpoint, {
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        format: params.format
      },
      responseType: 'blob'
    });
    
    // Create a blob and download it
    const blob = new Blob([response.data], {
      type: params.format === 'pdf' 
        ? 'application/pdf' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    // Create filename
    const fileName = `${reportType}_report_${new Date().toISOString().split('T')[0]}.${params.format}`;
    
    // Create download link and trigger download
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};