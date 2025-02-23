import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("user_token");
    const role = localStorage.getItem("user_role");

    useEffect(() => {
        if (!token) {
            navigate("/login"); // Redirect to login if no token
        } else if (role !== allowedRole) {
            navigate("/"); // Redirect to home if wrong role
        }
    }, [navigate, token, role]);

    return children;
};

export default ProtectedRoute;
