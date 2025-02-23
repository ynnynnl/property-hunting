import express from "express";
import { protect, roleCheck } from "../middleware/authMiddleware.js";
import {
    getTenantDashboard,
    getLandlordDashboard,
    changePassword,
    updateProfile,
    uploadProfilePic
} from "../controllers/userController.js";

const router = express.Router();

// ✅ Tenant Routes
router.get("/tenant-dashboard", protect, roleCheck("tenant"), getTenantDashboard);

// ✅ Landlord Routes
router.get("/landlord-dashboard", protect, roleCheck("landlord"), getLandlordDashboard);

// ✅ Change Password Route
router.post("/change-password", protect, changePassword);

// ✅ Update Profile Route (Including Profile Picture Upload)
router.put("/update-profile", protect, uploadProfilePic, updateProfile);

export default router;
