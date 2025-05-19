import './AddMaterial.css';

import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const AddMaterial = () => {
  const [materialDetails, setMaterialDetails] = useState({
    item_id: '',
    item_name: '',
    available_qty: '',
    unit_price: '',
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]); // Store image previews

  const handleChange = (e) => {
    setMaterialDetails({ ...materialDetails, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Add new files and generate previews
    const updatedImages = [...materialDetails.images, ...files];
    const updatedPreviews = [
      ...imagePreviews,
      ...files.map((file) => URL.createObjectURL(file)),
    ];

    setMaterialDetails({ ...materialDetails, images: updatedImages });
    setImagePreviews(updatedPreviews);
  };

  const handleRemoveImage = (index) => {
    // Remove selected image and its preview
    const updatedImages = materialDetails.images.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);

    setMaterialDetails({ ...materialDetails, images: updatedImages });
    setImagePreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { item_id, item_name, available_qty, unit_price, images } = materialDetails;

    // Check if required fields are filled in
    if (!item_id || !item_name || !available_qty || !unit_price) {
      alert('Please fill in all required fields.');
      return;
    }

    // Prepare the data to send to the backend
    const formData = new FormData();
    formData.append('itemId', item_id); // Match field name as expected by the backend
    formData.append('itemName', item_name); // Match field name as expected by the backend
    formData.append('availableQty', available_qty); // Match field name as expected by the backend
    formData.append('unitPrice', unit_price); // Match field name as expected by the backend

    // Only append images if they exist
    if (images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    try {
      const response = await axios.post('http://localhost:4000/api/material/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Material added successfully:', response.data);
      alert('Material added successfully!');
      setMaterialDetails({
        item_id: '',
        item_name: '',
        available_qty: '',
        unit_price: '',
        images: [],
      });
      setImagePreviews([]); // Clear previews after submission
    } catch (error) {
      console.error('Error adding material:', error);
      alert(error.response?.data?.message || 'Failed to add material. Please try again.');
    }
  };

  return (
    <Box sx={{ 
      padding: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 80px)',
      marginLeft: '85px',
      marginTop:'-25px'
    }}>
      <Paper elevation={3} className="add-tour-container">
        <Typography
          variant="h5"
          gutterBottom
          className="heading"
          sx={{ 
            mb: 3, 
            fontWeight: 600,
            color: '#283593',
            borderBottom: '2px solid #3f51b5',
            paddingBottom: '10px'
          }}
        >
          Add New Material
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Material Item ID */}
            <Grid item xs={12}>
              <TextField
                label="Material Item ID"
                variant="outlined"
                fullWidth
                name="item_id"
                value={materialDetails.item_id}
                onChange={handleChange}
                className="text-field"
                placeholder="Enter material ID"
                InputProps={{
                  sx: { borderRadius: '10px' }
                }}
              />
            </Grid>

            {/* Material Name */}
            <Grid item xs={12}>
              <TextField
                label="Material Name"
                variant="outlined"
                fullWidth
                name="item_name"
                value={materialDetails.item_name}
                onChange={handleChange}
                className="text-field"
                placeholder="Enter material name"
                InputProps={{
                  sx: { borderRadius: '10px' }
                }}
              />
            </Grid>

            {/* Available Quantity */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Available Quantity"
                variant="outlined"
                fullWidth
                name="available_qty"
                value={materialDetails.available_qty}
                onChange={handleChange}
                className="text-field"
                type="number"
                placeholder="0"
                InputProps={{
                  sx: { borderRadius: '10px' }
                }}
              />
            </Grid>

            {/* Unit Price */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Unit Price"
                variant="outlined"
                fullWidth
                name="unit_price"
                value={materialDetails.unit_price}
                onChange={handleChange}
                className="text-field"
                type="number"
                placeholder="0.00"
                InputProps={{
                  sx: { borderRadius: '10px' }
                }}
              />
            </Grid>

            {/* Image Upload */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                component="label"
                className="custom-file-button"
                fullWidth
                startIcon={<CloudUploadIcon />}
                sx={{
                  bgcolor: '#ff4081',
                  '&:hover': {
                    bgcolor: '#e91e63',
                  },
                  padding: '12px'
                }}
              >
                Upload Images
                <input
                  type="file"
                  name="images"
                  onChange={handleImageChange}
                  multiple
                  hidden
                  accept="image/*"
                />
              </Button>
            </Grid>

            {/* Image Previews */}
            <Grid item xs={12}>
              <div className="image-preview-container">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview-item">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="image-preview"
                    />
                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={() => handleRemoveImage(index)}
                      title="Remove image"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
                sx={{
                  bgcolor: '#3f51b5',
                  '&:hover': {
                    bgcolor: '#303f9f',
                  },
                  mt: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  padding: '12px',
                  borderRadius: '5px'
                }}
              >
                Add Material
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AddMaterial;