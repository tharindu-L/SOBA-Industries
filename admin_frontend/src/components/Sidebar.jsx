import './Sidebar.css';

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import InfoIcon from '@mui/icons-material/Info';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { assets } from '../assest/assest';

// Icons


















const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const [orderSubmenu, setOrderSubmenu] = useState(false);
  const location = useLocation();
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Determine if the current path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const toggleOrderSubmenu = () => {
    setOrderSubmenu(!orderSubmenu);
  };

  // Sidebar menu items with nested structure
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard'
    },
    {
      text: 'Orders',
      icon: <ShoppingCartIcon />,
      hasSubmenu: true,
      items: [
        { text: 'Normal Orders', icon: <ListAltIcon />, path: '/orders' },
        { text: 'Custom Orders', icon: <AddShoppingCartIcon />, path: '/c-orders' }
      ]
    },
    {
      text: 'Billing',
      icon: <ReceiptIcon />,
      path: '/bills'
    },
    // Removed the invoices tab
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar for mobile */}
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={toggleDrawer}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                Tour Management
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton color="inherit" size="large">
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <IconButton color="inherit" size="large" sx={{ ml: 1 }}>
                <AccountCircleIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? open : true}
        onClose={toggleDrawer}
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            backgroundImage: 'linear-gradient(180deg, #2A3F54 0%, #1A2A38 100%)',
            color: 'white',
            boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        <Toolbar sx={{ display: isMobile ? 'block' : 'none' }} />
        
        {/* Brand and profile section */}
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: '#fff' }}>
            Admin System
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', my: 2 }}>
            <Avatar
              src={assets.profile}
              alt="Profile Picture"
              sx={{ 
                width: 100, 
                height: 100,
                border: '3px solid #fff',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}
            />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
              John Doe
            </Typography>
            <Typography variant="caption" sx={{ color: '#bbb' }}>
              Administrator
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
        
        {/* Navigation menu */}
        <Box sx={{ overflow: 'auto', p: 1 }}>
          <List component="nav" sx={{ pt: 0 }}>
            {menuItems.map((item) => (
              <React.Fragment key={item.text}>
                {item.hasSubmenu ? (
                  <>
                    <ListItem disablePadding>
                      <ListItemButton 
                        onClick={toggleOrderSubmenu}
                        sx={{ 
                          borderRadius: 1,
                          mb: 0.5,
                          backgroundColor: orderSubmenu ? 'rgba(255,255,255,0.1)' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.15)',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                        {orderSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </ListItemButton>
                    </ListItem>
                    
                    <Collapse in={orderSubmenu} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.items.map((subItem) => (
                          <ListItemButton
                            key={subItem.text}
                            component={Link}
                            to={subItem.path}
                            selected={isActive(subItem.path)}
                            sx={{
                              pl: 4,
                              py: 0.5,
                              borderRadius: 1,
                              ml: 2,
                              mb: 0.5,
                              backgroundColor: isActive(subItem.path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                              '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.15)',
                              },
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(255,255,255,0.2)',
                              },
                            }}
                          >
                            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                              {subItem.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={subItem.text} 
                              primaryTypographyProps={{ fontSize: '0.9rem' }}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  </>
                ) : (
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      component={Link}
                      to={item.path}
                      selected={isActive(item.path)}
                      sx={{
                        borderRadius: 1,
                        backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.15)',
                        },
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(255,255,255,0.2)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  </ListItem>
                )}
              </React.Fragment>
            ))}
            
            <Divider sx={{ my: 2, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            
            {/* Logout button */}
            <ListItem disablePadding>
              <ListItemButton
                sx={{
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255,0,0,0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: '#ff6b6b', minWidth: 40 }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main content area with proper spacing */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          width: '100%',
          minHeight: '100vh',
          backgroundColor: '#f5f6fa',
          marginLeft: isMobile ? 0 : 0,
          paddingTop: isMobile ? 8 : 3,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Toolbar spacer only for mobile */}
        {isMobile && <Toolbar />}
        
        {/* Content will be rendered here by React Router */}
      </Box>
    </Box>
  );
};

export default Sidebar;