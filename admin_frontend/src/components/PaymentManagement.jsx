// PaymentManagement.js

import { Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';

import React from 'react';

const PaymentManagement = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom style={{fontWeight:700}}>
        Payment Management
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Payment 1</Typography>
              <Typography>Status: Pending</Typography>
              <Button variant="contained" color="primary" fullWidth>
                Release Payment
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Payment 2</Typography>
              <Typography>Status: Completed</Typography>
              <Button variant="contained" color="secondary" fullWidth>
                Refund Payment
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PaymentManagement;
