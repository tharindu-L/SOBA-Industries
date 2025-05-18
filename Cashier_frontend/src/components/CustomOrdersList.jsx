import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomOrdersList.css';

const CustomOrdersList = () => {
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [remainingPayment, setRemainingPayment] = useState({});
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Fetch custom orders
            const customResponse = await axios.get('http://localhost:4000/api/custom-orders/all');
            
            // Fetch standard orders
            const standardResponse = await axios.get('http://localhost:4000/api/bill/orders');
            
            // Format custom orders to ensure consistent structure
            const formattedCustomOrders = customResponse.data.orders.map(order => ({
                id: order.requestId,
                date: order.createdAt,
                customer: order.customerName,
                total: order.totalAmount,
                type: 'custom',
                items: [{
                    name: order.itemType,
                    quantity: order.quantity,
                    price: order.unitPrice
                }],
                status: order.status || 'pending',
                description: order.description,
                designImage: order.designImage,
                // Add payment information
                paymentMethod: order.paymentMethod || 'full',
                totalAmount: parseFloat(order.totalAmount || 0),
                amountPaid: parseFloat(order.amountPaid || 0),
                paymentStatus: order.paymentStatus || (
                    order.amountPaid >= order.totalAmount ? 'paid' : 
                    order.amountPaid > 0 ? 'partially_paid' : 'pending'
                )
            }));
            
            // Format standard orders to ensure consistent structure
            const formattedStandardOrders = standardResponse.data.orders.map(order => ({
                id: order.orderId,
                date: order.orderDate,
                customer: order.customerName,
                total: order.totalAmount,
                type: 'standard',
                items: order.items,
                status: order.payment_status || 'completed',
                paymentStatus: 'paid',
                totalAmount: parseFloat(order.totalAmount),
                amountPaid: parseFloat(order.totalAmount)
            }));
            
            // Combine both types of orders
            const combinedOrders = [...formattedStandardOrders, ...formattedCustomOrders];
            
            // Sort by date (newest first)
            combinedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            console.log("Combined orders:", combinedOrders);
            setAllOrders(combinedOrders);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSubmit = async (orderId) => {
        if (!remainingPayment[orderId]) {
            alert('Please enter a valid payment amount');
            return;
        }

        setProcessingPayment(true);
        try {
            const order = allOrders.find(o => o.id === orderId);
            const paymentAmount = parseFloat(remainingPayment[orderId]);
            const remainingTotal = order.totalAmount - order.amountPaid;

            if (paymentAmount <= 0 || paymentAmount > remainingTotal) {
                alert(`Please enter a valid amount between $0.01 and $${remainingTotal.toFixed(2)}`);
                setProcessingPayment(false);
                return;
            }

            // Make API call to update the payment
            const response = await axios.post(
                'http://localhost:4000/api/custom-orders/update-payment',
                {
                    orderId,
                    paymentAmount
                }
            );

            if (response.data.success) {
                alert(`Payment of $${paymentAmount.toFixed(2)} successfully processed.`);
                // Refresh orders list
                fetchOrders();
                // Clear payment input
                setRemainingPayment(prev => ({
                    ...prev,
                    [orderId]: ''
                }));
            } else {
                alert(response.data.message || 'Failed to process payment');
            }
        } catch (err) {
            console.error('Error processing payment:', err);
            alert('Error processing payment. Please try again.');
        } finally {
            setProcessingPayment(false);
        }
    };

    const calculateRemaining = (order) => {
        const total = parseFloat(order.totalAmount || 0);
        const paid = parseFloat(order.amountPaid || 0);
        return (total - paid).toFixed(2);
    };

    const filterOrders = (type) => {
        if (type === 'all') return allOrders;
        return allOrders.filter(order => order.type === type);
    };

    if (loading) return <div className="loading">Loading orders...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="orders-list-container">
            <h1>Order History</h1>
            
            <div className="order-tabs">
                <button 
                    className={activeTab === 'all' ? 'active' : ''} 
                    onClick={() => setActiveTab('all')}
                >
                    All Orders
                </button>
                <button 
                    className={activeTab === 'standard' ? 'active' : ''} 
                    onClick={() => setActiveTab('standard')}
                >
                    Standard Orders
                </button>
                <button 
                    className={activeTab === 'custom' ? 'active' : ''} 
                    onClick={() => setActiveTab('custom')}
                >
                    Custom Orders
                </button>
            </div>
            
            <div className="orders-table-container">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Type</th>
                            <th>Items</th>
                            <th>Total (LKR)</th>
                            <th>Payment Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterOrders(activeTab).length === 0 ? (
                            <tr>
                                <td colSpan="8" className="no-orders">No orders found</td>
                            </tr>
                        ) : (
                            filterOrders(activeTab).map((order) => (
                                <tr key={`${order.type}-${order.id}`}>
                                    <td>{order.id}</td>
                                    <td>{new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString()}</td>
                                    <td>{order.customer}</td>
                                    <td>
                                        <span className={`order-type ${order.type}`}>
                                            {order.type === 'standard' ? 'Standard' : 'Custom'}
                                        </span>
                                    </td>
                                    <td>
                                        {order.type === 'standard' ? (
                                            <div className="item-list">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="item-entry">
                                                        {item.name} × {item.quantity}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="item-list">
                                                <div className="item-entry">
                                                    {order.items[0].name} × {order.items[0].quantity}
                                                </div>
                                                {order.description && (
                                                    <div className="item-description">
                                                        <small>{order.description.substring(0, 30)}{order.description.length > 30 ? '...' : ''}</small>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td>{parseFloat(order.totalAmount || order.total).toFixed(2)}</td>
                                    <td>
                                        <span className={`payment-status ${(order.paymentStatus || '').toLowerCase()}`}>
                                            {order.paymentStatus === 'paid' ? 'Paid in Full' : 
                                             order.paymentStatus === 'partially_paid' ? '30% Advance Paid' : 
                                             'Payment Pending'}
                                        </span>
                                        {order.paymentStatus === 'partially_paid' && (
                                            <div className="remaining-amount">
                                                <small>Remaining: ${calculateRemaining(order)}</small>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        {order.type === 'custom' && order.paymentStatus === 'partially_paid' && (
                                            <div className="payment-action">
                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    placeholder="Amount"
                                                    value={remainingPayment[order.id] || ''}
                                                    onChange={(e) => setRemainingPayment({
                                                        ...remainingPayment,
                                                        [order.id]: e.target.value
                                                    })}
                                                    disabled={processingPayment}
                                                />
                                                <button
                                                    onClick={() => handlePaymentSubmit(order.id)}
                                                    disabled={processingPayment}
                                                    className="complete-payment-btn"
                                                >
                                                    {processingPayment ? 'Processing...' : 'Complete Payment'}
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomOrdersList;