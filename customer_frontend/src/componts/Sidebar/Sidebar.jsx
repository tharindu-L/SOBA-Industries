import { Avatar, Box, Chip, CircularProgress, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
// Removed DescriptionIcon import as it's no longer needed
import { jwtDecode } from 'jwt-decode';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, fetch user data
    if (token) {
      setLoading(true);
      
      // Use the same API endpoint that works in ProfilePage
      axios.get('http://localhost:4000/api/user/get_user', {
        headers: { token }
      })
      .then(response => {
        console.log("API Response:", response.data);
        if (response.data && response.data.user) {
          // Use customer_name from the user object
          setUsername(response.data.user.customer_name || 'Customer');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching user data:", error);
        setLoading(false);
        // If API fails, try token decoding as fallback
        try {
          const decoded = jwtDecode(token);
          console.log("Fallback to token:", decoded);
          if (decoded.id) {
            setUsername(`Customer #${decoded.id}`);
          } else {
            setUsername('Customer');
          }
        } catch (err) {
          console.error("Token decode error:", err);
          setUsername('Customer');
        }
      });
    } else {
      // Redirect to login if no token is found
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Function to check if a route is active
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        background: 'linear-gradient(to bottom, #1a237e, #283593)',
        color: 'white',
        borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          padding: '20px 10px',
          backgroundColor: 'rgba(0,0,0,0.2)'
        }}>
        <Avatar 
          sx={{ 
            bgcolor: '#fff', 
            color: '#1a237e',
            width: 70, 
            height: 70, 
            mb: 1,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}
        >
          <ShoppingBagIcon sx={{ fontSize: 40 }} />
        </Avatar>
        
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
          Customer Portal
        </Typography>
        
        {loading ? (
          <CircularProgress size={20} sx={{ color: '#fff', mt: 1 }} />
        ) : (
          <Chip 
            label={username || 'Customer'}
            variant="outlined" 
            size="small"
            sx={{ 
              color: '#fff', 
              borderColor: 'rgba(255,255,255,0.5)', 
              mt: 1,
              fontSize: '0.85rem',
              '& .MuiChip-label': {
                fontWeight: 500
              }
            }} 
          />
        )}
      </Box>
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', mx: 2 }} />
      <Box sx={{ overflow: 'auto', overflowX: 'hidden', mt: 2 }}>
        <List>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              onClick={() => navigate('/')}
              sx={{
                backgroundColor: isActiveRoute('/') ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: isActiveRoute('/') ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                },
                borderRadius: '4px',
                mx: 1,
                position: 'relative',
                '&::before': isActiveRoute('/') ? {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '60%',
                  width: '4px',
                  backgroundColor: '#fff',
                  borderRadius: '0 4px 4px 0',
                } : {}
              }}
            >
              <ListItemIcon sx={{ color: isActiveRoute('/') ? '#fff' : 'rgba(255,255,255,0.8)', minWidth: '40px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Home" 
                primaryTypographyProps={{
                  fontWeight: isActiveRoute('/') ? '600' : '400',
                  color: isActiveRoute('/') ? '#fff' : 'inherit'
                }}
              />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', mx: 2, my: 0.5 }} />

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              onClick={() => navigate('/profile')}
              sx={{
                backgroundColor: isActiveRoute('/profile') ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: isActiveRoute('/profile') ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                },
                borderRadius: '4px',
                mx: 1,
                position: 'relative',
                '&::before': isActiveRoute('/profile') ? {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '60%',
                  width: '4px',
                  backgroundColor: '#fff',
                  borderRadius: '0 4px 4px 0',
                } : {}
              }}
            >
              <ListItemIcon sx={{ color: isActiveRoute('/profile') ? '#fff' : 'rgba(255,255,255,0.8)', minWidth: '40px' }}>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Profile"
                primaryTypographyProps={{
                  fontWeight: isActiveRoute('/profile') ? '600' : '400',
                  color: isActiveRoute('/profile') ? '#fff' : 'inherit'
                }}
              />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', mx: 2, my: 0.5 }} />

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              onClick={() => navigate('/dashboard/create-new-Custom-Order')}
              sx={{
                backgroundColor: isActiveRoute('/dashboard/create-new-Custom-Order') ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: isActiveRoute('/dashboard/create-new-Custom-Order') ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                },
                borderRadius: '4px',
                mx: 1,
                position: 'relative',
                '&::before': isActiveRoute('/dashboard/create-new-Custom-Order') ? {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '60%',
                  width: '4px',
                  backgroundColor: '#fff',
                  borderRadius: '0 4px 4px 0',
                } : {}
              }}
            >
              <ListItemIcon sx={{ color: isActiveRoute('/dashboard/create-new-Custom-Order') ? '#fff' : 'rgba(255,255,255,0.8)', minWidth: '40px' }}>
                <AddShoppingCartIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Create Custom Order"
                primaryTypographyProps={{
                  fontWeight: isActiveRoute('/dashboard/create-new-Custom-Order') ? '600' : '400',
                  color: isActiveRoute('/dashboard/create-new-Custom-Order') ? '#fff' : 'inherit'
                }}
              />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', mx: 2, my: 0.5 }} />

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              onClick={() => navigate('/dashboard/invoices')}
              sx={{
                backgroundColor: isActiveRoute('/dashboard/invoices') ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: isActiveRoute('/dashboard/invoices') ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                },
                borderRadius: '4px',
                mx: 1,
                position: 'relative',
                '&::before': isActiveRoute('/dashboard/invoices') ? {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '60%',
                  width: '4px',
                  backgroundColor: '#fff',
                  borderRadius: '0 4px 4px 0',
                } : {}
              }}
            >
              <ListItemIcon sx={{ color: isActiveRoute('/dashboard/invoices') ? '#fff' : 'rgba(255,255,255,0.8)', minWidth: '40px' }}>
                <ReceiptIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Custom Orders"
                primaryTypographyProps={{
                  fontWeight: isActiveRoute('/dashboard/invoices') ? '600' : '400',
                  color: isActiveRoute('/dashboard/invoices') ? '#fff' : 'inherit'
                }}
              />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', mx: 2, my: 0.5 }} />

          {/* Removed the Bills ListItem and its Divider */}

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              onClick={() => navigate('/orders')}
              sx={{
                backgroundColor: isActiveRoute('/orders') ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: isActiveRoute('/orders') ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                },
                borderRadius: '4px',
                mx: 1,
                position: 'relative',
                '&::before': isActiveRoute('/orders') ? {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '60%',
                  width: '4px',
                  backgroundColor: '#fff',
                  borderRadius: '0 4px 4px 0',
                } : {}
              }}
            >
              <ListItemIcon sx={{ color: isActiveRoute('/orders') ? '#fff' : 'rgba(255,255,255,0.8)', minWidth: '40px' }}>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Standard Orders"
                primaryTypographyProps={{
                  fontWeight: isActiveRoute('/orders') ? '600' : '400',
                  color: isActiveRoute('/orders') ? '#fff' : 'inherit'
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      <Box sx={{ mt: 'auto', mb: 2, mx: 2 }}>
        <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', mb: 1 }} />
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleLogout}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
              },
              borderRadius: '4px',
            }}
          >
            <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: '40px' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout"
              primaryTypographyProps={{
                fontWeight: '500',
              }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );
};

export default Sidebar;
