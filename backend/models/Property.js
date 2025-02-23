import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  barangay: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Apartment", "Condo", "Dorm", "House", "Studio"], // Optional: Restrict category options
  },
  petFriendly: {
    type: Boolean,
    default: false,
  },
  allowedPets: {
    type: String,
    default: "",
  },
  occupancy: {
    type: Number,
    required: true,
    default: 1, 
  },
  parking: {
    type: Boolean,
    default: false,
  },
  rules: {
    type: String,
    default: "",
  },
  landmarks: {
    type: String,
    default: "",
  },
  images: {
    type: [String], // Storing image URLs
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Property", propertySchema);
