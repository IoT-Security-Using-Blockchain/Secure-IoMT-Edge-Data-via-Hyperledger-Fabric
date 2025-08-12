// Copyright 2025 Amartya Roy, Hrishikesh Kumar Chaudhary, Madhu Singh, Anshika
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { exec } = require("child_process");
const { Sequelize } = require("sequelize");
const sequelize = require("./config/database");
const User = require("./models/user")(sequelize, require("sequelize").DataTypes);
const Login = require("./models/login")(sequelize);  // Pass sequelize into the model function
require("dotenv").config();

Login.sync();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// CouchDB Credentials
const DB_USERNAME = "admin";
const DB_PASSWORD = "admin";
const DB_URL = "http://<your_blockchain_server_ip>:5984/mychannel_asset-transfer/_all_docs?include_docs=true";

const JWT_SECRET = process.env.JWT_SECRET || "authToken";

// Register
app.post("/api/register", async (req, res) => {
  const { first_name, last_name, username, password, email } = req.body;

  if (!username || !password || !email || !first_name || !last_name) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) return res.status(400).json({ error: "Username already exists" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    await User.create({ first_name, last_name, username, passwordHash, email });
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (isMatch) {
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
      await Login.create({ user_id: user.id, login_time: new Date() });
      return res.status(200).json({ message: "Login successful", token });
    } else {
      return res.status(400).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

// JWT Middleware
function authenticateToken(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(403).json({ error: "Access denied" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// Profile
app.get("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      userId: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// Fetch All Data from CouchDB
app.get("/api/data", async (req, res) => {
  try {
    const response = await axios.get(DB_URL, {
      auth: {
        username: DB_USERNAME,
        password: DB_PASSWORD,
      },
    });
    const allData = response.data.rows.map((item) => item.doc);
    res.json(allData);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Alerts (Temperature > 28°C)
app.get("/api/alerts", async (req, res) => {
  try {
    const response = await axios.get(DB_URL, {
      auth: {
        username: DB_USERNAME,
        password: DB_PASSWORD,
      },
    });
    const alerts = response.data.rows.map((item) => item.doc).filter((doc) => doc.Temperature > 28);
    res.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error.message);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

// Vitals Alerts (HeartRate > 100 or SpO2 < 94)
app.get("/api/vitals/alerts", async (req, res) => {
  try {
    const response = await axios.get(DB_URL, {
      auth: {
        username: DB_USERNAME,
        password: DB_PASSWORD,
      },
    });
    const alerts = response.data.rows.map((item) => item.doc).filter((doc) => doc.HeartRate > 100 || doc.SpO2 < 94);
    res.json(alerts);
  } catch (error) {
    console.error("Error fetching vitals alerts:", error.message);
    res.status(500).json({ error: "Failed to fetch vitals alerts" });
  }
});

// Sync Sequelize
sequelize.sync().then(() => {
  console.log("Database connected and models synced!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
