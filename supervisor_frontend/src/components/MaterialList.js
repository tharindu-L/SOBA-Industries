import './MaterialList.css';

import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import WarningIcon from '@mui/icons-material/Warning';
import axios from 'axios';

const MaterialList = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newPreorderLevel, setNewPreorderLevel] = useState('');

  // Fetch materials data from backend
  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = () => {
    setLoading(true);
    axios
      .get('http://localhost:4000/api/material/get')
      .then((response) => {
        // Make sure each material has a preorder_level, default to 10 if not set
        const materialsWithPreorderLevel = response.data.materials.map(material => ({
          ...material,
          preorder_level: material.preorder_level || 10
        }));
        setMaterials(materialsWithPreorderLevel);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching materials:', err);
        setError('Failed to fetch materials. Please try again.');
        setLoading(false);
      });
  };

  // Function to delete a material
  const handleDelete = (itemId) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      axios
        .delete('http://localhost:4000/api/material/delete', { data: { itemId } })
        .then(() => {
          setMaterials((prevMaterials) => 
            prevMaterials.filter((material) => material.itemId !== itemId)
          );
        })
        .catch((err) => {
          console.error('Error deleting material:', err);
          alert('Failed to delete material');
        });
    }
  };

  // Function to open the update modal
  const handleUpdateOpen = (material) => {
    setCurrentMaterial(material);
    setNewQuantity(material.availableQty);
    setNewPrice(material.unitPrice);
    setNewPreorderLevel(material.preorder_level || 10);
    setShowUpdateModal(true);
  };

  // Function to handle the update action
  const handleUpdateSubmit = () => {
    if (newQuantity && newPrice) {
      axios
        .put('http://localhost:4000/api/material/update', {
          itemId: currentMaterial.itemId,
          availableQty: newQuantity,
          unitPrice: newPrice,
          preorder_level: newPreorderLevel
        })
        .then(() => {
          setMaterials((prevMaterials) =>
            prevMaterials.map((material) =>
              material.itemId === currentMaterial.itemId
                ? { 
                    ...material, 
                    availableQty: newQuantity, 
                    unitPrice: newPrice,
                    preorder_level: newPreorderLevel
                  }
                : material
            )
          );
          setShowUpdateModal(false);
        })
        .catch((err) => {
          console.error('Error updating material:', err);
          alert('Failed to update material');
        });
    }
  };

  const handleCloseModal = () => {
    setShowUpdateModal(false);
  };

  const isLowStock = (material) => {
    return parseInt(material.availableQty) <= parseInt(material.preorder_level || 10);
  };

  return (
    <Box sx={{ 
      padding: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      minHeight: 'calc(100vh - 80px)'
    }}>
      <Paper 
        elevation={3} 
        className="material-list-container"
        sx={{
          width: '100%',
          maxWidth: '1000px',
          padding: '30px',
          borderRadius: '8px',
          backgroundColor: '#f4f7fc'
        }}
      >
        <Typography
          variant="h5"
          sx={{ 
            mb: 4, 
            fontWeight: 600,
            color: '#283593',
            textAlign: 'center',
            borderBottom: '2px solid #3f51b5',
            paddingBottom: '10px'
          }}
        >
          Material Inventory
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress sx={{ color: '#3f51b5' }} />
          </Box>
        ) : error ? (
          <Typography color="error" align="center" sx={{ my: 4 }}>
            {error}
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ backgroundColor: '#3f51b5' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Image</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Item ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Item Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Quantity</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Preorder Level</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Price</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1">No materials found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  materials.map((material) => (
                    <TableRow 
                      key={material.itemId}
                      sx={{ 
                        '&:hover': { backgroundColor: 'rgba(63, 81, 181, 0.05)' },
                        backgroundColor: isLowStock(material) ? 'rgba(255, 235, 238, 0.5)' : 'inherit'
                      }}
                    >
                      <TableCell>
                        {material.images && material.images.length > 0 ? (
                          <Box 
                            sx={{ 
                              width: 80, 
                              height: 80, 
                              borderRadius: '4px',
                              overflow: 'hidden',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                            }}
                          >
                            <img
                              src={`http://localhost:4000/images/${material.images[0]}`}
                              alt={material.itemName}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </Box>
                        ) : (
                          <Box 
                            sx={{ 
                              width: 80, 
                              height: 80, 
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#e0e0e0',
                              borderRadius: '4px',
                              color: '#757575'
                            }}
                          >
                            No Image
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>{material.itemId}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{material.itemName}</TableCell>
                      <TableCell>{material.availableQty}</TableCell>
                      <TableCell>{material.preorder_level || 10}</TableCell>
                      <TableCell>${parseFloat(material.unitPrice).toFixed(2)}</TableCell>
                      <TableCell>
                        {isLowStock(material) ? (
                          <Chip 
                            icon={<WarningIcon />} 
                            label="Low Stock" 
                            color="error" 
                            size="small" 
                            variant="outlined" 
                          />
                        ) : (
                          <Chip 
                            label="In Stock" 
                            color="success" 
                            size="small" 
                            variant="outlined" 
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleUpdateOpen(material)}
                            sx={{ 
                              bgcolor: '#3f51b5',
                              '&:hover': { bgcolor: '#303f9f' }
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(material.itemId)}
                            sx={{ 
                              bgcolor: '#f44336',
                              '&:hover': { bgcolor: '#d32f2f' }
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Update Material Dialog */}
        {currentMaterial && (
          <Dialog 
            open={showUpdateModal} 
            onClose={handleCloseModal}
            PaperProps={{
              sx: {
                borderRadius: '8px',
                width: '100%',
                maxWidth: '500px'
              }
            }}
          >
            <DialogTitle sx={{ bgcolor: '#3f51b5', color: 'white', fontWeight: 600 }}>
              Update Material Details
              <IconButton
                aria-label="close"
                onClick={handleCloseModal}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: 'white',
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3, pb: 1, px: 3, mt: 1 }}>
              <TextField
                label="Item Name"
                fullWidth
                value={currentMaterial.itemName}
                InputProps={{ readOnly: true }}
                variant="outlined"
                margin="normal"
                sx={{ mb: 3 }}
              />
              <TextField
                label="New Quantity"
                type="number"
                fullWidth
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                variant="outlined"
                margin="normal"
                InputProps={{
                  sx: { borderRadius: '10px' }
                }}
                sx={{ mb: 3 }}
              />
              <TextField
                label="Preorder Level"
                type="number"
                fullWidth
                value={newPreorderLevel}
                onChange={(e) => setNewPreorderLevel(e.target.value)}
                variant="outlined"
                margin="normal"
                InputProps={{
                  sx: { borderRadius: '10px' }
                }}
                sx={{ mb: 3 }}
              />
              <TextField
                label="New Price ($)"
                type="number"
                fullWidth
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                variant="outlined"
                margin="normal"
                InputProps={{
                  sx: { borderRadius: '10px' }
                }}
                sx={{ mb: 2 }}
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                onClick={handleCloseModal}
                variant="outlined"
                sx={{ 
                  borderRadius: '5px',
                  borderColor: '#3f51b5',
                  color: '#3f51b5',
                  '&:hover': { borderColor: '#303f9f', bgcolor: 'rgba(63, 81, 181, 0.08)' }
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateSubmit}
                variant="contained"
                sx={{ 
                  borderRadius: '5px',
                  bgcolor: '#3f51b5',
                  '&:hover': { bgcolor: '#303f9f' },
                  ml: 2
                }}
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Paper>
    </Box>
  );
};

export default MaterialList;