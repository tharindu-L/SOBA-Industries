import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './OrderList.css';

const CustomOrdersList = () => {
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchAllOrders();
    }, []);

    const fetchAllOrders = async () => {
        setLoading(true);
        setError('');
        
        try {
            // Fetch standard orders
            const standardResponse = await axios.get('http://localhost:4000/api/bill/orders');
            
            // Fetch custom orders from custom_order_requests table
            const customResponse = await axios.get('http://localhost:4000/api/custom-orders/all');
            
            // Format custom orders to match standard order structure
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
                designImage: order.designImage
            }));
            
            // Format standard orders to ensure consistent structure
            const formattedStandardOrders = standardResponse.data.orders.map(order => ({
                id: order.orderId,
                date: order.orderDate,
                customer: order.customerName,
                total: order.totalAmount,
                type: 'standard',
                items: order.items,
                status: order.payment_status || 'completed'
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
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterOrders(activeTab).length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-orders">No orders found</td>
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
                                    <td>{parseFloat(order.total).toFixed(2)}</td>
                                    <td>
                                        <span className={`status ${order.status.toLowerCase()}`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
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