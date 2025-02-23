import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";  
import { AuthContext } from "../../context/AuthContext"; // Import AuthContext
import './LoginPage.css';
import { AiOutlineMail, AiOutlineLock, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
    const { login } = useContext(AuthContext); // Access login function from AuthContext
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [rememberMe, setRememberMe] = useState(false);
    
    const navigate = useNavigate();  

    // Load saved email if "Remember Me" was checked
    useEffect(() => {
        const savedEmail = localStorage.getItem('saved_email');
        if (savedEmail) {
            setFormData((prev) => ({ ...prev, email: savedEmail }));
            setRememberMe(true);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        if (!isValidEmail(formData.email)) {
            toast.error("Invalid email format");
            setLoading(false);
            return;
        }
    
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            setLoading(false);
            return;
        }
    
        try {
            const response = await fetch("http://localhost:4000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
    
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Incorrect email or password");
            }
    
            toast.success("Login successful! Redirecting...");
    
            // ✅ Save or remove email based on "Remember Me" checkbox
            if (rememberMe) {
                localStorage.setItem("saved_email", formData.email);
            } else {
                localStorage.removeItem("saved_email"); // Remove saved email if unchecked
            }
    
            // Save token & role in localStorage
            localStorage.setItem("user_token", data.token);
            login(data.role); // ✅ Update AuthContext state
    
            // Redirect based on user role
            if (data.role === "tenant") {
                navigate("/tenant-profile");
            } else if (data.role === "landlord") {
                navigate("/landlord-profile");
            } else {
                navigate("/");
            }
        } catch (error) {
            setError(error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };    

    return (
        <div className="login-page">
            <h1>Log In</h1>
            <form className="login-form" onSubmit={handleSubmit}>
                {error && <div className="error-message">{error}</div>}

                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <div className="input-wrapper">
                        <AiOutlineMail size={20} color="#777" />
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            autoComplete="email"
                            required
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-wrapper">
                        <AiOutlineLock size={20} color="#777" />
                        <input
                            type={passwordVisible ? 'text' : 'password'}
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            autoComplete="current-password"
                            required
                        />
                        <div className="eye-icon" onClick={() => setPasswordVisible(!passwordVisible)}>
                            {passwordVisible ? <AiOutlineEyeInvisible size={20} color="#777" /> : <AiOutlineEye size={20} color="#777" />}
                        </div>
                    </div>
                </div>

                <div className="remember-forgot">
                    <label>
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                            id="rememberMe"
                        />
                        Remember Me
                    </label>
                    <a href="/forgot-password">Forgot Password?</a>
                </div>

                <button className="login-btn" type="submit" disabled={loading}>
                    {loading ? <span className="spinner"></span> : 'Log In'}
                </button>

                <div className="signup-link">
                    Don't have an account? <span><a href="/register">Sign Up</a></span>
                </div>
            </form>

            <ToastContainer position="top-right" autoClose={5000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
};

export default LoginPage;
