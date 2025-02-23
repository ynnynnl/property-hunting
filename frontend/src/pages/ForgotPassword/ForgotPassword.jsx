import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import validator from "validator"; // Import validator package
import "./ForgotPassword.css"; // Ensure CSS is imported

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); // New state for confirm password
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility

    // Email Normalization
    const normalizeEmail = (email) => email.trim().toLowerCase();
    
    // Password validation function using validator
    const isValidPassword = (password) => {
        const options = {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        };
        return validator.isStrongPassword(password, options);
    };

    // Handle sending OTP to email
    const handleSendOtp = async () => {
        if (!email) {
            toast.error("Please enter your email.");
            return;
        }

        setOtpLoading(true);
        try {
            const response = await axios.post("http://localhost:4000/api/auth/forgot-password", {
                email: normalizeEmail(email),
            });
            toast.success(response.data.msg);
            setOtpSent(true);
        } catch (error) {
            console.error("Error sending OTP:", error);
            toast.error(error.response?.data?.msg || "Something went wrong");
        } finally {
            setOtpLoading(false);
        }
    };

    // Handle resetting the password
    const handleResetPassword = async () => {
        if (!otp || !newPassword || !confirmPassword) {
            toast.error("Please enter OTP and both passwords.");
            return;
        }

        // Validate the new password
        if (!isValidPassword(newPassword)) {
            toast.error("Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.");
            return;
        }

        // Check if new password and confirm password match
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post("http://localhost:4000/api/auth/reset-password", {
                email: normalizeEmail(email),
                otp,
                newPassword,
            });

            toast.success(response.data.msg);
            console.log("Password reset successful:", response.data);

            // Redirect user after success (optional)
            setTimeout(() => {
                window.location.href = "/login"; // Change this based on your routing setup
            }, 2000);
        } catch (error) {
            console.error("Error resetting password:", error);
            toast.error(error.response?.data?.msg || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={(e) => e.preventDefault()} className="forgot-password-page">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
            
            <div className="forgot-password-box">
                <h2>Forgot Password</h2>
                <div className="fp-input-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email" // Added autoComplete
                    />
                </div>

                {!otpSent ? (
                    <button className="fp-btn-primary" onClick={handleSendOtp} disabled={otpLoading}>
                        {otpLoading ? "Sending OTP..." : "Send OTP"}
                    </button>
                ) : (
                    <div className="fp-otp-section">
                        <div className="fp-input-group">
                            <label htmlFor="otp">Enter OTP</label>
                            <input
                                type="text"
                                id="otp"
                                name="otp"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                autoComplete="one-time-code" // Added autoComplete
                            />
                        </div>

                        <div className="fp-input-group">
                            <label htmlFor="newPassword">New Password</label>
                            <div className="password-field">
                                <input
                                    type={showPassword ? "text" : "password"} // Toggle password visibility
                                    id="newPassword"
                                    name="newPassword"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="toggle-password-btn"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <div className="fp-input-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="password-field">
                                <input
                                    type={showConfirmPassword ? "text" : "password"} // Toggle confirm password visibility
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="toggle-password-btn"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                >
                                    {showConfirmPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <button className="fp-btn-primary" onClick={handleResetPassword} disabled={loading}>
                            {loading ? "Resetting Password..." : "Reset Password"}
                        </button>
                    </div>
                )}
            </div>
        </form>
    );
};

export default ForgotPassword;
