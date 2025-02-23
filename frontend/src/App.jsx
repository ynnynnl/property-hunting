// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AuthProvider from "./context/AuthContext"; // Import AuthProvider

// Pages
import HomePage from "./pages/HomePage/HomePage";
import PropertyDetailPage from "./pages/PropertyDetailPage/PropertyDetailPage";
import PropertyListingPage from "./pages/PropertyListingPage/PropertyListingPage"; // ✅ Added import
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import VerifyOTP from "./pages/VerifyEmail/VerifyOTP";

// Landlord Dashboard Pages
import LandlordDashboard from "./pages/LandLordDashboard/Dashboard/LandLordDashboard";
import AddProperties from "./pages/LandLordDashboard/AddProperties/AddProperties";
import MyProperties from "./pages/LandLordDashboard/MyProperties/MyProperties";
import EditProperty from "./pages/LandLordDashboard/MyProperties/EditProperty/EditProperty";
import ViewProperty from "./pages/LandLordDashboard/MyProperties/ViewProperty/ViewProperty";

// Tenant Dashboard
import TenantDashboard from "./pages/TenantDashboard/Dashboard/TenantDashboard";

// Components
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

// Notifications
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AppContent = () => {
    return (
        <div>
            {/* ✅ Navbar is always visible */}
            <Navbar />

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/properties" element={<PropertyListingPage />} /> {/* ✅ Added Route */}
                <Route path="/property/:id" element={<PropertyDetailPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />

                {/* ✅ Protected Routes with Role-Based Access */}
                <Route
                    path="/tenant-profile"
                    element={
                        <ProtectedRoute allowedRole="tenant">
                            <TenantDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/landlord-profile"
                    element={
                        <ProtectedRoute allowedRole="landlord">
                            <LandlordDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/add-properties"
                    element={
                        <ProtectedRoute allowedRole="landlord">
                            <AddProperties />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/my-properties"
                    element={
                        <ProtectedRoute allowedRole="landlord">
                            <MyProperties />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/edit-property/:propertyId"
                    element={
                        <ProtectedRoute allowedRole="landlord">
                            <EditProperty />
                        </ProtectedRoute>
                    }
                />
                <Route path="/property/:propertyId" element={<ViewProperty />} />
            </Routes>

            <Footer />
            <ToastContainer />
        </div>
    );
};

function App() {
    return (
        <AuthProvider> {/* ✅ Wrap entire app with AuthProvider */}
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;
