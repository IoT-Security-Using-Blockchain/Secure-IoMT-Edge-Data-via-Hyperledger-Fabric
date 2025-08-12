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

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VitalsMonitor from './pages/VitalsMonitor'; // renamed Dashboard
import VitalsHistory from './pages/VitalsHistory'; // renamed History
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = localStorage.getItem('auth');
    const userData = JSON.parse(localStorage.getItem('user'));
    setIsAuthenticated(!!auth);
    setUser(userData);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <div className="flex h-screen">
        {isAuthenticated && <Navbar handleLogout={handleLogout} user={user} />}

        <div className={`flex-1 p-4 ${isAuthenticated ? 'ml-16' : 'bg-gray-900 flex justify-center items-center'}`}>
          <Routes>
            {isAuthenticated ? (
              <>
                <Route path="/" element={<VitalsMonitor />} />
                <Route path="/history" element={<VitalsHistory />} />
                <Route path="/profile" element={<Profile user={user} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            ) : (
              <>
                <Route path="/login" element={<Login setAuth={setIsAuthenticated} setUser={setUser} />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
