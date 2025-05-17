import './Header.css';

import { Carousel, Container } from 'react-bootstrap';

import React from 'react';
import { assest } from '../../assest/assest';

function Header() {
  const iconUrl = assest.icon;
  
  // Single post for the iron workshop
  const post = {
    id: 1,
    imageUrl: assest.g,
    category: 'Metalwork',
    title: 'Crafting Quality Metalwork with Precision',
  };
  
  return (
    <Container id='home' fluid className="p-0">
      <Carousel className="header-carousel" interval={6000} controls={false} indicators={false}>
        <Carousel.Item>
          <div className="carousel-image-container">
            <img
              className="d-block w-100 carousel-image"
              src={post.imageUrl}
              alt="Metalwork showcase"
            />
            {/* Enhanced dark overlay with gradient */}
            <div className="dark-overlay"></div>
          </div>
          <Carousel.Caption className="carousel-caption">
            <img src={iconUrl} alt="Logo" className="logo" />
            <h3>{post.title}</h3>
            <p>Precision and Excellence in Every Metal Creation</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
    </Container>
  );
}

export default Header;