import './OrderList.css';

import { useEffect, useState } from 'react';

import axios from 'axios';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        customerName: ''
    });

    useEffect(() => {
        fetchOrders();
    }, [filters]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:4000/api/bill/orders');
            setOrders(response.data.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            alert('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Apply filters locally
    const filteredOrders = orders.filter(order => {
        const matchesDate = (filters.startDate === '' || new Date(order.orderDate) >= new Date(filters.startDate)) &&
                           (filters.endDate === '' || new Date(order.orderDate) <= new Date(filters.endDate));
        const matchesName = filters.customerName === '' || 
                            order.customerName.toLowerCase().includes(filters.customerName.toLowerCase());
        return matchesDate && matchesName;
    });

    return (
        <div className="order-list-container">
            <h1>Order History</h1>
            
            {/* Filters */}
            <div className="filters">
                <div className="filter-group">
                    <label>From Date:</label>
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                    />
                </div>
                
                <div className="filter-group">
                    <label>To Date:</label>
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                    />
                </div>
                
                <div className="filter-group">
                    <label>Customer Name:</label>
                    <input
                        type="text"
                        name="customerName"
                        value={filters.customerName}
                        onChange={handleFilterChange}
                        placeholder="Search customer..."
                    />
                </div>
                
                <button 
                    onClick={() => setFilters({ startDate: '', endDate: '', customerName: '' })}
                    className="clear-filters"
                >
                    Clear Filters
                </button>
            </div>
            
            {/* Orders Table */}
            {loading ? (
                <div className="loading">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
                <div className="no-orders">No orders found</div>
            ) : (
                <div className="orders-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Payment Method</th>
                                <th>Items</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order.orderId}>
                                    <td>{order.orderId}</td>
                                    <td>{formatDate(order.orderDate)}</td>
                                    <td>{order.customerName}</td>
                                    <td>{order.paymentMethod}</td>
                                    <td>
                                        <ul className="order-items">
                                            {order.items.map(item => (
                                                <li key={`${order.orderId}-${item.productId}`}>
                                                    {item.name} (x{item.quantity}) - ${item.price.toFixed(2)}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td>${order.totalAmount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrderList;