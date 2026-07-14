import "./Analytics.css";

function Analytics() {
  return (
    <div className="analytics-page">

      <h1>📊 Habit Analytics</h1>

      <div className="analytics-card">
        <h2>Health Score</h2>
        <h3>0%</h3>
      </div>

      <div className="analytics-card">
        <h2>Current Streak</h2>
        <h3>0 Days</h3>
      </div>

      <div className="analytics-card">
        <h2>Longest Streak</h2>
        <h3>0 Days</h3>
      </div>

      <div className="analytics-card">
        <h2>Total Completions</h2>
        <h3>0</h3>
      </div>

    </div>
  );
}

export default Analytics;