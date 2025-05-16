import './CustomOrdersList.css';

import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CustomOrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCustomOrders();
    }, []);

    const fetchCustomOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:4000/api/custom-orders');
            setOrders(response.data.requests);
        } catch (err) {
            console.error('Error fetching custom orders:', err);
            setError('Failed to load custom orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            pending: 'status-pending',
            approved: 'status-approved',
            rejected: 'status-rejected',
            completed: 'status-completed'
        };
        return (
            <span className={`status-badge ${statusClasses[status]}`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="custom-orders-container">
            <div className="header">
                <h1>Custom Order Requests</h1>
                <button 
                    className="new-order-btn"
                    onClick={() => navigate('/custom-orders/new')}
                >
                    + New Request
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading orders...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : orders.length === 0 ? (
                <div className="no-orders">No custom order requests found</div>
            ) : (
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Request ID</th>
                            <th>Customer</th>
                            <th>Item Type</th>
                            <th>Quantity</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.requestId}>
                                <td>{order.requestId}</td>
                                <td>{order.customerName}</td>
                                <td className="capitalize">{order.itemType}</td>
                                <td>{order.quantity}</td>
                                <td>${order.totalAmount.toFixed(2)}</td>
                                <td>{getStatusBadge(order.status)}</td>
                                <td>{formatDate(order.createdAt)}</td>
                                <td>
                                    <button 
                                        className="view-btn"
                                        onClick={() => navigate(`/custom-orders/${order.requestId}`)}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CustomOrdersList;