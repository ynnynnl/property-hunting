import fs from 'fs'; // Import fs module
import User from "../models/User.js"; // Ensure correct path
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";

// ✅ Login User (Includes Role & Token)
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            token,
            role: user.role // ✅ Ensuring role is included in response
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Fetch Tenant Dashboard Data (Includes Profile)
export const getTenantDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");

        if (!user || user.role !== "tenant") {
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json({
            role: user.role,
            profilePic: user.profilePic || "",
            fullName: user.fullName || "N/A",
            username: user.username || "N/A",
            address: user.address || "N/A",
            contactNumber: user.contactNumber || "N/A"
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching tenant data" });
    }
};

// ✅ Fetch Landlord Dashboard Data (Includes Profile)
export const getLandlordDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");

        if (!user || user.role !== "landlord") {
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json({
            role: user.role,
            profilePic: user.profilePic || "",
            fullName: user.fullName || "N/A",
            username: user.username || "N/A",
            address: user.address || "N/A",
            contactNumber: user.contactNumber || "N/A"
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching landlord data" });
    }
};

// ✅ Change Password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (newPassword.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error changing password" });
    }
};

// ✅ Profile Picture Upload (Middleware for handling file uploads)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/profiles/';
        
        // Check if the directory exists, and create it if it doesn't
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // Create the directory if it doesn't exist
        }

        cb(null, uploadPath); // Proceed with the destination
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique file name
    }
});

const upload = multer({ storage });

// ✅ Upload Profile Picture
export const uploadProfilePic = upload.single('profilePic'); // Use the multer middleware to handle profile picture uploads

// ✅ Update Profile (Including Profile Picture)
export const updateProfile = async (req, res) => {
    try {
        const { fullName, address, contactNumber } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Update user details
        user.fullName = fullName || user.fullName;
        user.address = address || user.address;
        user.contactNumber = contactNumber || user.contactNumber;

        // If profile picture is uploaded, update the user's profilePic field
        if (req.file) {
            user.profilePic = req.file.filename; // Store only the filename
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            userData: {
                username: user.username,
                fullName: user.fullName,
                address: user.address,
                contactNumber: user.contactNumber,
                profilePic: user.profilePic ? `http://localhost:4000/uploads/profiles/${user.profilePic}` : "", // Construct full URL
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile" });
    }
};