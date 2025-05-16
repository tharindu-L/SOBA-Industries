import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Testimonial.css'; // Custom styles for Iron Workshop

import React, { useCallback, useEffect, useRef, useState } from 'react';

import Container from 'react-bootstrap/Container';
import Slider from 'react-slick';
import { assest } from '../../assest/assest';

function Testimonial() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 600 && window.innerWidth <= 1100);
  const sliderRef = useRef(null);

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth <= 600);
    setIsTablet(window.innerWidth > 600 && window.innerWidth <= 1100);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Updated testimonial data for Iron Workshop
  const cardsData = [
    { 
      image: assest.admin, 
      text: "Excellent craftsmanship! My custom iron gate turned out beautifully.",
      name: "Akhila Fernando", 
      location: "Colombo, Sri Lanka"
    },
    { 
      image: assest.admin, 
      text: "Great service and timely delivery. Highly recommend their fabrication services.",
      name: "Nimal Perera", 
      location: "Gampaha, Sri Lanka"
    },
    { 
      image: assest.admin, 
      text: "The team was professional and paid attention to every detail. Very satisfied!",
      name: "Madhavi Silva", 
      location: "Kandy, Sri Lanka"
    },
    // Additional testimonial data if needed
  ];

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1100,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="testimonial-section" id="testimonials" style={{ position: 'relative', padding: '40px 20px', color: '#fff' }}>
      <div
        className="background-image"
        style={{
          backgroundImage: `url(${assest.workshopBackground})`, // Use a relevant background for the workshop
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      />
      <div
        className="dark-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)', // Darker overlay for contrast
          zIndex: 1,
        }}
      />
      <Container style={{ position: 'relative', zIndex: 2 }}>
        <h2 className="testimonial-heading">Customer Feedback</h2>
        <Slider ref={sliderRef} {...settings}>
          {cardsData.map((card, idx) => (
            <div key={idx} className="slide">
              <div className="testimonial-card">
                <img
                  src={card.image}
                  alt={`Testimonial from ${card.name}`}
                  className="testimonial-image"
                />
                <div className="testimonial-text">
                  <p>{card.text}</p>
                  <h5>{card.name}</h5>
                  <p className="location">{card.location}</p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </Container>
    </div>
  );
}

export default Testimonial;
