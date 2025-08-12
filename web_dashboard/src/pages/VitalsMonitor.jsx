import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "recharts";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const [sensorData, setSensorData] = useState([]);
  const [viewMode, setViewMode] = useState("graph");

  useEffect(() => {
    const fetchData = () => {
      axios.get("http://localhost:5000/api/data")
        .then((response) => {
          setSensorData((prevData) => {
            const newData = [...prevData, ...response.data];
            return newData.slice(-20);
          });
        })
        .catch((error) => console.error("Error fetching data:", error));
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const timestamps = sensorData.map((data) => formatTimestamp(data.Timestamp));
  const heart_beat = sensorData.map((data) => data.HeartRate);
  const spo2 = sensorData.map((data) => data.SpO2);

  const getStats = (dataArray) => {
    if (dataArray.length === 0) return { min: 0, max: 0, avg: 0 };
    const sum = dataArray.reduce((acc, val) => acc + val, 0);
    const avg = (sum / dataArray.length).toFixed(2);
    const min = Math.min(...dataArray);
    const max = Math.max(...dataArray);
    return { min, max, avg };
  };

  const heartStats = getStats(heart_beat);
  const spo2Stats = getStats(spo2);

  const baseChartOptions = {
    responsive: true,
    animation: false,
    maintainAspectRatio: false, // <-- important to make height responsive
    plugins: {
      legend: {
        display: false
      }
    },
    layout: {
      padding: 0 // remove any default padding
    },
    elements: {
      line: {
        tension: 0 // sharp spikes, like ECG
      }
    },
    scales: {
      x: {
        ticks: { color: "#fff" },
        grid: { display: false },
        offset: false, // <-- important for edge-to-edge rendering
      },
      y: {
        ticks: { color: "#fff" },
        grid: { display: false },
        suggestedMin: 40,
        suggestedMax: 120
      }
    }
  };
  

  const heartRateChart = {
    labels: timestamps,
    datasets: [
      {
        label: "Heart Rate ❤️",
        data: heart_beat,
        fill: true,
        borderColor: "#f87171",
        backgroundColor: "rgba(248,113,113,0.1)",
        tension: 0.1,
        pointRadius: 0,
        borderWidth: 2,
      }
    ]
  };

  const spo2Chart = {
    labels: timestamps,
    datasets: [
      {
        label: "SpO₂ 🧬",
        data: spo2,
        fill: true,
        borderColor: "#34d399",
        backgroundColor: "rgba(52,211,153,0.1)",
        tension: 0.1,
        pointRadius: 0,
        borderWidth: 2,
      }
    ]
  };

  return (
    <div className="p-4 min-h-screen text-black bg-white">
      <h2 className="text-3xl font-bold mb-6 text-center">📈 Vital Monitor <span className="text-sm bg-red-600 text-white px-2 py-1 rounded animate-pulse ml-2">LIVE</span></h2>

      <div className="flex justify-center gap-6 mb-6">
        <div className="bg-red-100 p-4 rounded-md shadow text-center w-52">
          <h4 className="font-semibold text-red-900">Heart Rate ❤️</h4>
          <p>Min: {heartStats.min} bpm</p>
          <p>Max: {heartStats.max} bpm</p>
          <p>Avg: {heartStats.avg} bpm</p>
        </div>
        <div className="bg-green-100 p-4 rounded-md shadow text-center w-52">
          <h4 className="font-semibold text-green-900">SpO₂ 🧬</h4>
          <p>Min: {spo2Stats.min}%</p>
          <p>Max: {spo2Stats.max}%</p>
          <p>Avg: {spo2Stats.avg}%</p>
        </div>
      </div>

      <div className="flex gap-4 justify-center mb-6">
        <button onClick={() => setViewMode("graph")} className={`px-4 py-2 rounded ${viewMode === "graph" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
          Graph View
        </button>
        <button onClick={() => setViewMode("table")} className={`px-4 py-2 rounded ${viewMode === "table" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
          Table View
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "graph" ? (
          <motion.div
            key="graph"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="space-y-12"
          >
            <div className="bg-black rounded-lg p-8 h-80 w-full max-w-4xl mx-auto">
              <label className="text-white text-lg mb-4">Heart Rate (bpm)</label>
              <Line data={heartRateChart} options={baseChartOptions} />
            </div>
            <div className="bg-black rounded-lg p-8 h-80 w-full max-w-4xl mx-auto">
              <label className="text-white text-lg mb-4">SpO₂ (%)</label>
              <Line data={spo2Chart} options={baseChartOptions} />
            </div>
          </motion.div>
        ) : (
          <motion.table
            key="table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="table-auto border w-full max-w-4xl mx-auto"
          >
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Timestamp</th>
                <th className="border px-4 py-2">Heart Rate (bpm)</th>
                <th className="border px-4 py-2">SpO₂ (%)</th>
              </tr>
            </thead>
            <tbody>
              {sensorData.map((entry, idx) => (
                <tr key={idx} className="text-center">
                  <td className="border px-4 py-2">{formatTimestamp(entry.Timestamp)}</td>
                  <td className="border px-4 py-2">{entry.HeartRate}</td>
                  <td className="border px-4 py-2">{entry.SpO2}</td>
                </tr>
              ))}
            </tbody>
          </motion.table>
        )}
      </AnimatePresence>
    </div>
  );
}
