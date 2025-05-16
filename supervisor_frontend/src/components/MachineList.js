import {
    Avatar,
    Box,
    Button,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';

import axios from 'axios';

const MachineList = () => {
    const [machines, setMachines] = useState([]);
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
    useEffect(() => {
      fetchMachines();
    }, []);
  
    const fetchMachines = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/machine/get');
        if (response.data.success) {
          setMachines(response.data.machines);
        }
      } catch (error) {
        console.error('Error fetching machines:', error);
      }
    };
  
    const handleEditClick = (machine) => {
      setSelectedMachine(machine);
      setEditDialogOpen(true);
    };
  
    const handleDeleteClick = (machine) => {
      setSelectedMachine(machine);
      setDeleteDialogOpen(true);
    };
  
    const handleEditSubmit = async () => {
      try {
        const response = await axios.put('http://localhost:4000/api/machine/update', {
          id: selectedMachine.id,
          machineName: selectedMachine.machineName,
          description: selectedMachine.description,
          status: selectedMachine.status,
          hourlyRate: selectedMachine.hourlyRate,
        });
  
        if (response.data.success) {
          fetchMachines();
          setEditDialogOpen(false);
        }
      } catch (error) {
        console.error('Error updating machine:', error);
      }
    };
  
    const handleDeleteSubmit = async () => {
      try {
        const response = await axios.delete('http://localhost:4000/api/machine/delete', {
          data: { id: selectedMachine.id },
        });
  
        if (response.data.success) {
          fetchMachines();
          setDeleteDialogOpen(false);
        }
      } catch (error) {
        console.error('Error deleting machine:', error);
      }
    };
  
    const getStatusColor = (status) => {
      switch (status) {
        case 'Active': return 'success';
        case 'In Maintenance': return 'warning';
        case 'Retired': return 'error';
        default: return 'default';
      }
    };
  
    // Function to construct the correct image URL
    const getImageUrl = (imagePath) => {
      if (!imagePath) return null;
      // Check if the path already includes the full URL
      if (imagePath.startsWith('http')) return imagePath;
      // Otherwise construct the full URL
      return `http://localhost:4000/images/${imagePath}`;
    };
  
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Machine Inventory
        </Typography>
  
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Hourly Rate</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {machines.map((machine) => (
                <TableRow key={machine.id}>
                  <TableCell>
                    {machine.images && machine.images.length > 0 ? (
                      <Avatar
                        src={getImageUrl(machine.images[0])}
                        alt={machine.machineName}
                        sx={{ width: 56, height: 56 }}
                        variant="rounded"
                      />
                    ) : (
                      <Avatar sx={{ width: 56, height: 56 }} variant="rounded">
                        {machine.machineName.charAt(0)}
                      </Avatar>
                    )}
                  </TableCell>
                  <TableCell>{machine.machineId}</TableCell>
                  <TableCell>{machine.machineName}</TableCell>
                  <TableCell>
                    <Chip 
                      label={machine.status} 
                      color={getStatusColor(machine.status)} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>${machine.hourlyRate}/hr</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditClick(machine)}>
                      <Edit color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(machine)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
  
        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <DialogTitle>Edit Machine</DialogTitle>
          <DialogContent>
            {selectedMachine && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  {selectedMachine.images && selectedMachine.images.length > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <Avatar
                        src={getImageUrl(selectedMachine.images[0])}
                        alt={selectedMachine.machineName}
                        sx={{ width: 100, height: 100 }}
                        variant="rounded"
                      />
                    </Box>
                  )}
                  <TextField
                    fullWidth
                    label="Machine Name"
                    value={selectedMachine.machineName}
                    onChange={(e) => setSelectedMachine({
                      ...selectedMachine,
                      machineName: e.target.value
                    })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={selectedMachine.description}
                    onChange={(e) => setSelectedMachine({
                      ...selectedMachine,
                      description: e.target.value
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={selectedMachine.status}
                      onChange={(e) => setSelectedMachine({
                        ...selectedMachine,
                        status: e.target.value
                      })}
                      label="Status"
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="In Maintenance">In Maintenance</MenuItem>
                      <MenuItem value="Retired">Retired</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Hourly Rate"
                    type="number"
                    value={selectedMachine.hourlyRate}
                    onChange={(e) => setSelectedMachine({
                      ...selectedMachine,
                      hourlyRate: e.target.value
                    })}
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} color="primary">Save</Button>
          </DialogActions>
        </Dialog>
  
        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete {selectedMachine?.machineName}?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteSubmit} color="error">Delete</Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  };
  
  export default MachineList;