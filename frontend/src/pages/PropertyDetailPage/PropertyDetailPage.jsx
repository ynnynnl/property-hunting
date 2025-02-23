import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./PropertyDetailPage.css";

const PropertyDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await fetch(`http://localhost:4000/api/properties/${id}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch property");
                }
                const data = await response.json();
                setProperty(data);
                setLoading(false);
            } catch (error) {
                toast.error("Error fetching property details");
                console.error("Error:", error);
                setLoading(false);
            }
        };
        fetchProperty();
    }, [id]);

    if (loading) return <div className="loading">Loading property details...</div>;
    if (!property) return <div className="error-message">Property not found.</div>;

    // Slideshow settings
    const sliderSettings = {
        dots: true,
        infinite: property.images && property.images.length > 1, // Only enable looping if there's more than one image
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false,
    };

    return (
        <div className="property-detail-container">
            <button onClick={() => navigate(-1)} className="back-btn">⬅ Back</button>

            <div className="property-header">
                <h2>{property.title}</h2>
            </div>

            <div className="property-content">
                {/* Left Side: Image Slideshow */}
                <div className="property-gallery">
                    <Slider {...sliderSettings}>
                        {property.images && property.images.length > 0 ? (
                            property.images.map((image, index) => (
                                <div key={index} className="slider-item">
                                    <img src={image} alt={`Property ${index + 1}`} className="property-gallery-image" />
                                </div>
                            ))
                        ) : (
                            <div className="slider-item">
                                <img src="/default-property.jpg" alt="Default Property" className="property-gallery-image" />
                            </div>
                        )}
                    </Slider>
                </div>

                {/* Right Side: Property Details */}
                <div className="property-info">
                    <h3>Property Details</h3>
                    <p><strong>Category:</strong> {property.category}</p>
                    <p><strong>Location:</strong> {property.barangay}</p>
                    <p><strong>Price:</strong> ₱{property.price.toLocaleString()}</p>
                    <p><strong>Address:</strong> {property.address}</p>
                    <p><strong>Pet Friendly:</strong> {property.petFriendly ? "Yes" : "No"}</p>
                    {property.petFriendly && <p><strong>Allowed Pets:</strong> {property.allowedPets}</p>}
                    <p><strong>Occupancy:</strong> {property.occupancy}</p>
                    <p><strong>Parking:</strong> {property.parking ? "Available" : "Not Available"}</p>
                    <p><strong>Rules:</strong> {property.rules}</p>
                    <p><strong>Landmarks:</strong> {property.landmarks}</p>
                    <p className="property-description"><strong>Description: </strong> {property.description}</p>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailPage;
