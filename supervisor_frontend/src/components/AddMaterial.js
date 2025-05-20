import './AddMaterial.css';

import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material'; // Importing Material-UI components for UI elements
import React, { useState } from 'react'; // Importing React and useState hook for state management

import CloudUploadIcon from '@mui/icons-material/CloudUpload'; // Importing cloud upload icon from Material-UI
import axios from 'axios'; // Importing axios for making HTTP requests

/**
 * AddMaterial Component
 * This component provides a form interface to add new construction materials to the system.
 * It handles material details input, image uploads, and sends data to the backend API.
 */
const AddMaterial = () => {
  // State to manage material details using useState hook
  const [materialDetails, setMaterialDetails] = useState({
    item_id: '',         // Unique identifier for material
    item_name: '',       // Name of the material
    available_qty: '',   // Available quantity of the material
    unit_price: '',      // Price per unit of the material
    images: [],          // Array to store image files for the material
  });

  // State to store and manage image preview URLs
  const [imagePreviews, setImagePreviews] = useState([]); // Store image previews

  /**
   * Handles changes in text field inputs
   * Updates the materialDetails state when user types in any text field
   * @param {Object} e - Event object containing input field data
   */
  const handleChange = (e) => {
    setMaterialDetails({ ...materialDetails, [e.target.name]: e.target.value });
  };

  /**
   * Handles image file uploads
   * Updates both the materialDetails.images array and imagePreviews array
   * @param {Object} e - Event object containing file input data
   */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files); // Convert FileList to Array for easier manipulation

    // Add new files to existing images array and generate preview URLs
    const updatedImages = [...materialDetails.images, ...files];
    const updatedPreviews = [
      ...imagePreviews,
      ...files.map((file) => URL.createObjectURL(file)), // Create URL objects for preview
    ];

    // Update both state variables with new data
    setMaterialDetails({ ...materialDetails, images: updatedImages });
    setImagePreviews(updatedPreviews);
  };

  /**
   * Handles removal of a selected image
   * Removes image from both materialDetails.images and imagePreviews arrays
   * @param {number} index - Index of image to remove
   */
  const handleRemoveImage = (index) => {
    // Remove selected image and its preview using filter method
    const updatedImages = materialDetails.images.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);

    // Update both state variables with filtered data
    setMaterialDetails({ ...materialDetails, images: updatedImages });
    setImagePreviews(updatedPreviews);
  };

  /**
   * Handles form submission
   * Validates input, prepares FormData, and sends POST request to backend
   * @param {Object} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Destructure values from materialDetails for validation
    const { item_id, item_name, available_qty, unit_price, images } = materialDetails;

    // Input validation - Check if required fields are filled
    if (!item_id || !item_name || !available_qty || !unit_price) {
      alert('Please fill in all required fields.');
      return; // Exit function if validation fails
    }

    // Create FormData object for multipart/form-data submission (needed for file uploads)
    const formData = new FormData();
    formData.append('itemId', item_id);           // Add item ID to form data
    formData.append('itemName', item_name);       // Add item name to form data
    formData.append('availableQty', available_qty); // Add quantity to form data
    formData.append('unitPrice', unit_price);     // Add price to form data

    // Only append images if they exist
    if (images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image); // Add each image to form data with 'images' field name
      });
    }

    try {
      // Send POST request to backend API with form data
      const response = await axios.post('http://localhost:4000/api/material/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }, // Set appropriate content type for file upload
      });

      console.log('Material added successfully:', response.data); // Log success response
      alert('Material added successfully!'); // Notify user of success
      
      // Reset form fields after successful submission
      setMaterialDetails({
        item_id: '',
        item_name: '',
        available_qty: '',
        unit_price: '',
        images: [],
      });
      setImagePreviews([]); // Clear image previews after submission
    } catch (error) {
      // Handle errors during submission
      console.error('Error adding material:', error);
      alert(error.response?.data?.message || 'Failed to add material. Please try again.');
    }
  };

  // Component UI rendering starts here
  return (
    // Outer container with styling
    <Box sx={{ 
      padding: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 80px)',
      marginLeft: '85px',
      marginTop:'-25px'
    }}>
      {/* Paper component provides the card-like container for the form */}
      <Paper elevation={3} className="add-tour-container">
        {/* Title of the form */}
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
        
        {/* Form element with submit handler */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Material Item ID input field */}
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

            {/* Material Name input field */}
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

            {/* Available Quantity input field - using xs=12 sm=6 for responsive layout */}
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

            {/* Unit Price input field - using xs=12 sm=6 for responsive layout */}
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

            {/* Image Upload Button - Currently commented out */}
            {/* <Grid item xs={12}>
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
            </Grid> */}

            {/* Image Preview Container - displays uploaded images with remove option */}
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

            {/* Form Submit Button */}
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

export default AddMaterial; // Export the component for use in other files