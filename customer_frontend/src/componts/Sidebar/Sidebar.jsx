import { Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [username, setUsername] = useState('Guest User');
  const navigate = useNavigate();

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, try to decode it
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if we have a customer name from token payload
        if (decoded.name) {
          setUsername(decoded.name);
        } else if (decoded.customer_name) {
          setUsername(decoded.customer_name);
        } else if (decoded.email) {
          // Use email if name is not available
          setUsername(decoded.email.split('@')[0]);
        }
        
        // For debugging
        console.log("Decoded token:", decoded);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      // Redirect to login if no token is found
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <Box
      sx={{
        width: 240,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        bgcolor: 'background.paper',
        borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <AccountCircleIcon fontSize="large" sx={{ mr: 1 }} />
        <Typography variant="h6">{username}</Typography>
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/')}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/profile')}>
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/dashboard/create-new-Custom-Order')}>
            <ListItemIcon>
              <AddShoppingCartIcon />
            </ListItemIcon>
            <ListItemText primary="Create Custom Order" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/dashboard/invoices')}>
            <ListItemIcon>
              <ReceiptIcon />
            </ListItemIcon>
            <ListItemText primary="Invoices" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/dashboard/bills')}>
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText primary="Bills" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/orders')}>
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="My Orders" />
          </ListItemButton>
        </ListItem>
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
