import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EditProperty.css";

const categories = ["Apartment", "Condo", "Dorm", "House", "Studio"];
const barangays = [
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

const EditProperty = () => {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [formData, setFormData] = useState({
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
        landmarks: ""
    });
    const [images, setImages] = useState([]); // Existing images
    const [newImages, setNewImages] = useState([]); // Newly added images
    const [deletedImages, setDeletedImages] = useState([]); // Track deleted images
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const userToken = localStorage.getItem("user_token");
                if (!userToken) throw new Error("Unauthorized access. Please log in.");

                const response = await fetch(`http://localhost:4000/api/properties/${propertyId}`, {
                    headers: { Authorization: `Bearer ${userToken}` },
                });

                if (!response.ok) throw new Error("Failed to fetch property details.");

                const data = await response.json();
                setProperty(data);
                setFormData({
                    title: data.title,
                    description: data.description,
                    address: data.address,
                    price: data.price,
                    barangay: data.barangay,
                    category: data.category,
                    petFriendly: data.petFriendly,
                    allowedPets: data.allowedPets,
                    occupancy: data.occupancy,
                    parking: data.parking,
                    rules: data.rules,
                    landmarks: data.landmarks
                });
                setImages(data.images || []);
                setLoading(false);
            } catch (error) {
                toast.error(error.message || "Error fetching property.");
                setLoading(false);
            }
        };
        fetchProperty();
    }, [propertyId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newValidImages = files.filter(
            (file) => !newImages.some((existing) => existing.name === file.name)
        );

        if (newValidImages.length === 0) {
            toast.warning("Image already selected or invalid.");
            return;
        }

        setNewImages((prev) => [...prev, ...newValidImages]);
    };

    const handleDeleteImage = (index, isExisting) => {
        if (isExisting) {
            const imageToDelete = images[index];
            setDeletedImages((prev) => [...prev, imageToDelete]); // Track deleted images
            setImages(images.filter((_, i) => i !== index)); // Remove from UI
        } else {
            setNewImages(newImages.filter((_, i) => i !== index)); // Remove new images
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userToken = localStorage.getItem("user_token");
            if (!userToken) throw new Error("Unauthorized access. Please log in.");

            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                formDataToSend.append(key, value);
            });

            images.forEach((img) => formDataToSend.append("existingImages", img));
            deletedImages.forEach((img) => formDataToSend.append("deletedImages[]", img.split("/").pop()));
            newImages.forEach((image) => formDataToSend.append("images", image));

            const response = await fetch(`http://localhost:4000/api/properties/${propertyId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${userToken}` },
                body: formDataToSend,
            });

            if (!response.ok) throw new Error("Failed to update property.");

            const updatedProperty = await response.json();
            setImages(updatedProperty.images); // Update state to reflect backend changes
            setDeletedImages([]); // Clear deleted images
            setNewImages([]); // Clear newly added images

            toast.success("Property updated successfully!");
            navigate("/my-properties");
        } catch (error) {
            toast.error(error.message || "Error updating property.");
        }
    };

    return (
        <div className="edit-property-container">
            <h2>Edit Property</h2>
            <br />
            {loading ? (
                <p>Loading property details...</p>
            ) : (
                <form onSubmit={handleSubmit} className="edit-property-form">
                    <label>Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required />

                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required />

                    <label>Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} required />

                    <label>Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} required>
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    <label>Location</label>
                    <select name="barangay" value={formData.barangay} onChange={handleChange} required>
                        <option value="">Select a barangay</option>
                        {barangays.map((brgy) => (
                            <option key={brgy} value={brgy}>
                                {brgy}
                            </option>
                        ))}
                    </select>

                    <label>Price (₱)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} required min="1" />

                    <label>Max Occupancy</label>
                    <input type="number" name="occupancy" value={formData.occupancy} onChange={handleChange} required min="1" />

                    <div className="checkbox-group">
                        <input type="checkbox" name="petFriendly" checked={formData.petFriendly} onChange={handleChange} />
                        <label>Pet-Friendly</label>
                    </div>

                    {formData.petFriendly && (
                        <div>
                            <label>Allowed Pets</label>
                            <input type="text" name="allowedPets" value={formData.allowedPets} onChange={handleChange} placeholder="e.g., Dogs, Cats" />
                        </div>
                    )}

                    <div className="checkbox-group">
                        <input type="checkbox" name="parking" checked={formData.parking} onChange={handleChange} />
                        <label>Parking Available</label>
                    </div>

                    <label>Landmarks</label>
                    <input type="text" name="landmarks" value={formData.landmarks} onChange={handleChange} placeholder="Nearby school, mall, hospital, etc." />

                    <label>House Rules</label>
                    <textarea name="rules" value={formData.rules} onChange={handleChange} placeholder="e.g., No loud noises after 10 PM, No smoking inside" />

                    {/* EXISTING IMAGES */}
                    <label>Current Images</label>
                    <div className="image-preview-container">
                        {images.length > 0 ? (
                            images.map((img, index) => {
                                const imageUrl = img.startsWith("http") ? img : `http://localhost:4000${img}`;
                                return (
                                    <div key={index} className="image-item">
                                        <img src={imageUrl} alt={`Property ${index}`} className="property-image" />
                                        <button type="button" onClick={() => handleDeleteImage(index, true)}>❌</button>
                                    </div>
                                );
                            })
                        ) : (
                            <p>No images available</p>
                        )}
                    </div>

                    {/* NEW IMAGES */}
                    <label>Upload New Images</label>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} />

                    <div className="image-preview-container">
                        {newImages.map((image, index) => (
                            <div key={index} className="image-item">
                                <img src={URL.createObjectURL(image)} alt={`New ${index}`} className="property-image" />
                                <button type="button" onClick={() => handleDeleteImage(index, false)}>❌</button>
                            </div>
                        ))}
                    </div>

                    <button type="submit">Update Property</button>
                </form>
            )}
        </div>
    );
};

export default EditProperty;