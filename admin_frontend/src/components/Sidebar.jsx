import './Sidebar.css';

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Chip,
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
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
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
import AssessmentIcon from '@mui/icons-material/Assessment'; // Add this import for Reports icon

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const [orderSubmenu, setOrderSubmenu] = useState(false);
  const location = useLocation();
  const [username, setUsername] = useState('John Doe');
  const [loading, setLoading] = useState(false);
  
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    // Navigation will be handled by existing logic
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
        { text: 'Standard Orders', icon: <ListAltIcon />, path: '/orders' },
        { text: 'Custom Orders', icon: <AddShoppingCartIcon />, path: '/c-orders' }
      ]
    },
    {
      text: 'Billing',
      icon: <ReceiptIcon />,
      path: '/bills'
    },
    {
      text: 'Reports',
      icon: <AssessmentIcon />,
      path: '/reports'
    }
  ];

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
            <Typography variant="h6">Admin Management</Typography>
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
        ModalProps={{
          keepMounted: true,  
        }}
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
            Admin Management
          </Typography>
          
          <Chip 
            label={loading ? "Loading..." : username} 
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
            {menuItems.map((item, index) => {
              if (item.hasSubmenu) {
                return (
                  <React.Fragment key={item.text}>
                    <ListItem 
                      button
                      onClick={toggleOrderSubmenu}
                      sx={{
                        backgroundColor: orderSubmenu ? 'rgba(255,255,255,0.2)' : 'transparent',
                        '&:hover': {
                          backgroundColor: orderSubmenu ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                        },
                        borderRadius: '4px',
                        mx: 1,
                        mb: 0.5,
                        position: 'relative',
                        '&::before': orderSubmenu ? {
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
                      <ListItemIcon 
                        sx={{ 
                          color: orderSubmenu ? '#fff' : 'rgba(255,255,255,0.8)', 
                          minWidth: '40px' 
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{
                          fontWeight: orderSubmenu ? '600' : '400',
                          color: orderSubmenu ? '#fff' : 'inherit'
                        }}
                      />
                      {orderSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </ListItem>
                    
                    <Collapse in={orderSubmenu} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.items.map((subItem) => {
                          const isSubActive = isActive(subItem.path);
                          return (
                            <ListItem 
                              button 
                              component={Link} 
                              to={subItem.path}
                              key={subItem.text}
                              sx={{
                                backgroundColor: isSubActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                                '&:hover': {
                                  backgroundColor: isSubActive ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                                },
                                borderRadius: '4px',
                                mx: 1,
                                pl: 4,
                                mb: 0.5,
                                position: 'relative',
                                '&::before': isSubActive ? {
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
                              <ListItemIcon 
                                sx={{ 
                                  color: isSubActive ? '#fff' : 'rgba(255,255,255,0.8)', 
                                  minWidth: '40px' 
                                }}
                              >
                                {subItem.icon}
                              </ListItemIcon>
                              <ListItemText 
                                primary={subItem.text} 
                                primaryTypographyProps={{
                                  fontWeight: isSubActive ? '600' : '400',
                                  color: isSubActive ? '#fff' : 'inherit'
                                }}
                              />
                            </ListItem>
                          );
                        })}
                      </List>
                    </Collapse>
                    
                    {index < menuItems.length - 1 && (
                      <Divider sx={{ my: 0.5, backgroundColor: 'rgba(255,255,255,0.1)', mx: 2 }} />
                    )}
                  </React.Fragment>
                );
              } else {
                const isItemActive = isActive(item.path);
                return (
                  <React.Fragment key={item.text}>
                    <ListItem 
                      button 
                      component={Link} 
                      to={item.path}
                      sx={{
                        backgroundColor: isItemActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                        '&:hover': {
                          backgroundColor: isItemActive ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                        },
                        borderRadius: '4px',
                        mx: 1,
                        mb: 0.5,
                        position: 'relative',
                        '&::before': isItemActive ? {
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
                      <ListItemIcon 
                        sx={{ 
                          color: isItemActive ? '#fff' : 'rgba(255,255,255,0.8)', 
                          minWidth: '40px' 
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{
                          fontWeight: isItemActive ? '600' : '400',
                          color: isItemActive ? '#fff' : 'inherit'
                        }}
                      />
                    </ListItem>
                    {index < menuItems.length - 1 && (
                      <Divider sx={{ my: 0.5, backgroundColor: 'rgba(255,255,255,0.1)', mx: 2 }} />
                    )}
                  </React.Fragment>
                );
              }
            })}
          </List>
        </Box>

        {/* Add Sign out button */}
        <Box sx={{ mt: 'auto', mb: 2, mx: 2 }}>
          <ListItem 
            button 
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
            <ListItemText 
              primary="Sign Out" 
              primaryTypographyProps={{
                fontWeight: '500',
              }}
            />
          </ListItem>
        </Box>
      </Drawer>

      <Box sx={{ 
        marginLeft: isMobile ? 0 : 280, 
        transition: 'margin 0.3s',
        padding: 3,
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* This is where your main content goes */}
      </Box>
    </Box>
  );
};

export default Sidebar;