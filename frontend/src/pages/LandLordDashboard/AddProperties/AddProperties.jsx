import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from "../../../context/AuthContext"; // Adjust path as needed
import './AddProperties.css';

const AddProperties = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [propertyData, setPropertyData] = useState({
        title: "",
        description: "",
        address: "",
        price: "",
        barangay: "",
        category: "",
        petFriendly: false,
        allowedPets: "",
        occupancy: "",
        parking: false,
        rules: "",
        landmarks: "",
        images: []
    });
    const [imagePreviews, setImagePreviews] = useState([]);

    const barangayList = [
        "Assumption",
        "Bagong Buhay I", "Bagong Buhay II", "Bagong Buhay III",
        "Ciudad Real", "Citrus",
        "Dulong Bayan",
        "Fatima I", "Fatima II", "Fatima III", "Fatima IV", "Fatima V",
        "Francisco Homes – Guijo", "Francisco Homes – Mulawin", "Francisco Homes – Narra", "Francisco Homes – Yakal",
        "Gaya-gaya", "Graceville", "Gumaok Central", "Gumaok East", "Gumaok West",
        "Kaybanban", "Kaypian",
        "Lawang Pare",
        "Maharlika", "Minuyan I", "Minuyan II", "Minuyan III", "Minuyan IV", "Minuyan V", "Minuyan Proper",
        "Muzon East", "Muzon Proper", "Muzon South", "Muzon West",
        "Paradise III", "Poblacion", "Poblacion 1",
        "San Isidro", "San Manuel", "San Martin De Porres", "San Martin I", "San Martin II", "San Martin III", "San Martin IV",
        "San Pedro", "San Rafael I", "San Rafael II", "San Rafael III", "San Rafael IV", "San Rafael V",
        "San Roque", "Sapang Palay Proper",
        "Sta. Cruz I", "Sta. Cruz II", "Sta. Cruz III", "Sta. Cruz IV", "Sta. Cruz V",
        "Sto. Cristo", "Sto. Nino I", "Sto. Nino II",
        "Tungkong Mangga"
    ];

    const categories = ["Apartment", "Condo", "Dorm", "House", "Studio"];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPropertyData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setPropertyData(prev => ({
            ...prev,
            images: files
        }));
        setImagePreviews(files.map(file => URL.createObjectURL(file)));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("user_token");

        if (!token) {
            toast.error("No token found. Please log in.");
            navigate("/login");
            return;
        }

        // Add validation for required fields
        if (!propertyData.title || !propertyData.description || !propertyData.address || !propertyData.price || !propertyData.barangay || !propertyData.category) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (propertyData.images.length === 0) {
            toast.error("Please upload at least one image of the property.");
            return;
        }

        const formData = new FormData();
        Object.entries(propertyData).forEach(([key, value]) => {
            if (key === 'images') {
                value.forEach(image => formData.append(key, image));
            } else {
                formData.append(key, value);
            }
        });

        try {
            const response = await fetch("http://localhost:4000/api/properties/add", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                toast.success("Property added successfully!");
                navigate("/my-properties");
            } else {
                toast.error("Failed to add property.");
            }
        } catch (error) {
            toast.error("Error adding property.");
            console.error("Error:", error);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <h2>Landlord Dashboard</h2>
                <ul>
                    <li onClick={() => navigate("/landlord-profile")}>Profile</li>
                    <li className="active">Add Properties</li>
                    <li onClick={() => navigate("/my-properties")}>My Properties</li>
                    <li onClick={() => navigate("/messages")}>Messages</li>
                    <li onClick={logout} className="logout">Logout</li>
                </ul>
            </div>

            <div className="main-content">
                <form onSubmit={handleSubmit} className="add-property-container">
                    <label htmlFor="title" className="required">Title</label>
                    <input
                        className="input-field"
                        type="text"
                        id="title"
                        name="title"
                        value={propertyData.title}
                        onChange={handleInputChange}
                        required
                        autoComplete="off"
                    />

                    <label htmlFor="description" className="required">Description</label>
                    <textarea
                        className="textarea-field"
                        id="description"
                        name="description"
                        value={propertyData.description}
                        onChange={handleInputChange}
                        required
                        autoComplete="off"
                    />

                    <label htmlFor="address" className="required">Address</label>
                    <input
                        className="input-field"
                        type="text"
                        id="address"
                        name="address"
                        value={propertyData.address}
                        onChange={handleInputChange}
                        required
                        autoComplete="street-address"
                    />

                    <label htmlFor="barangay" className="required">Barangay</label>
                    <select
                        className="select-field"
                        id="barangay"
                        name="barangay"
                        value={propertyData.barangay}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Barangay</option>
                        {barangayList.map((barangay, index) => (
                            <option key={index} value={barangay}>{barangay}</option>
                        ))}
                    </select>

                    <label htmlFor="category" className="required">Category</label>
                    <select
                        className="select-field"
                        id="category"
                        name="category"
                        value={propertyData.category}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Category</option>
                        {categories.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                        ))}
                    </select>

                    <label htmlFor="price" className="required">Price (PHP)</label>
                    <input
                        className="input-field"
                        type="number"
                        id="price"
                        name="price"
                        value={propertyData.price}
                        onChange={handleInputChange}
                        min="0"
                        required
                        autoComplete="off"
                    />

                    <div className="additional-info">
                        <div className="checkbox-group">
                            <input
                                type="checkbox"
                                id="petFriendly"
                                name="petFriendly"
                                checked={propertyData.petFriendly}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="petFriendly">Pet-Friendly</label>
                        </div>

                        {propertyData.petFriendly && (
                            <div className="conditional-field">
                                <label htmlFor="allowedPets">Allowed Pets</label>
                                <input
                                    className="input-field"
                                    type="text"
                                    id="allowedPets"
                                    name="allowedPets"
                                    value={propertyData.allowedPets}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Dogs, Cats"
                                    autoComplete="off"
                                />
                            </div>
                        )}
                    </div>

                    <label htmlFor="occupancy" className="required">Max Occupancy</label>
                    <input
                        className="input-field"
                        type="number"
                        id="occupancy"
                        name="occupancy"
                        value={propertyData.occupancy}
                        onChange={handleInputChange}
                        min="1"
                        required
                        autoComplete="off"
                    />

                    <div className="additional-info">
                        <div className="checkbox-group">
                            <input
                                type="checkbox"
                                id="parking"
                                name="parking"
                                checked={propertyData.parking}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="parking">Parking Available</label>
                        </div>
                    </div>

                    <label htmlFor="landmarks">Landmarks</label>
                    <input
                        className="input-field"
                        type="text"
                        id="landmarks"
                        name="landmarks"
                        value={propertyData.landmarks}
                        onChange={handleInputChange}
                        placeholder="Nearby school, mall, hospital, etc."
                        autoComplete="off"
                    />

                    <label htmlFor="rules">House Rules</label>
                    <textarea
                        className="textarea-field"
                        id="rules"
                        name="rules"
                        value={propertyData.rules}
                        onChange={handleInputChange}
                        placeholder="e.g., No loud noises after 10 PM, No smoking inside"
                        autoComplete="off"
                    />

                    <label htmlFor="images" className="required">Images</label>
                    <input
                        className="file-input"
                        type="file"
                        id="images"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        required
                    />
                    <div className="image-preview-container">
                        {imagePreviews.map((src, index) => (
                            <img key={index} src={src} alt={`Property Image ${index + 1}`} className="image-preview" />
                        ))}
                    </div>

                    <button type="submit" className="submit-button">Add Property</button>
                </form>
            </div>
        </div>
    );
};

export default AddProperties;
