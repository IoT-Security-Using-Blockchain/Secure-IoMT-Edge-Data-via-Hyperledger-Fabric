import React, { useState } from "react";

const ControlPanel = () => {
  const [logs, setLogs] = useState([]);
  const [networkStatus, setNetworkStatus] = useState("Stopped"); // Track network state

  // Simulated function to send SSH command (Replace this with actual API request)
  const executeCommand = async (command) => {
    setLogs((prevLogs) => [...prevLogs, `Executing: ${command}...`]);

    try {
      const response = await fetch("http://localhost:5000/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });

      const data = await response.json();
      setLogs((prevLogs) => [...prevLogs, data.message]);

      // Update network status
      if (command === "./invoke_chaincode.sh") setNetworkStatus("Running");
      if (command === "./stop-network") setNetworkStatus("Stopped");
      if (command === "./network.sh down") setNetworkStatus("Shutting Down");

    } catch (error) {
      setLogs((prevLogs) => [...prevLogs, "Error executing command"]);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Control Panel</h2>

      {/* Status Indicator */}
      <div className="mb-4 text-lg font-semibold">
        Network Status:{" "}
        <span className={networkStatus === "Running" ? "text-green-500" : "text-red-500"}>
          {networkStatus}
        </span>
      </div>

      {/* Buttons */}
      <div className="space-x-4 mb-4">
        <button
          onClick={() => executeCommand("./invoke_chaincode.sh")}
          className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
        >
          Start Network
        </button>
        <button
          onClick={() => executeCommand("stop-network")}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-700"
        >
          Stop Network
        </button>
        <button
          onClick={() => executeCommand("./network.sh down")}
          className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700"
        >
          Shutdown Network
        </button>
      </div>

      {/* Logs Screen */}
      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg h-40 overflow-y-auto">
        <h3 className="text-lg font-semibold">Logs</h3>
        <ul>
          {logs.map((log, index) => (
            <li key={index} className="text-sm mt-1">
              {log}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ControlPanel;
