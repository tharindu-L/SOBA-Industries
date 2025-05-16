import { AppBar, Avatar, Badge, Box, Button, Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MenuIcon from '@mui/icons-material/Menu';
import axios from 'axios';

const Sidebar = () => {
  const theme = useTheme();
  const [image, setImage] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const goToHomePage = () => {
    navigate('/');
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4000/api/user/get_user', {
          headers: {
            token: token
          }
        });
        if (response.data.success) {
          setUser(response.data.user);
          setImage(response.data.user.profile_image || 'https://via.placeholder.com/150');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, []);

  return (
    <Box>
      {isMobile && (
        <AppBar position="sticky">
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={toggleDrawer} aria-label="menu" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">Dashboard</Typography>
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
            backgroundColor: '#1e1e2f',
            color: 'white',
            paddingTop: '20px'
          }
        }}
        variant={isMobile ? 'temporary' : 'permanent'}
        anchor="left"
        open={open}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true
        }}
      >
        {/* Profile Section */}
        <Box sx={{ textAlign: 'center', padding: '10px', marginBottom: '20px' }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  width: '15px',
                  height: '15px',
                  backgroundColor: '#44b700',
                  borderRadius: '50%',
                  border: '2px solid white'
                }}
              />
            }
          >
            <Avatar
              src={`http://localhost:4000/images/${image}`}
              alt="Profile"
              sx={{ width: 100, height: 100, margin: 'auto', marginBottom: '10px' }}
            />
          </Badge>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            {user.customer_name || 'Guest User'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#ccc' }}>
            {user.role || 'Customer'}
          </Typography>
        </Box>

        {/* Navigation Menu */}
        <List>
          <ListItem button component={Link} to="/dashboard/create-new-Custom-Order" sx={{ '&:hover': { backgroundColor: '#333' } }}>
            <ListItemIcon>
              <AddIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Create Custom Order" />
          </ListItem>
          <Divider />
          <ListItem button component={Link} to="/dashboard/invoices" sx={{ '&:hover': { backgroundColor: '#333' } }}>
            <ListItemIcon>
              <ListAltIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="My Invoices" />
          </ListItem>
          <Divider />
          
          <Divider />
          <ListItem button component={Link} to="/profile" sx={{ '&:hover': { backgroundColor: '#333' } }}>
            <ListItemIcon>
              <AccountCircleIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
        </List>

        {/* Home Page Button */}
        <Box sx={{ position: 'absolute', bottom: '20px', width: '80%', left: '10%', backgroundColor: 'blue', borderRadius: '10px' }}>
          <Button variant="contained" color="primary" fullWidth onClick={goToHomePage} startIcon={<HomeIcon />}>
            Home Page
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Sidebar;
