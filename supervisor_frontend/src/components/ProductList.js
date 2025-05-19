import {
  Avatar,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

  return (
    <Container>
      <Typography style={{ fontWeight: 600, textAlign: 'center' }} variant="h4" gutterBottom>
        Product List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Product ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Preorder Level</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.productId}>
                <TableCell>
                  {product.productImage ? (
                    <Avatar 
                      src={`http://localhost:4000/images/${product.productImage}`} 
                      alt="Product" 
                      sx={{ width: 50, height: 50 }} 
                      variant="square"
                    />
                  ) : (
                    <Avatar sx={{ width: 50, height: 50 }} variant="square">
                      {product.name.charAt(0)}
                    </Avatar>
                  )}
                </TableCell>
                <TableCell>{product.productId}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.preorder_level || 10}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ marginRight: '10px' }}
                    onClick={() => handleUpdate(product)}
                  >
                    Update
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(product.productId)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Update Product Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Update Product</DialogTitle>
        <DialogContent>
          <TextField
            label="Product ID"
            name="productId"
            value={selectedProduct?.productId || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Name"
            name="name"
            value={selectedProduct?.name || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Category"
            name="category"
            value={selectedProduct?.category || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Price"
            name="price"
            value={selectedProduct?.price || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="number"
          />
          <TextField
            label="Stock"
            name="stock"
            value={selectedProduct?.stock || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="number"
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductList;