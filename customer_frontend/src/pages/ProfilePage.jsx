import './ProfilePage.css';

import { Button, Card, Col, Container, Form, Image, Row } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Correctly import jwtDecode
import { useNavigate } from 'react-router-dom';
import Sidebar from '../componts/Sidebar/Sidebar'; // Import Sidebar component

const ProfilePage = () => {
  const [user, setUser] = useState({});
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  // Fetch token once on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    } else {
      alert('You are not authorized. Please login again.');
      navigate('/login'); // Redirect to login if no token found
    }
  }, [navigate]);

  // Fetch user profile information including image
  useEffect(() => {
    if (token) {
      
      axios
        .get(`http://localhost:4000/api/user/get_user`, { // Send userId in the API request
          headers: { token },
        })
        .then((response) => {
          setUser(response.data.user);
          setImage(response.data.user.profile_image || 'https://via.placeholder.com/150');
        })
        .catch((error) => console.error('Error fetching user data:', error));
    }
  }, [token]);

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const handleProfileImageUpdate = async (e) => {
    e.preventDefault();
    
    // Check if the image file is selected
    if (!imageFile) {
      alert('Please select an image to upload.');
      return;
    }

    // Decode the token to get userId
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.id; // Extract userId from decoded token

    // Create FormData and append the image file and userId
    const formData = new FormData();
    formData.append('profile_image', imageFile);
    formData.append('userId', userId);  // Send userId in the FormData
    
    try {
      // Send the request with image and userId in the body
      const response = await axios.post('http://localhost:4000/api/user/update', formData, {
        headers: { token },
      });

      if (response.data.success) {
        alert('Profile image updated successfully');
        setImage(response.data.profile_image); // Update the image in state
        setIsEditing(false); // Exit edit mode
      } else {
        alert('Failed to update profile image: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      alert('Error updating profile image');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <Container className="container" style={{ marginLeft: '280px', width: 'calc(100% - 280px)', padding: '20px' }}>
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="text-center">
              <Card.Header as="h3">My Profile</Card.Header>
              <Card.Body>
                {isEditing ? (
                  <Form onSubmit={handleProfileImageUpdate} className="mt-3">
                    <Form.Group controlId="formProfileImage">
                      <Form.Label>Update Profile Image</Form.Label>
                      <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="mt-3">
                      Save Image
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setIsEditing(false)}
                      className="mt-3 ml-2"
                    >
                      Cancel
                    </Button>
                  </Form>
                ) : (
                  <>
                    <Image
                      src={`http://localhost:4000/images/${image}`}
                      className="profile-image"
                      roundedCircle
                      fluid
                      alt="profile-pic"
                    />
                    <Card.Text>
                      <div>
                        <div><strong>Your Name:-</strong> {user.customer_name || 'John Doe'}</div> <br />
                        <div><strong>Your Email:-</strong> {user.email || 'example@example.com'}</div><br />
                        <div><strong>Your Phone Number:-</strong> {user.tel_num || 'Not provided'}</div><br />
                      </div>
                    </Card.Text>

                    <Button
                      variant="primary"
                      className="button-edit"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile Image
                    </Button>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfilePage;
