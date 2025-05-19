import React, { useEffect, useState } from 'react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [filterOrderId, setFilterOrderId] = useState('');
  const [filterCustomerId, setFilterCustomerId] = useState('');
  const [isAdditionalPayment, setIsAdditionalPayment] = useState(true);

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

    const order = orders.find(o => o.order_id === orderId);
    if (!order) return;

    const paymentAmount = parseFloat(formData[orderId]);
    // Calculate the new amount based on selection mode
    const newAmountPaid = isAdditionalPayment ? 
      parseFloat(order.amount_paid || 0) + paymentAmount : 
      paymentAmount;

    // Validate payment doesn't exceed total
    if (newAmountPaid > parseFloat(order.total_amount)) {
      alert(`Payment cannot exceed total amount of $${order.total_amount}`);
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
          amount_paid: newAmountPaid
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update payment');
      }

      await fetchOrders();
      alert('Payment updated successfully!');
      // Clear the input after successful update
      setFormData({
        ...formData,
        [orderId]: ''
      });
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

      {/* Payment Mode Selection */}
      <div className="mb-4">
        <div className="flex items-center space-x-4">
          <label className="font-medium">Payment Mode:</label>
          <div className="flex items-center">
            <input
              type="radio"
              id="additionalPayment"
              name="paymentMode"
              checked={isAdditionalPayment}
              onChange={() => setIsAdditionalPayment(true)}
              className="mr-1"
            />
            <label htmlFor="additionalPayment">Additional Payment</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="setPayment"
              name="paymentMode"
              checked={!isAdditionalPayment}
              onChange={() => setIsAdditionalPayment(false)}
              className="mr-1"
            />
            <label htmlFor="setPayment">Set Total Payment</label>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {isAdditionalPayment 
            ? "The entered amount will be added to the current paid amount" 
            : "The entered amount will replace the current paid amount"}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Order ID</th>
              <th className="py-2 px-4 border">Customer ID</th>
              <th className="py-2 px-4 border">Total Amount</th>
              <th className="py-2 px-4 border">Paid Amount</th>
              <th className="py-2 px-4 border">Remaining</th>
              <th className="py-2 px-4 border">Payment Status</th>
              <th className="py-2 px-4 border">Update Payment</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => {
              const totalAmount = parseFloat(order.total_amount || 0);
              const amountPaid = parseFloat(order.amount_paid || 0);
              const remainingAmount = totalAmount - amountPaid;
              
              return (
                <tr key={order.order_id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border">{order.order_id}</td>
                  <td className="py-2 px-4 border">{order.customer_id}</td>
                  <td className="py-2 px-4 border">${totalAmount.toFixed(2)}</td>
                  <td className="py-2 px-4 border">${amountPaid.toFixed(2)}</td>
                  <td className="py-2 px-4 border">${remainingAmount.toFixed(2)}</td>
                  <td className="py-2 px-4 border">
                    <span className={`px-2 py-1 rounded ${
                      amountPaid >= totalAmount ? 'bg-green-100 text-green-800' :
                      amountPaid > 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {amountPaid >= totalAmount ? 'paid' :
                       amountPaid > 0 ? 'partially_paid' : 'pending'}
                    </span>
                  </td>
                  <td className="py-2 px-4 border">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={isAdditionalPayment ? remainingAmount : totalAmount}
                        value={formData[order.order_id] || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          [order.order_id]: e.target.value
                        })}
                        className="border p-1 w-24"
                        placeholder={isAdditionalPayment ? "Add amount" : "Set amount"}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;