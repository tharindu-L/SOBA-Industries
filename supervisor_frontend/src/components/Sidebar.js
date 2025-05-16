import './Sidebar.css';

import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WorkIcon from '@mui/icons-material/Work';
import axios from 'axios';

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));  
  const [open, setOpen] = useState(false);  
  const navigate = useNavigate();  
  const location = useLocation(); // Add this to get current location
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  // Logout function removed

  useEffect(() => {
    const fetchUsername = async () => {
      const token = localStorage.getItem('token'); 
      try {
        const response = await axios.get('http://localhost:4000/api/guides/get_guide', {
          headers: {
            token: token
          }
        });
        // Access the supervisor_name within the user object
        setUsername(response.data.user.supervisor_name); 
        setLoading(false);
      } catch (error) {
        console.error('Error fetching username:', error);
        setLoading(false);
      }
    };
  
    fetchUsername();
  }, []);
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Add Material', icon: <AddCircleIcon />, path: '/add-material' },
    { text: 'List Material', icon: <FormatListBulletedIcon />, path: '/list-material' },
    { text: 'Add Products', icon: <PersonAddIcon />, path: '/Add-products' },
    { text: 'List Products', icon: <PeopleIcon />, path: '/list-products' },
    { text: 'Job List', icon: <WorkIcon />, path: '/job-list' },
    { text: 'Normal Orders', icon: <WorkIcon />, path: '/n-orders' },
  ];

  // Function to check if a menu item is active
  const isActiveRoute = (path) => {
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
            <Typography variant="h6">Production Management</Typography>
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
        open={open}
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
            Production Management
          </Typography>
          
          <Chip 
            label={loading ? "Loading..." : "Production Manager"} 
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
              const isActive = isActiveRoute(item.path);
              
              return (
                <React.Fragment key={item.text}>
                  <ListItem 
                    button 
                    component={Link} 
                    to={item.path}
                    sx={{
                      backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                      '&:hover': {
                        backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                      },
                      borderRadius: '4px',
                      mx: 1,
                      mb: 0.5,
                      position: 'relative',
                      '&::before': isActive ? {
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
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.8)', 
                        minWidth: '40px' 
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{
                        fontWeight: isActive ? '600' : '400',
                        color: isActive ? '#fff' : 'inherit'
                      }}
                    />
                  </ListItem>
                  {index < menuItems.length - 1 && (
                    <Divider sx={{ my: 0.5, backgroundColor: 'rgba(255,255,255,0.1)', mx: 2 }} />
                  )}
                </React.Fragment>
              );
            })}
          </List>
        </Box>

        {/* Sign out button removed */}
      </Drawer>

      <Box sx={{ marginLeft: isMobile ? 0 : 280, transition: 'margin 0.3s' }}>
        {/* This is where your main content goes */}
      </Box>
    </Box>
  );
};

export default Sidebar;