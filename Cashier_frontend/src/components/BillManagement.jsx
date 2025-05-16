import React, { useEffect, useState } from 'react';

import axios from 'axios';

const InvoiceSection = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentInputs, setPaymentInputs] = useState({});
  const [processing, setProcessing] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    customerId: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get(
          'http://localhost:4000/api/quotation/get_all'
        );
        setInvoices(response.data.invoices);
        setFilteredInvoices(response.data.invoices);
        setLoading(false);
      } catch (err) {
        setError('Failed to load invoices. Please try again later.');
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, invoices]);

  const applyFilters = () => {
    let result = [...invoices];
    
    // Filter by payment status
    if (filters.status !== 'all') {
      result = result.filter(invoice => invoice.payment_status === filters.status);
    }
    
    // Filter by customer ID
    if (filters.customerId) {
      result = result.filter(invoice => 
        invoice.customer_id.toString().includes(filters.customerId)
      );
    }
    
    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter(invoice => new Date(invoice.created_at) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of the day
      result = result.filter(invoice => new Date(invoice.created_at) <= toDate);
    }
    
    // Filter by search term (job description or invoice ID)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(invoice => 
        invoice.job_description.toLowerCase().includes(searchLower) ||
        invoice.invoice_id.toString().includes(searchLower)
      );
    }
    
    setFilteredInvoices(result);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      customerId: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
  };

  const handlePaymentSubmit = async (invoiceId) => {
    if (!paymentInputs[invoiceId] || paymentInputs[invoiceId] <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    setProcessing(true);
    try {
      await axios.post(
        'http://localhost:4000/api/quotation/invoice_payment',
        {
          invoiceId,
          paymentAmount: paymentInputs[invoiceId]
        }
      );

      // Refresh invoices after successful payment
      const response = await axios.get(
        'http://localhost:4000/api/quotation/get_all'
      );
      setInvoices(response.data.invoices);
      setPaymentInputs(prev => ({ ...prev, [invoiceId]: '' }));
    } catch (err) {
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const calculateRemaining = (invoice) => {
    const total = parseFloat(invoice.total_amount);
    const paid = parseFloat(invoice.paid_amount);
    return (total - paid).toFixed(2);
  };

  // Inline styles
  const styles = {
    invoiceSection: {
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    headerContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    heading: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    countText: {
      fontSize: '0.875rem',
      color: '#4b5563'
    },
    filterSection: {
      backgroundColor: 'white',
      padding: '1rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      marginBottom: '1.5rem'
    },
    filterGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1rem',
      marginBottom: '1rem'
    },
    filterLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.25rem'
    },
    filterInput: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      outline: 'none'
    },
    filterRow: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      alignItems: 'flex-end'
    },
    searchContainer: {
      flexGrow: 1
    },
    resetButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#e5e7eb',
      color: '#4b5563',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer'
    },
    noInvoices: {
      textAlign: 'center',
      padding: '2rem 0',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
    },
    noInvoicesText: {
      color: '#4b5563'
    },
    invoicesGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1.5rem'
    },
    invoiceCard: {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      border: '1px solid #e5e7eb'
    },
    invoiceHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb'
    },
    invoiceId: {
      fontSize: '1.125rem',
      fontWeight: '600'
    },
    statusBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    completedBadge: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    partialBadge: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    pendingBadge: {
      backgroundColor: '#fee2e2',
      color: '#991b1b'
    },
    invoiceDetails: {
      padding: '1rem'
    },
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.5rem',
      marginBottom: '0.5rem'
    },
    detailLabel: {
      fontSize: '0.875rem',
      color: '#4b5563'
    },
    detailValue: {
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    remainingValue: {
      fontSize: '0.875rem',
      fontWeight: '700',
      color: '#2563eb'
    },
    jobSection: {
      paddingTop: '0.5rem'
    },
    invoiceItems: {
      padding: '0.75rem 1rem',
      backgroundColor: '#f9fafb',
      borderTop: '1px solid #e5e7eb'
    },
    itemsHeading: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    itemRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.875rem',
      marginBottom: '0.5rem'
    },
    itemQuantity: {
      color: '#4b5563'
    },
    paymentForm: {
      padding: '1rem',
      borderTop: '1px solid #e5e7eb'
    },
    paymentRow: {
      display: 'flex',
      gap: '0.5rem'
    },
    paymentInput: {
      flexGrow: 1,
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      outline: 'none'
    },
    paymentButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#2563eb',
      color: 'white',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer'
    },
    paymentButtonDisabled: {
      backgroundColor: '#93c5fd',
      cursor: 'not-allowed'
    },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '16rem'
    },
    loadingText: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#4b5563'
    },
    error: {
      backgroundColor: '#fee2e2',
      borderLeft: '4px solid #ef4444',
      color: '#b91c1c',
      padding: '1rem',
      margin: '1rem 0'
    }
  };

  // Media query styles for responsive design
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      // Update grid columns based on window width
      if (width >= 768) { // md breakpoint
        document.querySelectorAll('.filter-grid').forEach(element => {
          element.style.gridTemplateColumns = 'repeat(2, 1fr)';
        });
        document.querySelectorAll('.invoices-grid').forEach(element => {
          element.style.gridTemplateColumns = 'repeat(2, 1fr)';
        });
        document.querySelectorAll('.filter-row').forEach(element => {
          element.style.flexDirection = 'row';
        });
      } else {
        document.querySelectorAll('.filter-grid').forEach(element => {
          element.style.gridTemplateColumns = '1fr';
        });
        document.querySelectorAll('.invoices-grid').forEach(element => {
          element.style.gridTemplateColumns = '1fr';
        });
        document.querySelectorAll('.filter-row').forEach(element => {
          element.style.flexDirection = 'column';
        });
      }
      
      if (width >= 1024) { // lg breakpoint
        document.querySelectorAll('.filter-grid').forEach(element => {
          element.style.gridTemplateColumns = 'repeat(4, 1fr)';
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (loading) return (
    <div style={styles.loading}>
      <div style={styles.loadingText}>Loading invoices...</div>
    </div>
  );
  
  if (error) return (
    <div style={styles.error} role="alert">
      <p>{error}</p>
    </div>
  );

  return (
    <div style={styles.invoiceSection}>
      <div style={styles.headerContainer}>
        <h2 style={styles.heading}>Invoices</h2>
        <div style={styles.countText}>
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </div>
      </div>

      {/* Filter Section */}
      <div style={styles.filterSection}>
        <div style={styles.filterGrid} className="filter-grid">
          <div>
            <label style={styles.filterLabel}>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              style={styles.filterInput}
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label style={styles.filterLabel}>Customer ID</label>
            <input
              type="text"
              name="customerId"
              value={filters.customerId}
              onChange={handleFilterChange}
              placeholder="Enter Customer ID"
              style={styles.filterInput}
            />
          </div>
          
          <div>
            <label style={styles.filterLabel}>From Date</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              style={styles.filterInput}
            />
          </div>
          
          <div>
            <label style={styles.filterLabel}>To Date</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              style={styles.filterInput}
            />
          </div>
        </div>
        
        <div style={styles.filterRow} className="filter-row">
          <div style={styles.searchContainer}>
            <label style={styles.filterLabel}>Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by invoice ID or job description"
              style={styles.filterInput}
            />
          </div>
          
          <button
            onClick={resetFilters}
            style={styles.resetButton}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div style={styles.noInvoices}>
          <p style={styles.noInvoicesText}>No invoices found matching your filters.</p>
        </div>
      ) : (
        <div style={styles.invoicesGrid} className="invoices-grid">
          {filteredInvoices.map((invoice) => {
            // Determine status badge style
            let statusStyle = { ...styles.statusBadge };
            if (invoice.payment_status === 'Completed') {
              statusStyle = { ...statusStyle, ...styles.completedBadge };
            } else if (invoice.payment_status === 'Partial') {
              statusStyle = { ...statusStyle, ...styles.partialBadge };
            } else {
              statusStyle = { ...statusStyle, ...styles.pendingBadge };
            }

            return (
              <div key={invoice.invoice_id} style={styles.invoiceCard}>
                <div style={styles.invoiceHeader}>
                  <h3 style={styles.invoiceId}>Invoice #{invoice.invoice_id}</h3>
                  <span style={statusStyle}>
                    {invoice.payment_status}
                  </span>
                </div>

                <div style={styles.invoiceDetails}>
                  <div style={styles.detailsGrid}>
                    <div style={styles.detailLabel}>Customer ID:</div>
                    <div style={styles.detailValue}>{invoice.customer_id}</div>
                    
                    <div style={styles.detailLabel}>Created Date:</div>
                    <div style={styles.detailValue}>{new Date(invoice.created_at).toLocaleDateString()}</div>
                    
                    <div style={styles.detailLabel}>Total Amount:</div>
                    <div style={styles.detailValue}>${parseFloat(invoice.total_amount).toFixed(2)}</div>
                    
                    <div style={styles.detailLabel}>Paid Amount:</div>
                    <div style={styles.detailValue}>${parseFloat(invoice.paid_amount).toFixed(2)}</div>
                    
                    <div style={styles.detailLabel}>Remaining:</div>
                    <div style={styles.remainingValue}>${calculateRemaining(invoice)}</div>
                  </div>
                  
                  <div style={styles.jobSection}>
                    <div style={styles.detailLabel}>Job Description:</div>
                    <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{invoice.job_description}</div>
                  </div>
                </div>

                <div style={styles.invoiceItems}>
                  <h4 style={styles.itemsHeading}>Items:</h4>
                  <div>
                    {invoice.items.map((item, index) => (
                      <div key={index} style={styles.itemRow}>
                        <span style={{ flexGrow: 1 }}>{item.material_name}</span>
                        <span style={styles.itemQuantity}>{item.quantity} x ${item.unit_price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {invoice.payment_status !== 'Completed' && (
                  <div style={styles.paymentForm}>
                    <div style={styles.paymentRow}>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={paymentInputs[invoice.invoice_id] || ''}
                        onChange={(e) => setPaymentInputs({
                          ...paymentInputs,
                          [invoice.invoice_id]: e.target.value
                        })}
                        placeholder="Enter payment amount"
                        disabled={processing}
                        style={styles.paymentInput}
                      />
                      <button
                        onClick={() => handlePaymentSubmit(invoice.invoice_id)}
                        disabled={processing}
                        style={processing ? {...styles.paymentButton, ...styles.paymentButtonDisabled} : styles.paymentButton}
                      >
                        {processing ? 'Processing...' : 'Add Payment'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InvoiceSection;