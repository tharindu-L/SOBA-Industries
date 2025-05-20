import { Box, Button, FormControl, FormControlLabel, IconButton, Modal, Paper, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete'; // Fixed the import path
import RemoveIcon from '@mui/icons-material/Remove';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('full');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [paymentError, setPaymentError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Instead of directly navigating, set the flag and redirect to home
      localStorage.setItem('needsLogin', 'true');
      // Store the current path to redirect back after login
      localStorage.setItem('redirectAfterLogin', '/cart');
      navigate('/');
      return;
    }

    const items = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(items);
    setLoading(false);
  }, [navigate]);

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = cartItems.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const removeItem = (productId) => {
    const updatedItems = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleOpenPaymentModal = () => {
    setPaymentError('');
    setOpenPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false);
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentError('');
    
    // Basic validation
    if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardName) {
      setPaymentError('Please fill all card details');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      // Make sure this section uses the popup approach
      localStorage.setItem('needsLogin', 'true');
      localStorage.setItem('redirectAfterLogin', '/cart');
      navigate('/');
      return;
    }

    try {
      const paymentData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        paymentMethod
      };

      const response = await fetch('http://localhost:4000/api/order/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           token
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment processing failed');
      }

      // Payment successful
      localStorage.removeItem('cart');
      setCartItems([]);
      setOpenPaymentModal(false);
      navigate('/orders', { 
        state: { 
          orderId: data.orderId,
          amountPaid: data.amountPaid,
          paymentMethod
        }
      });
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading cart...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 5 }}>
        <Typography variant="h5" gutterBottom>Your Cart is Empty</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>Your Shopping Cart</Typography>
      
      <Box sx={{ display: 'grid', gap: 3 }}>
        {cartItems.map(item => (
          <Paper key={item.productId} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ width: 100, height: 100 }}>
              <img 
                src={`http://localhost:4000/images/${item.productImage}`} 
                alt={item.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                }}
              />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">{item.name}</Typography>
              <Typography variant="body2" color="text.secondary">{item.category}</Typography>
              <Typography variant="body1" fontWeight="bold">LKR {item.price}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton 
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <RemoveIcon />
              </IconButton>
              
              <Typography>{item.quantity}</Typography>
              
              <IconButton 
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              >
                <AddIcon />
              </IconButton>
            </Box>
            
            <Typography variant="h6" sx={{ minWidth: 80, textAlign: 'right' }}>
              LKR {(item.price * item.quantity).toFixed(2)}
            </Typography>
            
            <IconButton 
              onClick={() => removeItem(item.productId)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Paper>
        ))}
      </Box>
      
      <Paper sx={{ mt: 4, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">
          Total: LKR {calculateTotal()}
          {paymentMethod === 'advance' && (
            <Typography variant="body2" color="text.secondary">
              (30% advance: LKR {(parseFloat(calculateTotal()) * 0.3).toFixed(2)})
            </Typography>
          )}
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          sx={{ fontWeight: 'bold' }}
          onClick={handleOpenPaymentModal}
        >
          Proceed to Checkout
        </Button>
      </Paper>

      <Modal
        open={openPaymentModal}
        onClose={handleClosePaymentModal}
        aria-labelledby="payment-modal-title"
        aria-describedby="payment-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Typography id="payment-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
            Payment Details
          </Typography>
          
          {paymentError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {paymentError}
            </Typography>
          )}
          
          <form onSubmit={handlePaymentSubmit}>
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <RadioGroup
                aria-label="payment method"
                name="paymentMethod"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <FormControlLabel 
                  value="full" 
                  control={<Radio />} 
                  label={`Full Payment (LKR ${calculateTotal()})`} 
                />
                <FormControlLabel 
                  value="advance" 
                  control={<Radio />} 
                  label={`30% Advance (LKR ${(parseFloat(calculateTotal()) * 0.3).toFixed(2)})`} 
                />
              </RadioGroup>
            </FormControl>
            
            <TextField
              fullWidth
              label="Card Number"
              name="cardNumber"
              value={cardDetails.cardNumber}
              onChange={handleCardChange}
              placeholder="1234 5678 9012 3456"
              sx={{ mb: 2 }}
              required
            />
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Expiry Date"
                name="expiryDate"
                value={cardDetails.expiryDate}
                onChange={handleCardChange}
                placeholder="MM/YY"
                required
              />
              <TextField
                fullWidth
                label="CVV"
                name="cvv"
                value={cardDetails.cvv}
                onChange={handleCardChange}
                placeholder="123"
                required
              />
            </Box>
            
            <TextField
              fullWidth
              label="Cardholder Name"
              name="cardName"
              value={cardDetails.cardName}
              onChange={handleCardChange}
              sx={{ mb: 3 }}
              required
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={handleClosePaymentModal}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
              >
                Pay {paymentMethod === 'advance' ? '30% Advance' : 'Full Amount'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};

export default Cart;