import { useEffect, useState } from "react";
import axios from "axios";

export default function Alerts() {
  const [vitals, setVitals] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/data")
      .then((response) => {
        setVitals(response.data);
      })
      .catch((error) => console.error("Error fetching vitals:", error));
  }, []);

  const groupByDate = (data) => {
    return data.reduce((acc, curr) => {
      const date = new Date(curr.Timestamp).toISOString().split("T")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(curr);
      return acc;
    }, {});
  };

  const calculateStats = (entries) => {
    const heartRates = entries.map(e => e.HeartRate);
    const spo2Values = entries.map(e => e.SpO2);

    const getStats = (arr) => {
      const avg = (arr.reduce((sum, v) => sum + v, 0) / arr.length).toFixed(1);
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      return { avg, min, max };
    };

    return {
      heart: getStats(heartRates),
      spo2: getStats(spo2Values),
    };
  };

  const grouped = groupByDate(vitals);

  const alerts = vitals.filter(v => v.HeartRate > 100 || v.SpO2 < 94);

  // CSV download
  const downloadCSV = () => {
    const csvHeaders = "Timestamp,HeartRate,SpO2\n";
    const csvRows = vitals.map(v =>
      `${new Date(v.Timestamp).toLocaleString()},${v.HeartRate},${v.SpO2}`
    );
    const csvContent = csvHeaders + csvRows.join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "vitals_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 space-y-10">
      <h2 className="text-2xl font-bold mb-4 text-red-600">Vitals Alerts & History</h2>

      {/* Daily Stats with Download */}
      <div className="overflow-x-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold">📊 Daily Vitals Summary</h3>
          <button
            onClick={downloadCSV}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-4 rounded"
          >
            ⬇️ Download CSV
          </button>
        </div>
        <table className="min-w-full border border-gray-300 bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Avg HeartRate</th>
              <th className="border px-4 py-2">Min</th>
              <th className="border px-4 py-2">Max</th>
              <th className="border px-4 py-2">Avg SpO₂</th>
              <th className="border px-4 py-2">Min</th>
              <th className="border px-4 py-2">Max</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([date, entries], index) => {
              const stats = calculateStats(entries);
              return (
                <tr key={index} className="hover:bg-gray-100 text-center">
                  <td className="border px-4 py-2">{date}</td>
                  <td className="border px-4 py-2">{stats.heart.avg}</td>
                  <td className="border px-4 py-2">{stats.heart.min}</td>
                  <td className="border px-4 py-2">{stats.heart.max}</td>
                  <td className="border px-4 py-2">{stats.spo2.avg}</td>
                  <td className="border px-4 py-2">{stats.spo2.min}</td>
                  <td className="border px-4 py-2">{stats.spo2.max}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Alerts Table */}
      <div className="overflow-x-auto">
      <h3 className="text-xl font-semibold mb-2 text-red-500">
        ⚠️ Vitals Alerts (SpO₂ &lt; 94 or HR &gt; 100)</h3>
  {alerts.length === 0 ? (
    <p className="text-gray-600">No alerts triggered.</p>
  ) : (
          <table className="min-w-full border border-gray-300 bg-white">
            <thead className="bg-red-500 text-white">
              <tr>
                <th className="border px-4 py-2">Timestamp</th>
                <th className="border px-4 py-2">Heart Rate</th>
                <th className="border px-4 py-2">SpO₂</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((item, index) => (
                <tr key={index} className="hover:bg-red-100 text-center">
                  <td className="border px-4 py-2">{new Date(item.Timestamp).toLocaleString()}</td>
                  <td className={`border px-4 py-2 ${item.HeartRate > 100 ? "text-red-600 font-bold" : ""}`}>{item.HeartRate}</td>
                  <td className={`border px-4 py-2 ${item.SpO2 < 94 ? "text-red-600 font-bold" : ""}`}>{item.SpO2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
