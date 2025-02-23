import jwt from "jsonwebtoken";
import User from "../models/User.js";
import multer from "multer";

// Protect routes by verifying JWT
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "🚨 Not authorized, no token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password"); // Fetch user without password

        if (!req.user) {
            return res.status(401).json({ message: "🚨 User not found" });
        }

        next();
    } catch (error) {
        res.status(401).json({ message: "🚨 Token is invalid" });
    }
};

// Middleware to check if user has required role
export const roleCheck = (role) => (req, res, next) => {
    if (!req.user || req.user.role !== role) {
        return res.status(403).json({ message: "🚨 Access denied" });
    }
    next();
};

// Profile Picture Upload Middleware (using multer)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Save uploaded files to the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user.id}-${Date.now()}-${file.originalname}`); // Create unique filename
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Max file size 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"), false);
        }
    }
});

// Export the upload middleware for use in routes
export const uploadProfilePic = upload.single("profilePic"); // Single file upload with the field name 'profilePic'
