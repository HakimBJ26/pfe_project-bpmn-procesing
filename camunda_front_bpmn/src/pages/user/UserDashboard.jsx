import React from 'react';

const UserDashboard = () => {
  return (
    <div className="dashboard">
      <h1>User Dashboard</h1>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>My Tasks</h3>
          <p>0</p>
        </div>
        <div className="stat-card">
          <h3>Completed Tasks</h3>
          <p>0</p>
        </div>
        <div className="stat-card">
          <h3>Active Processes</h3>
          <p>0</p>
        </div>
      </div>
      <div className="task-list">
        <h2>Recent Tasks</h2>
        <div className="no-tasks">
          <p>No tasks available</p>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
