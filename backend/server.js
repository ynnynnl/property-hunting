import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js'; // Import route
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { protect } from './middleware/authMiddleware.js'; // Import authentication middleware
import User from './models/User.js'; // Import User model

// Initialize Express
const app = express();
const port = 4000;

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure Multer for Profile Picture Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/profiles/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Serve static files for profile pictures
app.use('/uploads/profiles', express.static(path.join(__dirname, 'uploads/profiles')));
app.use('/uploads/properties', express.static(path.join(__dirname, 'uploads/properties')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes); // Ensure this is included

// Example route
app.get('/', (req, res) => {
    res.send('Hello, MongoDB connected!');
});

// Profile update route with authentication
app.put('/api/users/update-profile', protect, upload.single('profilePic'), async (req, res) => {
    try {
        const { fullName, address, contactNumber } = req.body;
        const profilePic = req.file ? req.file.filename : req.user.profilePic; // Keep old pic if not changed

        // Update user in database
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, 
            { fullName, address, contactNumber, profilePic },
            { new: true }
        );

        res.json({
            message: 'Profile updated successfully',
            user: {
                ...updatedUser.toObject(),
                profilePicUrl: `http://localhost:${port}/uploads/profiles/${updatedUser.profilePic}`,
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
