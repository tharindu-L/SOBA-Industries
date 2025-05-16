import './Header.css';

import { Carousel, Container } from 'react-bootstrap';

import React from 'react';
import { assest } from '../../assest/assest';

function Header() {
  const iconUrl = assest.icon; // Path to your uploaded icon
  
  // Single post for the iron workshop
  const post = {
    id: 1,
    imageUrl: assest.g, // Update this with a relevant image for the workshop
    category: 'Metalwork',
    title: 'Crafting Quality Metalwork with Precision',
  };
  
  return (
    <Container id='home' fluid className="p-0">
      <Carousel className="header-carousel" interval={5000} controls={false} indicators={false}>
        <Carousel.Item>
          <div className="carousel-image-container">
            <img
              className="d-block w-100 carousel-image"
              src={post.imageUrl}
              alt="Metalwork showcase"
            />
            {/* Dark overlay */}
            <div className="dark-overlay"></div>
          </div>
          <Carousel.Caption className="carousel-caption">
            <img src={iconUrl} alt="Logo" className="logo" />
            <h2>{post.title}</h2>
            <p>Precision and Excellence in Metalwork.</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
    </Container>
  );
}

export default Header;