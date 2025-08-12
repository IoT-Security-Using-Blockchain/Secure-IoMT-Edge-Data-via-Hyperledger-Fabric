import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // We will use Axios to make HTTP requests to the server
import bcrypt from "bcryptjs"; // Add bcrypt for password hashing

export default function Register() {
  const [firstName, setFirstName] = useState(""); // First Name
  const [lastName, setLastName] = useState(""); // Last Name
  const [username, setUsername] = useState(""); // Username
  const [password, setPassword] = useState(""); // Password
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirm Password
  const [email, setEmail] = useState(""); // Email
  const [passwordError, setPasswordError] = useState(""); // Password mismatch error
  const [emailError, setEmailError] = useState(""); // Email validation error
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
  
    // Validate inputs
    if (!username || !password || !confirmPassword || !email || !firstName || !lastName) {
      alert("All fields are required!");
      return;
    }
  
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    } else {
      setPasswordError(""); // Reset the password error once they match
    }
  
    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    } else {
      setEmailError(""); // Reset the email error if it's valid
    }
  
    try {
      // Send user data to the backend to register
      const response = await axios.post("http://localhost:5000/api/register", {
        first_name: firstName, // Field name matches the database
        last_name: lastName, // Field name matches the database
        username,
        password, // Send the plain password (not hashed)
        email,
      });
  
      if (response.status === 201) { // Check if registration is successful
        alert("Registration successful! Please log in.");
        // Reset form fields after successful registration
        setFirstName("");
        setLastName("");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setEmail("");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("There was an issue during registration. Please try again.");
    }
  };
  
  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      <div className="p-8 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl mb-4">Register</h2>
        <form onSubmit={handleRegister}>
          {/* First Name and Last Name fields with smaller width */}
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="First Name"
              className="w-1/2 p-2 mb-3 bg-gray-700 rounded"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last Name"
              className="w-1/2 p-2 mb-3 bg-gray-700 rounded"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 mb-3 bg-gray-700 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-3 bg-gray-700 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-2 mb-3 bg-gray-700 rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {passwordError && <div className="text-red-500 text-sm">{passwordError}</div>}

          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-3 bg-gray-700 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && <div className="text-red-500 text-sm">{emailError}</div>}

          {/* Register button */}
          <button
            className="w-full p-2 rounded mt-3 bg-green-500 hover:bg-green-600"
            type="submit"
          >
            Register
          </button>
        </form>
        <p className="mt-3 text-sm">
          Already have an account? <a href="/login" className="text-blue-400">Login</a>
        </p>
      </div>
    </div>
  );
}
