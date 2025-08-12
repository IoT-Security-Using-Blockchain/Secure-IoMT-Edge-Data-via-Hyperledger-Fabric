import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Bell, LogOut, User, Settings } from "lucide-react";

const menuItems = [
  { name: "Vitals Monitor", icon: <Home size={24} />, path: "/" },
  { name: "Vitals History", icon: <Bell size={24} />, path: "/history" },
  { name: "Profile", icon: <User size={24} />, path: "/profile" },
  //{ name: "Control Panel", icon: <Settings size={24} />, path: "/control-panel" }, // Added Control Panel
];

export default function Navbar({ handleLogout, user }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="h-screen bg-gray-900 text-white fixed top-0 left-0 flex flex-col items-center py-4"
      initial={{ width: "4rem" }}
      animate={{ width: isExpanded ? "14rem" : "4rem" }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col space-y-6 w-full mt-6">
        {/* Menu Items */}
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="flex items-center space-x-4 px-4 py-2 hover:bg-gray-700 w-full"
          >
            {item.icon}
            {isExpanded && <span className="text-lg">{item.name}</span>}
          </Link>
        ))}

        {/* Profile Details */}
        {user && isExpanded && (
          <div className="px-4 py-2 mt-2 bg-gray-800 w-full">
            <div className="text-sm text-gray-400">User ID: {user.userId}</div>
            <div className="text-sm text-gray-400">First Name: {user.firstName}</div>
            <div className="text-sm text-gray-400">Last Name: {user.lastName}</div>
            <div className="text-sm text-gray-400">Email: {user.email}</div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-4 px-4 py-2 hover:bg-red-600 w-full mt-6"
        >
          <LogOut size={24} />
          {isExpanded && <span className="text-lg">Logout</span>}
        </button>
      </div>
    </motion.div>
  );
}
