import "./HealthScore.css";
import {
    PieChart,
    Pie,
    Cell,
    Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
function HealthScore({ habits, setShowHealth }) {
  const totalHabits = habits.length;

  const completedToday = habits.filter(h => h.completed).length;

  const healthScore =
    totalHabits === 0
      ? 0
      : Math.round((completedToday / totalHabits) * 100);

  const totalCompleted = habits.reduce(
    (sum, h) => sum + (h.history?.length || 0),
    0
  );

  const bestStreak = Math.max(
    ...habits.map(h => h.longestStreak || 0),
    0
  );

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const chartData = days.map((day) => ({
  day,
  score: 0,
}));

habits.forEach((habit) => {
  habit.history?.forEach((date) => {
    const d = new Date(date);
    const dayName = days[d.getDay()];

    const index = chartData.findIndex(
      (item) => item.day === dayName
    );

    if (index !== -1) {
      chartData[index].score += 1;
    }
  });
});

//const totalHabits = habits.length;

//const completedToday = habits.filter(h => h.completed).length;




const completionRate =
  totalHabits === 0
    ? 0
    : Math.round((completedToday / totalHabits) * 100);

// Find Best Category
const categoryCount = {};

habits.forEach((habit) => {
  categoryCount[habit.category] =
    (categoryCount[habit.category] || 0) +
    (habit.history?.length || 0);
});

const bestCategory =
  Object.keys(categoryCount).length > 0
    ? Object.keys(categoryCount).reduce((a, b) =>
        categoryCount[a] > categoryCount[b] ? a : b
      )
    : "None";


    const pieData = [
  {
    name: "Health",
    value: habits
      .filter(h => h.category === "Health")
      .reduce((sum, h) => sum + (h.history?.length || 0), 0),
  },
  {
    name: "Study",
    value: habits
      .filter(h => h.category === "Study")
      .reduce((sum, h) => sum + (h.history?.length || 0), 0),
  },
  {
    name: "Fitness",
    value: habits
      .filter(h => h.category === "Fitness")
      .reduce((sum, h) => sum + (h.history?.length || 0), 0),
  },
  {
    name: "Work",
    value: habits
      .filter(h => h.category === "Work")
      .reduce((sum, h) => sum + (h.history?.length || 0), 0),
  },
  {
    name: "General",
    value: habits
      .filter(h => h.category === "General")
      .reduce((sum, h) => sum + (h.history?.length || 0), 0),
  },
];

const COLORS = [
  "#ff6384",
  "#36a2eb",
  "#4bc0c0",
  "#ffcd56",
  "#9966ff"
];

const heatmapData = [];

habits.forEach((habit) => {
  habit.history?.forEach((date) => {
    heatmapData.push({
      date: new Date(date).toISOString().split("T")[0],
      count: 1,
    });
  });
});



  return (
    <div className="health-page">

      <button
        className="back-btn"
        onClick={() => setShowHealth(false)}
      >
        ← Back
      </button>

      <h1>Health Dashboard</h1>

      <div className="health-cards">

  <div className="health-card">
    <h2>{healthScore}%</h2>
    <p>❤️ Health Score</p>
  </div>

  <div className="health-card">
    <h2>{completionRate}%</h2>
    <p>📈 Completion Rate</p>
  </div>

  <div className="health-card">
    <h2>{bestStreak}</h2>
    <p>🔥 Longest Streak</p>
  </div>

  <div className="health-card">
    <h2>{totalCompleted}</h2>
    <p>✅ Total Completions</p>
  </div>

  <div className="health-card">
    <h2>{totalHabits}</h2>
    <p>📋 Total Habits</p>
  </div>

  <div className="health-card">
    <h2>{bestCategory}</h2>
    <p>🏆 Best Category</p>
  </div>

</div>

      <h2 style={{ marginTop: "40px" }}>
  Weekly Health Score
</h2>

<div
  style={{
    width: "100%",
    height: 350,
    background: "#fff",
    borderRadius: "15px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,.1)"
  }}
>
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="day" />
      <YAxis />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="score"
        stroke="#ff4081"
        strokeWidth={3}
      />
    </LineChart>
  </ResponsiveContainer>
</div>

<h2 style={{ marginTop: "40px" }}>
  Category Distribution
</h2>

<div
  style={{
    width: "100%",
    height: 420,
    background: "white",
    borderRadius: "15px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,.1)"
  }}
>
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={pieData}
        dataKey="value"
        nameKey="name"
        outerRadius={130}
        label
      >
        {pieData.map((entry, index) => (
          <Cell
            key={index}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </Pie>

      <Tooltip />

      <Legend />
    </PieChart>
  </ResponsiveContainer>
</div>

<h2 style={{ marginTop: "40px" }}>
  Contribution Calendar
</h2>

<div
  style={{
    background: "white",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 2px 10px rgba(0,0,0,.1)"
  }}
>
  <CalendarHeatmap
    startDate={new Date(new Date().setMonth(new Date().getMonth() - 6))}
    endDate={new Date()}
    values={heatmapData}
    classForValue={(value) => {
      if (!value) {
        return "color-empty";
      }
      return "color-filled";
    }}
  />
</div>

    </div>
  );
}

export default HealthScore;