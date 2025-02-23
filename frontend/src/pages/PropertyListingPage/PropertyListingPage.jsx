import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./PropertyListingPage.css";

const PropertyListingPage = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        searchTerm: "",
        category: "",
        location: "",
        minPrice: "",
        maxPrice: "",
        petFriendly: false,
        allowedPets: "",
        occupancy: "",
        parking: false,
        landmarks: ""
    });

    // Fetch properties from API
    const fetchProperties = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:4000/api/properties");
            if (!response.ok) throw new Error("Failed to fetch properties");

            const data = await response.json();
            setProperties(data);
        } catch (error) {
            toast.error("Error fetching properties");
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    // Extract unique values for dropdown filters
    const categories = [...new Set(properties.map((prop) => prop.category))];
    const locations = [...new Set(properties.map((prop) => prop.barangay))];
    const petTypes = [...new Set(properties.map((prop) => prop.allowedPets))];

    // Handle filter changes
    const updateFilter = useCallback((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    // Filter properties
    const matchesFilters = ({ title, category, barangay, price, petFriendly, allowedPets, occupancy, parking, landmarks }) => {
        const normalizedSearch = filters.searchTerm.toLowerCase().trim();
        
        return (
            (normalizedSearch ? title.toLowerCase().includes(normalizedSearch) || barangay.toLowerCase().includes(normalizedSearch) : true) &&
            (filters.category ? category === filters.category : true) &&
            (filters.location ? barangay === filters.location : true) &&
            (filters.minPrice ? price >= Number(filters.minPrice) : true) &&
            (filters.maxPrice ? price <= Number(filters.maxPrice) : true) &&
            (filters.petFriendly ? petFriendly === true : true) &&
            (filters.allowedPets ? allowedPets === filters.allowedPets : true) &&
            (filters.occupancy ? occupancy >= Number(filters.occupancy) : true) &&
            (filters.parking ? parking === true : true) &&
            (filters.landmarks ? landmarks.toLowerCase().includes(filters.landmarks.toLowerCase()) : true)
        );
    };

    const filteredProperties = properties.filter(matchesFilters);

    if (loading) return <div className="loading">Loading properties...</div>;

    return (
        <div className="property-listing-container">
            <div className="property-listing-header">
                <h2>Property Listings</h2>

                {/* Search Input (Above Filters) */}
                <div className="search-input-container">
                    <input
                        type="text"
                        placeholder="Search properties..."
                        value={filters.searchTerm}
                        onChange={(e) => updateFilter("searchTerm", e.target.value)}
                        className="property-search"
                    />
                </div>

                {/* Filters */}
                <div className="filters">
                    <select value={filters.category} onChange={(e) => updateFilter("category", e.target.value)}>
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>

                    <select value={filters.location} onChange={(e) => updateFilter("location", e.target.value)}>
                        <option value="">All Locations</option>
                        {locations.map((location) => (
                            <option key={location} value={location}>
                                {location}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        placeholder="Min Price"
                        value={filters.minPrice}
                        onChange={(e) => updateFilter("minPrice", e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Max Price"
                        value={filters.maxPrice}
                        onChange={(e) => updateFilter("maxPrice", e.target.value)}
                    />

                    <label>
                        <input
                            type="checkbox"
                            checked={filters.petFriendly}
                            onChange={() => updateFilter("petFriendly", !filters.petFriendly)}
                        />
                        Pet Friendly
                    </label>

                    <select value={filters.allowedPets} onChange={(e) => updateFilter("allowedPets", e.target.value)}>
                        <option value="">All Pets</option>
                        {petTypes.map((pet) => (
                            <option key={pet} value={pet}>
                                {pet}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        placeholder="Min Occupancy"
                        value={filters.occupancy}
                        onChange={(e) => updateFilter("occupancy", e.target.value)}
                    />

                    <label>
                        <input
                            type="checkbox"
                            checked={filters.parking}
                            onChange={() => updateFilter("parking", !filters.parking)}
                        />
                        Parking Available
                    </label>

                    <input
                        type="text"
                        placeholder="Nearby Landmarks"
                        value={filters.landmarks}
                        onChange={(e) => updateFilter("landmarks", e.target.value)}
                    />
                </div>
            </div>

            {/* Property Listings */}
            <div className="properties-grid">
                {filteredProperties.length > 0 ? (
                    filteredProperties.map(({ _id, title, category, barangay, price, images }) => (
                        <div key={_id} className="property-card">
                            <div className="property-images">
                                <img 
                                    src={images?.[0] || "/default-property.jpg"} 
                                    alt={title} 
                                    className="property-image" 
                                />
                            </div>
                            <div className="property-details">
                                <h3>{title}</h3>
                                <p><strong>Category:</strong> {category}</p>
                                <p><strong>Location:</strong> {barangay}</p>
                                <p><strong>Price:</strong> ₱{price.toLocaleString()}</p>
                                <div className="property-actions">
                                    <button onClick={() => navigate(`/property/${_id}`)} className="view-btn">
                                        View Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-properties-message">No properties found.</div>
                )}
            </div>
        </div>
    );
};

export default PropertyListingPage;
