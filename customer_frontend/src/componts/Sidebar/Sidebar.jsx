import { Avatar, Box, Chip, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Receipt';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { jwtDecode } from 'jwt-decode';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [username, setUsername] = useState('Guest User');
  const navigate = useNavigate();
  const location = useLocation();

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
        
        <Chip 
          label={username} 
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

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              onClick={() => navigate('/dashboard/bills')}
              sx={{
                backgroundColor: isActiveRoute('/dashboard/bills') ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: isActiveRoute('/dashboard/bills') ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                },
                borderRadius: '4px',
                mx: 1,
                position: 'relative',
                '&::before': isActiveRoute('/dashboard/bills') ? {
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
              <ListItemIcon sx={{ color: isActiveRoute('/dashboard/bills') ? '#fff' : 'rgba(255,255,255,0.8)', minWidth: '40px' }}>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Bills"
                primaryTypographyProps={{
                  fontWeight: isActiveRoute('/dashboard/bills') ? '600' : '400',
                  color: isActiveRoute('/dashboard/bills') ? '#fff' : 'inherit'
                }}
              />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', mx: 2, my: 0.5 }} />

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
