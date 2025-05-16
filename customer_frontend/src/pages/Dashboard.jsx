// src/layouts/DashboardLayout.js

import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import React from 'react';
import Sidebar from '../componts/Sidebar/Sidebar';

const DashboardLayout = () => {
  return (
   
      <Sidebar />
    
  );
};

export default DashboardLayout;
