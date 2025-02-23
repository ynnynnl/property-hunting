import React, { useState } from 'react';
import './PropertyForm.css'; // Add styling

const PropertyForm = ({ addProperty }) => {
  const [propertyData, setPropertyData] = useState({
    name: '',
    price: '',
    location: '',
    description: '',
    image: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPropertyData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setPropertyData((prevData) => ({
      ...prevData,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Call the parent function to submit the property data
    addProperty(propertyData);
    // Clear the form after submission
    setPropertyData({
      name: '',
      price: '',
      location: '',
      description: '',
      image: null,
    });
  };

  return (
    <form className="property-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Property Name"
        value={propertyData.name}
        onChange={handleInputChange}
        required
      />
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={propertyData.price}
        onChange={handleInputChange}
        required
      />
      <input
        type="text"
        name="location"
        placeholder="Location"
        value={propertyData.location}
        onChange={handleInputChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={propertyData.description}
        onChange={handleInputChange}
        required
      />
      <input
        type="file"
        name="image"
        onChange={handleFileChange}
        required
      />
      <button type="submit">Add Property</button>
    </form>
  );
};

export default PropertyForm;
