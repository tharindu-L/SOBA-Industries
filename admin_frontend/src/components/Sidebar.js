import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Typography, 
  Avatar, 
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  useMediaQuery,
  useTheme,
  Collapse
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import './Sidebar.css';

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const [orderSubmenu, setOrderSubmenu] = useState(false);
  const location = useLocation();

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const toggleOrderSubmenu = () => {
    setOrderSubmenu(!orderSubmenu);
  };

  const handleLogout = () => {
    // Handle logout functionality
    console.log("Logging out");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Box>
      {isMobile && (
        <AppBar position="sticky" sx={{ backgroundColor: '#1a237e' }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">Admin Panel</Typography>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            background: 'linear-gradient(to bottom, #1a237e, #283593)',
            color: 'white',
          },
        }}
        variant={isMobile ? 'temporary' : 'permanent'}
        anchor="left"
        open={isMobile ? open : true}
        onClose={toggleDrawer}
      >
        {/* Header with company logo area */}
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
            <BusinessCenterIcon sx={{ fontSize: 40 }} />
          </Avatar>
          
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
            Admin Panel
          </Typography>
          
          <Chip 
            label="Administrator" 
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

        <Box sx={{ overflow: 'auto', overflowX: 'hidden', mt: 2 }}>
          <List>
            {/* Dashboard */}
            <ListItem 
              button 
              component={Link} 
              to="/dashboard"
              sx={{
                backgroundColor: isActive('/dashboard') ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive('/dashboard') ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                },
                borderRadius: '4px',
                mx: 1,
                mb: 0.5,
                position: 'relative',
                '&::before': isActive('/dashboard') ? {
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
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: '40px' }}>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            
            <Divider sx={{ my: 0.5, backgroundColor: 'rgba(255,255,255,0.1)', mx: 2 }} />
            
            {/* Orders with submenu */}
            <ListItem 
              button
              onClick={toggleOrderSubmenu}
              sx={{
                backgroundColor: orderSubmenu ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
                borderRadius: '4px',
                mx: 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: '40px' }}>
                <ShoppingCartIcon />
              </ListItemIcon>
              <ListItemText primary="Orders" />
              {orderSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItem>
            
            <Collapse in={orderSubmenu} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem 
                  button 
                  component={Link} 
                  to="/orders"
                  sx={{
                    pl: 4,
                    backgroundColor: isActive('/orders') ? 'rgba(255,255,255,0.2)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                    borderRadius: '4px',
                    mx: 1,
                    mb: 0.5,
                  }}
                >
                  <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: '40px' }}>
                    <FormatListBulletedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Normal Orders" />
                </ListItem>
                
                <ListItem 
                  button 
                  component={Link} 
                  to="/c-orders"
                  sx={{
                    pl: 4,
                    backgroundColor: isActive('/c-orders') ? 'rgba(255,255,255,0.2)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                    borderRadius: '4px',
                    mx: 1,
                    mb: 0.5,
                  }}
                >
                  <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: '40px' }}>
                    <AddShoppingCartIcon />
                  </ListItemIcon>
                  <ListItemText primary="Custom Orders" />
                </ListItem>
              </List>
            </Collapse>
            
            <Divider sx={{ my: 0.5, backgroundColor: 'rgba(255,255,255,0.1)', mx: 2 }} />
            
            {/* Bills */}
            <ListItem 
              button 
              component={Link} 
              to="/bills"
              sx={{
                backgroundColor: isActive('/bills') ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive('/bills') ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                },
                borderRadius: '4px',
                mx: 1,
                mb: 0.5,
                position: 'relative',
                '&::before': isActive('/bills') ? {
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
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: '40px' }}>
                <ReceiptIcon />
              </ListItemIcon>
              <ListItemText primary="Bills" />
            </ListItem>
            
            <Divider sx={{ my: 0.5, backgroundColor: 'rgba(255,255,255,0.1)', mx: 2 }} />
            
            {/* Create Account - keeping existing functionality */}
            <ListItem 
              button 
              component={Link} 
              to="/create-account"
              sx={{
                backgroundColor: isActive('/create-account') ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive('/create-account') ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                },
                borderRadius: '4px',
                mx: 1,
                mb: 0.5,
                position: 'relative',
                '&::before': isActive('/create-account') ? {
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
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: '40px' }}>
                <BusinessCenterIcon />
              </ListItemIcon>
              <ListItemText primary="Create Account" />
            </ListItem>
          </List>
        </Box>
        
        {/* Logout button */}
        <Box sx={{ mt: 'auto', mb: 2, mx: 2 }}>
          <ListItem 
            button 
            component={Link}
            to="/logout"
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
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItem>
        </Box>
      </Drawer>
      
      <Box sx={{ marginLeft: isMobile ? 0 : 280, transition: 'margin 0.3s' }}>
        {/* Content area */}
      </Box>
    </Box>
  );
};

export default Sidebar;