import './OrdersComponent.css';

import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../componts/Sidebar/Sidebar'; // Import Sidebar component

const OrdersComponent = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // Set the flag and redirect to home
          localStorage.setItem('needsLogin', 'true');
          // Store the current path to redirect back after login
          localStorage.setItem('redirectAfterLogin', '/orders');
          navigate('/');
          return;
        }
        
        const response = await axios.get('http://localhost:4000/api/order/order', {
          headers: {
            token
          }
        });
        setOrders(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="orders-container" style={{ marginLeft: '280px', width: 'calc(100% - 280px)', padding: '20px' }}>
        <div className="header-with-button">
          <h2>Your Orders</h2>
          {/* Removed the "Back to Home" button */}
        </div>
        
        {orders.length === 0 ? (
          <p className="no-orders">No orders found</p>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.order_id} className="order-card">
                <div className="order-header">
                  <h3>Order #{order.order_id}</h3>
                  <div className="order-meta">
                    <span>Date: {new Date(order.order_date).toLocaleString()}</span>
                    <span className={`status ${order.current_status}`}>
                      Status: {order.current_status}
                    </span>
                    <span>Total: ${order.total_amount}</span>
                  </div>
                </div>
                
                <div className="order-details">
                  <div className="payment-info">
                    <p>Payment: {order.payment_method} ({order.payment_status})</p>
                    <p>Amount Paid: ${order.amount_paid}</p>
                  </div>
                </div>

                <div className="order-items">
                  <h4>Items:</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Product ID</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map(item => (
                        <tr key={item.order_item_id}>
                          <td>{item.product_id}</td>
                          <td>{item.quantity}</td>
                          <td>${item.unit_price}</td>
                          <td>${(item.quantity * item.unit_price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersComponent;