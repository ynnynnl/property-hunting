import React from 'react';
import './PropertyCard.css';

const PropertyCard = ({ property }) => {
  return (
    <div className="property-card">
      <img src={property.image} alt={property.name} className="property-card-img" />
      <div className="property-card-details">
        <h3>{property.name}</h3>
        <p>{property.location}</p>
        <p>${property.price}</p>
      </div>
    </div>
  );
};

export default PropertyCard;
