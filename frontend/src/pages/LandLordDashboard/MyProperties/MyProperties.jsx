import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from "../../../context/AuthContext"; 
import './MyProperties.css';

const MyProperties = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchProperties = async () => {
            const token = localStorage.getItem("user_token");

            if (!token) {
                toast.error("No token found. Redirecting to login...");
                setTimeout(() => navigate("/login"), 1500);
                return;
            }

            try {
                const response = await fetch("http://localhost:4000/api/properties/my-properties", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch properties');
                }

                const data = await response.json();
                setProperties(data);
            } catch (error) {
                toast.error("Error fetching properties");
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    const handleEdit = (propertyId) => navigate(`/edit-property/${propertyId}`);
    const handleView = (propertyId) => navigate(`/property/${propertyId}`);

    const handleDelete = async (propertyId) => {
        const token = localStorage.getItem("user_token");

        if (!token) {
            toast.error("No token found. Redirecting to login...");
            navigate("/login");
            return;
        }

        if (window.confirm('Are you sure you want to delete this property?')) {
            try {
                const response = await fetch(`http://localhost:4000/api/properties/${propertyId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    toast.success("Property deleted successfully");
                    setProperties(prev => prev.filter(p => p._id !== propertyId));
                } else {
                    toast.error("Failed to delete property");
                }
            } catch (error) {
                toast.error("Error deleting property");
                console.error("Error:", error);
            }
        }
    };

    if (loading) {
        return <div>Loading properties...</div>;
    }

    const filteredProperties = properties.filter(property =>
        (property.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (property.address?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <div className="my-properties-container">
            <div className="sidebar">
                <h2>My Properties</h2>
                <ul>
                    <li onClick={() => navigate("/landlord-profile")}>Profile</li>
                    <li onClick={() => navigate("/add-properties")}>Add Properties</li>
                    <li className="active">My Properties</li>
                    <li onClick={() => navigate("/messages")}>Messages</li>
                    <li onClick={logout} className="logout">Logout</li>
                </ul>
            </div>

            <div className="main-content">
                <div className="search-filter-container">
                    <input
                        type="text"
                        placeholder="Search properties..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="properties-grid">
                    {filteredProperties.map((property) => (
                        <div key={property._id} className="property-card">
                            <div className="property-images">
                                <img
                                    src={`http://localhost:4000${property.images?.[0] || '/uploads/properties/default-property.jpg'}`}
                                    alt="Property"
                                    className="property-image"
                                />
                            </div>
                            <div className="property-details">
                                <h3>{property.title}</h3>
                                <p>Category: {property.category}</p>
                                <p>Location: {property.barangay}</p>
                                <p>Price: ₱{Number(property.price).toLocaleString()}</p>
                                <div className="property-actions">
                                    <button onClick={() => handleView(property._id)} className="view-btn">View</button>
                                    <button onClick={() => handleEdit(property._id)} className="edit-btn">Edit</button>
                                    <button onClick={() => handleDelete(property._id)} className="delete-btn">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProperties.length === 0 && (
                    <div className="no-properties-message">
                        <p>You don't have any properties listed yet.</p>
                        <button onClick={() => navigate("/add-properties")}>Add Property</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyProperties;
