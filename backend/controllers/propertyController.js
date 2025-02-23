import fs from "fs/promises"; // Use async file operations
import path from "path";
import multer from "multer";
import Property from "../models/Property.js";

// Ensure the uploads/properties directory exists
const uploadDir = path.join(process.cwd(), "uploads/properties/");
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({ storage }).array("images", 5); // Allow up to 5 images

// Helper: Format image paths for frontend
const formatImagePaths = (images) =>
    images.map(img => img.startsWith("http") ? img : `http://localhost:4000${img}`);

// Helper function to delete images
const deleteImages = async (imagesToDelete) => {
    try {
        for (const image of imagesToDelete) {
            const imagePath = path.join(process.cwd(), "uploads/properties", image);
            try {
                await fs.unlink(imagePath); // Delete the image file
                console.log(`Deleted image: ${imagePath}`);
            } catch (err) {
                console.error(`Failed to delete image ${imagePath}: ${err.message}`);
            }
        }
    } catch (err) {
        console.error("Error deleting images:", err);
    }
};

// 🏡 Add Property
export const addProperty = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ error: "Error uploading images" });

        try {
            const { title, description, address, price, barangay, category, petFriendly, allowedPets, occupancy, parking, rules, landmarks } = req.body;

            if (!title || !description || !address || !price || !barangay || !category) {
                return res.status(400).json({ error: "All required fields must be filled" });
            }

            const landlord = req.user.id;
            const images = req.files?.map(file => `/uploads/properties/${file.filename}`) || [];

            const newProperty = new Property({
                landlord, title, description, address, price, barangay, category, petFriendly, allowedPets, occupancy, parking, rules, landmarks, images
            });

            await newProperty.save();
            res.status(201).json({ message: "Property added successfully!", property: newProperty });

        } catch (error) {
            console.error("Add Property Error:", error);
            res.status(500).json({ error: "Server error while adding property" });
        }
    });
};

// 🏡 Get All Properties
export const getAllProperties = async (req, res) => {
    try {
        const properties = await Property.find().populate("landlord", "name email");
        res.status(200).json(properties.map(property => ({
            ...property._doc,
            images: formatImagePaths(property.images)
        })));
    } catch (error) {
        console.error("Get Properties Error:", error);
        res.status(500).json({ error: "Error fetching properties" });
    }
};

// 🏡 Get Properties by Landlord
export const getPropertiesByLandlord = async (req, res) => {
    try {
        const properties = await Property.find({ landlord: req.user.id }).populate("landlord", "name email");
        res.status(200).json(properties);
    } catch (error) {
        console.error("Get Landlord Properties Error:", error);
        res.status(500).json({ error: "Error fetching your properties" });
    }
};

// 🏡 Get Single Property
export const getProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate("landlord", "name email");
        if (!property) return res.status(404).json({ error: "Property not found" });

        res.status(200).json({
            ...property._doc,
            images: formatImagePaths(property.images)
        });
    } catch (error) {
        console.error("Get Property Error:", error);
        res.status(500).json({ error: "Error retrieving property" });
    }
};

// 🏡 Update Property
export const updateProperty = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ error: "Error uploading images" });

        try {
            const property = await Property.findById(req.params.id);
            if (!property) return res.status(404).json({ error: "Property not found" });

            if (property.landlord.toString() !== req.user.id) {
                return res.status(403).json({ error: "Unauthorized" });
            }

            let updatedImages = property.images;

            // Remove deleted images from the property
            if (req.body.deletedImages) {
                const imagesToDelete = req.body.deletedImages;
                updatedImages = updatedImages.filter(img => !imagesToDelete.includes(img.split("/").pop()));

                // Delete images from storage
                await deleteImages(imagesToDelete);
            }

            // Handle new image uploads
            if (req.files && req.files.length > 0) {
                const newUploadedImages = req.files.map(file => `/uploads/properties/${file.filename}`);
                updatedImages = [...updatedImages, ...newUploadedImages];
            }

            const updatedData = {
                ...req.body,
                images: updatedImages, // Keep only the updated images
            };

            const updatedProperty = await Property.findByIdAndUpdate(req.params.id, updatedData, { new: true });

            res.json(updatedProperty);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

// 🏡 Delete Property
export const deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ error: "Property not found" });

        if (property.landlord.toString() !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        // Remove images asynchronously
        await deleteImages(property.images);

        await property.deleteOne();
        res.status(200).json({ message: "Property deleted successfully" });

    } catch (error) {
        console.error("Delete Property Error:", error);
        res.status(500).json({ error: "Error deleting property" });
    }
};