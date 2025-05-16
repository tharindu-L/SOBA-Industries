import { Badge } from '@mui/material';
import { Link } from 'react-router-dom';
import React from 'react';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const CartIcon = () => {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit' }}>
      <Badge badgeContent={itemCount} color="error" overlap="circular">
        <ShoppingCartIcon style={{ fontSize: 30 }} />
      </Badge>
    </Link>
  );
};

export default CartIcon;