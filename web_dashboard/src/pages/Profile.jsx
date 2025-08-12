import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Profile() {
  const [editMode, setEditMode] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({});
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    // Get the token from localStorage (or sessionStorage)
    const token = localStorage.getItem("token");

    if (token) {
      console.log("Fetching data with token:", token);

      // Fetch user details from the server using the token
      axios
        .get("http://localhost:5000/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`, // Sending token in the Authorization header
          },
        })
        .then((response) => {
          console.log("User data fetched:", response.data);
          setUpdatedUser(response.data); // Set the user data
          setLoading(false); // Stop loading once data is fetched
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setError("Failed to load user data.");
          setLoading(false); // Stop loading even on error
        });
    } else {
      setError("No valid token found.");
      setLoading(false);
    }
  }, []);

  const handleEdit = () => {
    setEditMode(!editMode);
  };

  const handleSave = () => {
    // Save updated data to the backend
    const token = localStorage.getItem("authToken");

    if (token) {
      axios
        .put(
          `http://localhost:5000/api/user/${updatedUser.userId}`,
          updatedUser,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Sending token in the Authorization header
            },
          }
        )
        .then(() => {
          setEditMode(false);
          alert("Profile updated successfully!");
        })
        .catch((error) => {
          console.error("Error updating user data:", error);
        });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser({ ...updatedUser, [name]: value });
  };

  // Show loading state while fetching data
  if (loading) {
    return <div>Loading...</div>;
  }

  // Show error message if there was an error
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-center">Profile</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">Username</label>
          {editMode ? (
            <input
              type="text"
              name="username"
              value={updatedUser.username || ""}
              onChange={handleChange}
              className="mt-2 p-2 border rounded w-full"
            />
          ) : (
            <p className="mt-2">{updatedUser.username}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Email</label>
          {editMode ? (
            <input
              type="email"
              name="email"
              value={updatedUser.email || ""}
              onChange={handleChange}
              className="mt-2 p-2 border rounded w-full"
            />
          ) : (
            <p className="mt-2">{updatedUser.email}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">First Name</label>
          {editMode ? (
            <input
              type="text"
              name="firstName"
              value={updatedUser.firstName || ""}
              onChange={handleChange}
              className="mt-2 p-2 border rounded w-full"
            />
          ) : (
            <p className="mt-2">{updatedUser.firstName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Last Name</label>
          {editMode ? (
            <input
              type="text"
              name="lastName"
              value={updatedUser.lastName || ""}
              onChange={handleChange}
              className="mt-2 p-2 border rounded w-full"
            />
          ) : (
            <p className="mt-2">{updatedUser.lastName}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={handleEdit}
          className="bg-blue-500 text-white p-2 rounded"
        >
          {editMode ? "Cancel" : "Edit"}
        </button>
        {editMode && (
          <button
            onClick={handleSave}
            className="bg-green-500 text-white p-2 rounded"
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
}
