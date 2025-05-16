import React, { useEffect, useState } from 'react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [filterOrderId, setFilterOrderId] = useState('');
  const [filterCustomerId, setFilterCustomerId] = useState('');

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/order/all_order');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle payment update
  const handleUpdatePayment = async (orderId) => {
    if (!formData[orderId] || isNaN(formData[orderId])) {
      alert('Please enter a valid amount');
      return;
    }

    setUpdateLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/order/update_am', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          amount_paid: parseFloat(formData[orderId])
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update payment');
      }

      await fetchOrders();
      alert('Payment updated successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesOrderId = filterOrderId 
      ? order.order_id.toString().includes(filterOrderId)
      : true;
      
    const matchesCustomerId = filterCustomerId 
      ? order.customer_id.toString().includes(filterCustomerId)
      : true;

    return matchesOrderId && matchesCustomerId;
  });

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Order Management</h1>
      
      {/* Filter Section */}
      <div className="mb-4 flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label>Order ID:</label>
          <input
            type="text"
            value={filterOrderId}
            onChange={(e) => setFilterOrderId(e.target.value)}
            className="border p-1 w-32 rounded"
            placeholder="Search Order ID"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label>Customer ID:</label>
          <input
            type="text"
            value={filterCustomerId}
            onChange={(e) => setFilterCustomerId(e.target.value)}
            className="border p-1 w-32 rounded"
            placeholder="Search Customer ID"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Order ID</th>
              <th className="py-2 px-4 border">Customer ID</th>
              <th className="py-2 px-4 border">Total Amount</th>
              <th className="py-2 px-4 border">Paid Amount</th>
              <th className="py-2 px-4 border">Payment Status</th>
              <th className="py-2 px-4 border">Update Payment</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.order_id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">{order.order_id}</td>
                <td className="py-2 px-4 border">{order.customer_id}</td>
                <td className="py-2 px-4 border">${order.total_amount}</td>
                <td className="py-2 px-4 border">${order.amount_paid}</td>
                <td className="py-2 px-4 border">
                  <span className={`px-2 py-1 rounded ${
                    order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                    order.payment_status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.payment_status}
                  </span>
                </td>
                <td className="py-2 px-4 border">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={order.total_amount}
                      value={formData[order.order_id] || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        [order.order_id]: e.target.value
                      })}
                      className="border p-1 w-24"
                      placeholder="New amount"
                    />
                    <button
                      onClick={() => handleUpdatePayment(order.order_id)}
                      disabled={updateLoading}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                      {updateLoading ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;