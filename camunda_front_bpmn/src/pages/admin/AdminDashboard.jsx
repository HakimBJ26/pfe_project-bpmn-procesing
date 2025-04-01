import axios from "axios";
import { useEffect, useState } from "react";

// Mise à jour de AdminDashboard.jsx
const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({ totalProcesses: 0, activeInstances: 0 });

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get('http://localhost:8997/v1/process/metrics', getAuthHeader());
        setMetrics({
          totalProcesses: res.data.totalProcessDefinitions,
          activeInstances: res.data.runningInstances
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Processes</h3>
          <p>{metrics.totalProcesses}</p>
        </div>
        <div className="stat-card">
          <h3>Active Instances</h3>
          <p>{metrics.activeInstances}</p>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;