import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: false,  // not required, just default value
        default: '',  // default value is empty string
    },
    address: {
        type: String,
        required: false,  // not required, just default value
        default: '',  // default value is empty string
    },    
    contactNumber: { 
        type: String, 
        required: true, 
        trim: true 
    },
    password: {
        type: String,
        required: true,
    },
    profilePic: {  // New field for storing the profile picture filename
        type: String,
        default: '', // Default value is an empty string if no profile picture is uploaded
    },
    role: {
        type: String,
        enum: ['tenant', 'landlord'],
        default: 'tenant',
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String, // Store hashed OTP
    },
    otpExpiration: {
        type: Date,
    },
}, { timestamps: true });

// Hash OTP before saving
UserSchema.methods.setOtp = async function (otp) {
    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(otp, salt);
};

// Compare OTP when verifying
UserSchema.methods.verifyOtp = async function (enteredOtp) {
    return await bcrypt.compare(enteredOtp, this.otp);
};

export default mongoose.model('User', UserSchema);
