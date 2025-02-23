import express from "express";
import {
    addProperty,
    getAllProperties,
    getProperty,
    updateProperty,
    deleteProperty,
    getPropertiesByLandlord
} from "../controllers/propertyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🏡 Property Management Routes
router.post("/add", protect, addProperty); // Add a new property (protected)
router.get("/", getAllProperties); // Get all properties
router.get("/my-properties", protect, getPropertiesByLandlord); // Get properties of logged-in landlord
router.get("/:id", getProperty); // Get a single property by ID

router.put("/:id", protect, updateProperty); // Update a property (protected)
router.delete("/:id", protect, deleteProperty); // Delete a property (protected)

export default router;
