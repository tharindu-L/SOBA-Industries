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
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import WarningIcon from '@mui/icons-material/Warning';
import axios from 'axios';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/product/get');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete('http://localhost:4000/api/product/delete', { 
          data: { productId } 
        });
        setProducts(products.filter(product => product.productId !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleUpdate = (product) => {
    setSelectedProduct(product);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
  };

  const handleSave = async () => {
    if (!selectedProduct.productId || !selectedProduct.name || !selectedProduct.category || 
        !selectedProduct.price || !selectedProduct.stock) {
      alert('Please fill in all required fields.');
      return;
    }

    // Ensure preorder_level is set to a number
    if (selectedProduct.preorder_level === undefined || selectedProduct.preorder_level === '') {
      selectedProduct.preorder_level = 10; // Set default value if not provided
    }

    console.log('Saving product with data:', selectedProduct);

    try {
      await axios.put('http://localhost:4000/api/product/update', selectedProduct);
      fetchProducts();
      handleClose();
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  const handleChange = (e) => {
    setSelectedProduct({ ...selectedProduct, [e.target.name]: e.target.value });
  };

  const isLowStock = (product) => {
    return parseInt(product.stock) <= parseInt(product.preorder_level || 10);
  };

  return (
    <Box sx={{
      width: '100%',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      minHeight: 'calc(100vh - 80px)',
      marginLeft: '70px'
    }}>
      <Paper 
        elevation={3} 
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
          Product List
        </Typography>
        <TableContainer component={Paper} sx={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#3f51b5' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Image</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Product ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Price</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Stock</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Preorder Level</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow 
                  key={product.productId}
                  sx={{ 
                    '&:hover': { backgroundColor: 'rgba(63, 81, 181, 0.05)' },
                    backgroundColor: isLowStock(product) ? 'rgba(255, 235, 238, 0.5)' : 'inherit'
                  }}
                >
                  <TableCell>
                    {product.productImage ? (
                      <Box 
                        sx={{ 
                          width: 80, 
                          height: 80, 
                          borderRadius: '4px',
                          overflow: 'hidden',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                        }}
                      >
                        <Avatar 
                          src={`http://localhost:4000/images/${product.productImage}`} 
                          alt="Product" 
                          sx={{ width: '100%', height: '100%' }} 
                          variant="square"
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
                        {product.name.charAt(0)}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>{product.productId}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.preorder_level || 10}</TableCell>
                  <TableCell>
                    {isLowStock(product) ? (
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
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 1,
                      width: 'fit-content'
                    }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleUpdate(product)}
                        sx={{ 
                          bgcolor: '#3f51b5',
                          '&:hover': { bgcolor: '#303f9f' },
                          width: '100%'
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(product.productId)}
                        sx={{ 
                          bgcolor: '#f44336',
                          '&:hover': { bgcolor: '#d32f2f' },
                          width: '100%'
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Update Product Dialog */}
        <Dialog 
          open={open} 
          onClose={handleClose}
          PaperProps={{
            sx: {
              borderRadius: '8px',
              width: '100%',
              maxWidth: '500px'
            }
          }}
        >
          <DialogTitle sx={{ bgcolor: '#3f51b5', color: 'white', fontWeight: 600 }}>
            Update Product
            <IconButton
              aria-label="close"
              onClick={handleClose}
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
              label="Product ID"
              name="productId"
              value={selectedProduct?.productId || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputProps={{
                sx: { borderRadius: '10px' }
              }}
              sx={{ mb: 3 }}
            />
            <TextField
              label="Name"
              name="name"
              value={selectedProduct?.name || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputProps={{
                sx: { borderRadius: '10px' }
              }}
              sx={{ mb: 3 }}
            />
            <TextField
              label="Category"
              name="category"
              value={selectedProduct?.category || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputProps={{
                sx: { borderRadius: '10px' }
              }}
              sx={{ mb: 3 }}
            />
            <TextField
              label="Price"
              name="price"
              value={selectedProduct?.price || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
              type="number"
              InputProps={{
                sx: { borderRadius: '10px' }
              }}
              sx={{ mb: 3 }}
            />
            <TextField
              label="Stock"
              name="stock"
              value={selectedProduct?.stock || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
              type="number"
              InputProps={{
                sx: { borderRadius: '10px' }
              }}
              sx={{ mb: 3 }}
            />
            <TextField
              label="Preorder Level"
              name="preorder_level"
              value={selectedProduct?.preorder_level || '10'}
              onChange={handleChange}
              fullWidth
              margin="normal"
              type="number"
              helperText="You'll be notified when stock falls below this level"
              InputProps={{
                sx: { borderRadius: '10px' }
              }}
              sx={{ mb: 3 }}
            />
            <TextField
              label="Description"
              name="description"
              value={selectedProduct?.description || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              InputProps={{
                sx: { borderRadius: '10px' }
              }}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={handleClose}
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
              onClick={handleSave}
              variant="contained"
              sx={{ 
                borderRadius: '5px',
                bgcolor: '#3f51b5',
                '&:hover': { bgcolor: '#303f9f' },
                ml: 2
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default ProductList;