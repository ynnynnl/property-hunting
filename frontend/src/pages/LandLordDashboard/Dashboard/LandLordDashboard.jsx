import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import images from "../../../assets/assets";
import './LandLordDashboard.css';
import { AuthContext } from "../../../context/AuthContext"; // Adjust the path as necessary

const LandlordDashboard = () => {
    const { logout } = useContext(AuthContext); // Access the logout function
    const navigate = useNavigate();
    const [role, setRole] = useState("");
    const [userData, setUserData] = useState({
        username: "",
        fullName: "",
        address: "",
        contactNumber: "",
        profilePic: ""
    });
    const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "" });
    const [isUpdated, setIsUpdated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("user_token");

        if (!token) {
            toast.error("No token found. Redirecting to homepage...");
            console.log("No token found");
            navigate("/");
            return;
        }

        const verifyTokenExpiry = () => {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = decodedToken.exp * 1000;
            if (Date.now() >= expirationTime) {
                toast.error("Session expired. Please log in again.");
                console.log("Session expired");
                localStorage.removeItem("user_token");
                navigate("/login");
                return false;
            }
            return true;
        };

        if (!verifyTokenExpiry()) return;

        const fetchDashboardData = async () => {
            try {
                const response = await fetch("http://localhost:4000/api/users/landlord-dashboard", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json(); // Rename `data` to avoid confusion

                if (response.ok && data.role === "landlord") {
                    setRole("landlord");
                    console.log("Fetched landlord data:", data);
                    setUserData({
                        username: data.username,
                        fullName: data.fullName || "",
                        address: data.address || "",
                        contactNumber: data.contactNumber || "",
                        profilePic: data.profilePic ? `http://localhost:4000/uploads/profiles/${data.profilePic}` : images.avatar, // Correct URL construction
                    });
                } else {
                    toast.error("User is not a landlord. Redirecting...");
                    console.log("User is not a landlord");
                    navigate("/");
                }
            } catch (error) {
                toast.error("Error fetching landlord dashboard");
                console.log("Error fetching landlord dashboard:", error);
                navigate("/");
            }
        };

        fetchDashboardData();
    }, [navigate, isUpdated]);

    const handleLogout = () => {
        logout(); // Use the logout function from AuthContext
        localStorage.removeItem("user_token"); // Remove the token from localStorage
        toast.success("Logged out successfully");
        console.log("Logged out successfully");
        navigate("/");
        window.dispatchEvent(new Event("storage")); // Notify other components
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("user_token");

        if (!token) {
            toast.error("No token found. Please log in.");
            console.log("No token found during password change");
            navigate("/login");
            return;
        }

        if (passwords.newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            console.log("Password validation failed: less than 8 characters");
            return;
        }

        try {
            const response = await fetch("http://localhost:4000/api/users/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: passwords.oldPassword,
                    newPassword: passwords.newPassword,
                }),
            });

            if (response.ok) {
                toast.success("Password changed successfully.");
                console.log("Password changed successfully");
                setPasswords({ oldPassword: "", newPassword: "" });
                setIsUpdated(prev => !prev);
            } else {
                const errorData = await response.json();
                toast.error(`Error: ${errorData.message || "Failed to change password."}`);
                console.log("Failed to change password:", errorData);
            }
        } catch (error) {
            toast.error("Error changing password.");
            console.log("Error changing password:", error);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("user_token");

        if (!token) {
            toast.error("No token found. Please log in.");
            console.log("No token found during profile update");
            navigate("/login");
            return;
        }

        const formData = new FormData();
        formData.append("fullName", userData.fullName);
        formData.append("address", userData.address);
        formData.append("contactNumber", userData.contactNumber);

        // Append profilePic only if it's a file
        if (userData.profilePic instanceof File) {
            console.log("Profile picture being sent:", userData.profilePic);  // Debugging line
            formData.append("profilePic", userData.profilePic); // Add profile picture to formData if it's a file
        }

        try {
            const response = await fetch("http://localhost:4000/api/users/update-profile", {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                toast.success("Profile updated successfully.");
                console.log("Profile updated successfully");

                // Fetch updated data after the profile update
                const updatedDataResponse = await fetch("http://localhost:4000/api/users/landlord-dashboard", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const updatedData = await updatedDataResponse.json();

                if (updatedDataResponse.ok) {
                    // Update user data state with the latest info
                    setUserData({
                        username: updatedData.username,
                        fullName: updatedData.fullName || "",
                        address: updatedData.address || "",
                        contactNumber: updatedData.contactNumber || "",
                        profilePic: updatedData.profilePic ? `http://localhost:4000/uploads/${updatedData.profilePic}` : images.avatar, // Update profilePic URL after successful upload
                    });
                    setIsUpdated(prev => !prev); // Toggle the update flag
                } else {
                    toast.error("Failed to fetch updated data.");
                    console.log("Failed to fetch updated data:", updatedData);
                }
            } else {
                toast.error("Failed to update profile.");
                console.log("Failed to update profile");
            }
        } catch (error) {
            toast.error("Error updating profile.");
            console.log("Error updating profile:", error);
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setUserData({
                ...userData,
                profilePic: e.target.files[0] // Store the file object
            });
        }
    };

    const handleImageClick = () => {
        document.getElementById("file-input").click();
    };

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <h2>Landlord Dashboard</h2>
                <ul>
                    <li className="active">Profile</li>
                    <li onClick={() => navigate("/add-properties")}>Add Properties</li>
                    <li onClick={() => navigate("/my-properties")}>My Properties</li>
                    <li onClick={() => navigate("/messages")}>Messages</li>
                    <li onClick={handleLogout} className="logout">Logout</li>
                </ul>
            </div>

            <div className="main-content">
                {role === "landlord" ? (
                    <>
                        <div className="profile-section">
                            <h2>User Profile</h2>
                            <br />
                            <form onSubmit={handleProfileUpdate}>
                                <div onClick={handleImageClick} style={{ cursor: "pointer" }}>
                                    <img
                                        src={userData.profilePic instanceof File ? URL.createObjectURL(userData.profilePic) : userData.profilePic}
                                        alt="Profile"
                                        className="profile-pic"
                                    />
                                </div>
                                <p className="username">{userData.username}</p> {/* Added username below the profile pic */}
                                <input
                                    id="file-input"
                                    type="file"
                                    accept="image/*"
                                    className="profile-input profile-file"
                                    style={{ display: "none" }}
                                    onChange={handleImageChange}
                                />
                                <label htmlFor="fullName">Full Name</label>
                                <input
                                    id="fullName"
                                    type="text"
                                    placeholder="Full Name"
                                    className="profile-input profile-fullname"
                                    value={userData.fullName}
                                    onChange={(e) =>
                                        setUserData({
                                            ...userData,
                                            fullName: e.target.value
                                        })
                                    }
                                    required
                                    autoComplete="name"
                                />
                                <label htmlFor="address">Address</label>
                                <input
                                    id="address"
                                    type="text"
                                    placeholder="Address"
                                    className="profile-input profile-address"
                                    value={userData.address}
                                    onChange={(e) =>
                                        setUserData({
                                            ...userData,
                                            address: e.target.value
                                        })
                                    }
                                    required
                                    autoComplete="street-address"
                                />
                                <label htmlFor="contactNumber">Contact Number</label>
                                <input
                                    id="contactNumber"
                                    type="text"
                                    placeholder="Contact Number"
                                    className="profile-input profile-contact"
                                    value={userData.contactNumber}
                                    onChange={(e) =>
                                        setUserData({
                                            ...userData,
                                            contactNumber: e.target.value
                                        })
                                    }
                                    required
                                    autoComplete="tel"
                                />
                                <button type="submit" className="profile-button">Update Profile</button>
                            </form>
                        </div>

                        <div className="change-password-section">
                            <h2>Change Password</h2>
                            <form onSubmit={handlePasswordChange}>
                                <label htmlFor="oldPassword">Old Password</label>
                                <input
                                    id="oldPassword"
                                    type="password"
                                    placeholder="Old Password"
                                    value={passwords.oldPassword}
                                    onChange={(e) =>
                                        setPasswords({
                                            ...passwords,
                                            oldPassword: e.target.value
                                        })
                                    }
                                    required
                                />
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    placeholder="New Password"
                                    value={passwords.newPassword}
                                    onChange={(e) =>
                                        setPasswords({
                                            ...passwords,
                                            newPassword: e.target.value
                                        })
                                    }
                                    required
                                />
                                <button type="submit" className="password-button">Change Password</button>
                            </form>
                        </div>
                    </>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
};

export default LandlordDashboard;