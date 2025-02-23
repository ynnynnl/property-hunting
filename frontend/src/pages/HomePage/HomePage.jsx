import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import images from '../../assets/assets';
import './HomePage.css';

const heroImages = [images.modernHouse, images.modernHouse1, images.modernHouse2];

const HomePage = ({ properties = [] }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [autoSlide, setAutoSlide] = useState(true);

  useEffect(() => {
    if (!autoSlide) return; // Stop auto-slide if user interacts

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [autoSlide]);

  // Function to manually change images
  const goToPrevious = () => {
    setAutoSlide(false);
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setAutoSlide(false);
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-left">
          <h1>Find Your Home in <br/>San Jose Del Monte, Bulacan</h1>
          <p>Explore premium properties and discover a place<br/> that truly feels like home.</p>
          <button className="browse-btn" onClick={() => navigate('/properties')}>
            Browse Listings
          </button>
        </div>
        <div className="hero-right">
          <div className="hero-image-container">
            {heroImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt="Modern House"
                className={`hero-image ${index === currentImageIndex ? 'active' : ''}`}
              />
            ))}
            {/* Navigation Buttons */}
            <button className="prev-btn" onClick={goToPrevious}>&#10094;</button>
            <button className="next-btn" onClick={goToNext}>&#10095;</button>
          </div>

          {/* Dots Navigation */}
          <div className="dots-container">
            {heroImages.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => {
                  setAutoSlide(false);
                  setCurrentImageIndex(index);
                }}
              ></span>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Properties Section */}
      <h1 className="section-title">Featured Properties</h1>
      <div className="property-list">
        {properties.length > 0 ? (
          properties.map((property) => (
            <PropertyCard key={property._id || property.id} property={property} />
          ))
        ) : (
          <p>No properties available</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
