import { Box, Button, Container, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

import axios from 'axios';

const AddProduct = () => {
  const [productDetails, setProductDetails] = useState({
    product_id: '',
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    productImage: null,
  });

  const [imagePreview, setImagePreview] = useState(null); // State for image preview

  const handleChange = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProductDetails({ ...productDetails, productImage: file });

    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result); // Set the image preview URL
    };
    if (file) {
      reader.readAsDataURL(file); // Convert the file to a base64 URL
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { product_id, name, category, price, stock, description, productImage } = productDetails;
    if (!product_id || !name || !category || !price || !stock) {
      alert('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('productId', product_id);
    formData.append('name', name);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('description', description);
    if (productImage) {
      formData.append('productImage', productImage);
    }

    try {
      await axios.post('http://localhost:4000/api/product/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Product added successfully!');
      setProductDetails({
        product_id: '',
        name: '',
        category: '',
        price: '',
        stock: '',
        description: '',
        productImage: null,
      });
      setImagePreview(null); // Reset image preview after submission
    } catch (error) {
      alert('Failed to add product. Please try again.');
    }
  };

  return (
    <Container>
      <Typography style={{ fontWeight: 600, textAlign: 'center' }} variant="h4" gutterBottom>
        Add Product
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Product ID"
          name="product_id"
          fullWidth
          onChange={handleChange}
          value={productDetails.product_id}
          margin="normal"
          required
        />
        <TextField
          label="Product Name"
          name="name"
          fullWidth
          onChange={handleChange}
          value={productDetails.name}
          margin="normal"
          required
        />
        <TextField
          label="Category"
          name="category"
          fullWidth
          onChange={handleChange}
          value={productDetails.category}
          margin="normal"
          required
        />
        <TextField
          label="Price"
          name="price"
          type="number"
          fullWidth
          onChange={handleChange}
          value={productDetails.price}
          margin="normal"
          required
        />
        <TextField
          label="Stock"
          name="stock"
          type="number"
          fullWidth
          onChange={handleChange}
          value={productDetails.stock}
          margin="normal"
          required
        />
        <TextField
          label="Description"
          name="description"
          fullWidth
          multiline
          rows={4}
          onChange={handleChange}
          value={productDetails.description}
          margin="normal"
        />
        
        <Box marginTop={2} textAlign="center">
          {/* Product Image Preview */}
          {imagePreview ? (
            <Box
              component="img"
              src={imagePreview}
              alt="Product Image"
              sx={{ 
                width: 150, 
                height: 150, 
                objectFit: 'contain',
                marginBottom: 2,
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          ) : (
            <Box
              sx={{ 
                width: 150, 
                height: 150,
                marginBottom: 2,
                border: '1px solid #ddd',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5'
              }}
            >
              <Typography color="textSecondary">No image</Typography>
            </Box>
          )}

          {/* File Input */}
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: 'none' }}
            id="product-image-upload"
          />
          <label htmlFor="product-image-upload">
            <Button variant="outlined" component="span">
              Upload Image
            </Button>
          </label>
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 3, marginBottom: 3 }}
        >
          Add Product
        </Button>
      </form>
    </Container>
  );
};

export default AddProduct;