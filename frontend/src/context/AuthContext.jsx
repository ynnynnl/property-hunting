import { createContext, useState, useEffect } from "react";

// Create context
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);

  // Load user role from localStorage when app starts
  useEffect(() => {
    const role = localStorage.getItem("user_role");
    if (role) {
      setUserRole(role);
    }
  }, []);

  // Function to set role on login
  const login = (role) => {
    localStorage.setItem("user_role", role);
    setUserRole(role); // Update state immediately
  };

  // Function to clear role on logout
  const logout = () => {
    localStorage.removeItem("user_role");
    setUserRole(null); // Update state immediately
  };

  return (
    <AuthContext.Provider value={{ userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
