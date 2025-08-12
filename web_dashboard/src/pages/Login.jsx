import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // For making requests

export default function Login({ setAuth }) {
  const [username, setUsername] = useState(""); // Username
  const [password, setPassword] = useState(""); // Password
  const [errorMessage, setErrorMessage] = useState(""); // Error message for invalid credentials
  const navigate = useNavigate();
  

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log(username, password);
    

    // Validate inputs
    if (!username || !password) {
      alert("Username and password are required!");
      return;
    }

    try {
      // Send login request to the backend with the plain password
      const response = await axios.post("http://localhost:5000/api/login", {
        username,
        password, // Send the plain password (not hashed)
      });
      const { token } = response.data;

      if (response.status === 200) {
        //const userData = response.data.user;
        const userData = response.data; // Assuming this only contains `userId` and not sensitive data
        localStorage.setItem("userId", userData.userId); // Only store `userId` in localStorage
        // Store token in localStorage
        localStorage.setItem("token", token);
        // If login is successful, store auth status in localStorage and update state
        localStorage.setItem("auth", "true");
        //localStorage.setItem("user", JSON.stringify(userData)); // Store user data in localStorage
        setAuth(true);
        navigate("/"); // Redirect to the home page or another page
      }
    } catch (error) {
      // Handle error if login fails
      setErrorMessage("Invalid credentials! Please try again.");
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      <div className="p-8 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl mb-4">Login</h2>
        <form onSubmit={handleLogin}>
          {/* Username and Password inputs */}
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

          {/* Error message */}
          {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}

          {/* Login button */}
          <button
            className={`w-full p-2 rounded mt-3 ${username && password ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-500 cursor-not-allowed"}`}
            disabled={!username || !password}
            type="submit"
          >
            Login
          </button>
        </form>
        <p className="mt-3 text-sm">
          Don't have an account? <a href="/register" className="text-blue-400">Register</a>
        </p>
      </div>
    </div>
  );
}
