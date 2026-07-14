import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Analytics from "./Pages/Analytics";
import HealthScore from "./Pages/HealthScore";
import "react-calendar/dist/Calendar.css";
import "./App.css";

import Calendar from "react-calendar";
//import "react-calendar/dist/Calendar.css";
import { useEffect, useState } from "react";
//import { CALENDAR_TYPES } from "react-calendar/dist/shared/const.js";

function App() {
  const [habits, setHabits] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("")
  const [filter, setFilter] = useState("all");
  const [category , setCategory]=useState("General");
  const [categoryFilter , setCategoryFilter] = useState("All");
  const [search ,setSearch] = useState("");
  const [date , setDate] = useState(new Date());
  const [showCalendar , setShowCalendar] = useState(false);
  const [ showDetails , setShowDetails] = useState(null);
  const [showHistory, setShowHistory] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [showLogin, setShowLogin] = useState(true);
  const [showHealth, setShowHealth] = useState(false);
  const [completedDates , setCompletedDates]= useState([]);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [quote, setQuote] = useState("");
  const [quoteColor, setQuoteColor] = useState("#4CAF50");
  const [weeklyGoal, setWeeklyGoal] = useState(20);
  
const quotes = {
  Study: [
    "📚 Every page you study brings you closer to success.",
    "🎓 Learning today creates opportunities tomorrow.",
    "🧠 Keep studying. Your future self will thank you."
  ],

  Health: [
    "❤️ Good health is your greatest wealth.",
    "🥗 Every healthy choice matters.",
    "🌿 Taking care of yourself is always worth it."
  ],

  Fitness: [
    "💪 Stronger every single day!",
    "🏋️ Every workout counts.",
    "🔥 Your body loves your consistency."
  ],

  Work: [
    "💼 Small progress leads to big achievements.",
    "🚀 Stay focused. Great things take time.",
    "⭐ Your dedication will pay off."
  ],

  General: [
    "🌟 Every small step counts.",
    "✨ Consistency beats perfection.",
    "🏆 Great habits build a great life."
  ]
};
  // Total completed habits
const totalCompleted = habits.reduce(
  (total, habit) => total + (habit.history?.length || 0),
  0
);

// Highest streak among all habits
const maxStreak = Math.max(
  ...habits.map(h => h.longestStreak || 0),
  0
);

// Check if every habit is completed today
const allCompletedToday =
  habits.length > 0 &&
  habits.every(h => h.completed);


  const weeklyCompleted = habits.reduce(
  (total, habit) => total + (habit.history?.length || 0),
  0
);

const weeklyProgress = Math.min(
  (weeklyCompleted / weeklyGoal) * 100,
  100
);
  
  // Fetch habits
  
  const fetchHabits = async() => {
    const res = await
  fetch("http://localhost:5000/habits" , {
  headers: {
    Authorization: token,
  },
});
    const data = await res.json();
    console.log("RESPONSE:" , data);
    if (res.ok && Array.isArray(data)) {
      setHabits(data);
      const allDates = [];

data.forEach((habit) => {
  habit.history.forEach((d) => {
    allDates.push(new Date(d).toISOString().split("T")[0]);
  });
});

setCompletedDates([...new Set(allDates)]);
    }else{
        setHabits([]);
    }
    
};
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() =>{
  if(token){
fetchHabits();}
  },[token]);
    

  

  // Add habit
  const addHabit = async () => {

  if (!title.trim()) return;
  const exists = habits.some((h) => h.title.toLowerCase() ===title.toLowerCase());
  if (exists) {
    alert ("Habit already exists");
    return;
  }

  await fetch("http://localhost:5000/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ title , category })
  });
 
  fetchHabits();
  setTitle("");
};

  
  const deleteHabit = async (id) => {
  await
   fetch (`http://localhost:5000/habits/${id}`, {method: "DELETE"});
    fetchHabits();
 
};


const editHabit = (habit) => {
  setEditingId(habit._id);
  setEditTitle(habit.title);
};
const saveEdit = async (id) => {
  console.log("Saving:", editTitle);
  await fetch(`http://localhost:5000/habits/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: editTitle,
    }),
  });

  setEditingId(null);
  setEditTitle("");

  fetchHabits();
};

const toggleHabit = async (id) => {
  try {
    //console.log("Sending PUT request:", id);

    const res = await fetch(`http://localhost:5000/habits/${id}/toggle`, {
      method: "PUT",
    });

    //console.log("Response status:", res.status);
    const updatedHabit = await res.json();

    // Show quote only when habit is completed
    if (updatedHabit.completed) {

    const habitCategory = updatedHabit.category || "General";

    switch (habitCategory) {
  case "Study":
    setQuoteColor("#3B82F6"); // Blue
    break;

  case "Health":
    setQuoteColor("#22C55E"); // Green
    break;

  case "Fitness":
    setQuoteColor("#F97316"); // Orange
    break;

  case "Work":
    setQuoteColor("#8B5CF6"); // Purple
    break;

  default:
    setQuoteColor("#4CAF50"); // Default Green
}

const categoryQuotes =
  quotes[habitCategory] || quotes.General;

const randomQuote =
  categoryQuotes[
    Math.floor(Math.random() * categoryQuotes.length)
  ];
  setQuote(randomQuote);
  setShowQuote(true);

  setTimeout(() => {
    setShowQuote(false);
  }, 3000);
}

    //console.log("Updated habit:", updatedHabit);

    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit._id === id ? updatedHabit : habit
      )
    );
  } catch (err) {
    console.log(err);
  }
};

 if (!token) {
  return showLogin ? (
    <Login
      setToken={setToken}
      setShowLogin={setShowLogin}
    />
  ) : (
    <Signup
      setShowLogin={setShowLogin}
    />
  );
}    

if (showHealth) {
  return (
    <HealthScore
      habits={habits}
      setShowHealth={setShowHealth}
    />
  );
}

  return (
    <div className="container">
      {showQuote && (
  <div
    className="quote-popup"
    style={{ backgroundColor: quoteColor }}
  >
    <h3>🎉 Habit Completed!</h3>
    <p>{quote}</p>
  </div>
)}
    
      <div className = "input-container">
      <input
        value={title}
    onChange={(e) => setTitle(e.target.value)}
    onKeyDown = {(e) =>{if (e.key === "Enter"){
      addHabit();
    }
  }}
    placeholder="Enter habit"/>
    <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
  >
    <option value="General">General</option>
    <option value="Health">Health</option>
    <option value="Study">Study</option>
    <option value="Fitness">Fitness</option>
    <option value="Work">Work</option>
  </select>

      <button className = "add-btn" 
                       onClick={addHabit}>Add</button>
      </div>
      

<div className="stats">
  <div className="stat-card">
    <h3>{habits.length}</h3>
    <p>Total Habits</p>
  </div>

  <div className="stat-card">
    <h3>
      {habits.filter(h => h.completed).length}
    </h3>
    <p>Completed</p>
  </div>
  <div className="stat-card">
    <h3>
      {habits.length
        ? Math.round(
            (habits.filter(h => h.completed).length /
              habits.length) *
              100
          )
        : 0}
      %
    </h3>
    <p>Progress</p>
  </div>
</div>
<div className="progress-container">
  <div
    className="progress-bar"
    style={{
      width: `${
        habits.length
          ? (habits.filter(h => h.completed).length / habits.length) * 100
          : 0
      }%`
    }}
  ></div>
</div>
<div className="dashboard-row">
<div className="weekly-goal-card">
  <h2>🎯 Weekly Goal</h2>

  <p>
    {weeklyCompleted} / {weeklyGoal} completed
  </p>

  <div className="weekly-progress-container">
    <div
      className="weekly-progress-bar"
      style={{ width: `${weeklyProgress}%` }}
    ></div>
  </div>
</div>
 <div className="badge-section">
  <h2>🏅 Achievements</h2>

  

<div className="badge-container">

  <div className={`badge ${totalCompleted >= 1 ? "unlocked" : "locked"}`}>
    🥉
    <p>First Step</p>
  </div>

  <div className={`badge ${maxStreak >= 7 ? "unlocked" : "locked"}`}>
    🥈
    <p>7-Day Warrior</p>
  </div>

  <div className={`badge ${maxStreak >= 30 ? "unlocked" : "locked"}`}>
    🥇
    <p>30-Day Champion</p>
  </div>

  <div className={`badge ${totalCompleted >= 100 ? "unlocked" : "locked"}`}>
    🔥
    <p>Century Club</p>
  </div>

  <div className={`badge ${allCompletedToday ? "unlocked" : "locked"}`}>
    👑
    <p>Habit Master</p>
  </div>

</div>
</div>
</div>
<div className="filters">
  <button onClick={() => setFilter("all")}>All</button>
  <button onClick={() => setFilter("completed")}>Completed</button>
  <button onClick={() => setFilter("pending")}>Pending</button>
  <button onClick={() => setShowCalendar(!showCalendar)}>
  📅 Calendar

</button>
<button
  onClick={() => setShowHealth(true)}
>
  ❤️ Health Dashboard
</button>
 

  <input
className="search-box"
  type="text"
  placeholder="🔍 Search habits..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>

<button
  className="logout-btn"
  onClick={() => setShowLogoutPopup(true)}
>
  Logout
</button>
</div>


{showCalendar && (
  <div className="calendar-section">
    <Calendar
      onChange={setDate}
      value={date}
     tileClassName={({ date, view }) => {
  if (view !== "month") return null;

  const calendarDate = date.toDateString();

  const isCompleted = habits.some((habit) =>
    habit.history?.some(
      (d) => new Date(d).toDateString() === calendarDate
    )
  );

  return isCompleted ? "completed-day" : null;
}}
      
    />
  </div>
)}
<div className="filters">
  <button onClick={() => setCategoryFilter("All")}>All Categories</button>
  <button onClick={() => setCategoryFilter("Health")}>Health</button>
  <button onClick={() => setCategoryFilter("Study")}>Study</button>
  <button onClick={() => setCategoryFilter("Fitness")}>Fitness</button>
  <button onClick={() => setCategoryFilter("Work")}>Work</button>
</div>




        <div className = "habit-list">
          <ul>
                {habits
                 .filter((h) => {
  const statusMatch =
    filter === "completed"
      ? h.completed
      : filter === "pending"
      ? !h.completed
      : true;

  const categoryMatch =
    categoryFilter === "All"
      ? true
      : h.category === categoryFilter;
      
const searchMatch =
  h.title.toLowerCase().includes(search.toLowerCase());
  return statusMatch && categoryMatch && searchMatch;
})

                .map((h) => (
           <li
             key={h._id}
             className = "habit-item"
              >
                  
            <div className = "habit-info">
                          {editingId === h._id ? (
  <input
    value={editTitle}
    onChange={(e) => setEditTitle(e.target.value)}
  />
  
) : (
                               <span className="habit-text">
                                    {h.title}
                                    <span className={`category-tag ${h.category.toLowerCase()}`}>
  {h.category}
</span>
                                   -<span className= {h.completed ?  "done-text " : "pending-text"}>{h.completed ? "completed" : "Pending"}</span>
                                    </span>
                              
)}
{showDetails === h._id &&(
  <>
  <p className="streak-text">
  🔥 Streak: <span style={{color:"black"}}>{h.streak} days</span>
</p>
<p className="longest-streak-text">
  🏆 Longest Streak:{" "}
  <span style={{color:"black"}}>
    {h.longestStreak} days
  </span>
</p>

<p className="last-completed-text">📅
  <strong>Last Completed:</strong>{" "}
  <strong style={{color:"black"}}>
    {h.lastCompleted
      ? new Date(h.lastCompleted).toLocaleDateString()
      : "Never"}
  </strong>
</p>
<div className = "history-row">
<p className="history-text">
  📖 <strong>History:</strong>{" "}
  <strong style={{color:"black"}}>
    {h.history?.length || 0} records
  </strong>
</p>

<button
  className="history-btn"
  onClick={() =>
    setShowHistory(showHistory === h._id ? null : h._id)
  }
>
  {showHistory === h._id ? "Hide " : "View"}
</button>
</div>

{showHistory === h._id && (
  <div className="history-popup">
    <h4>📖 Completion History</h4>

    {h.history?.length?(
      h.history
        .slice(-5)
        .reverse()
        .map((date, index) => (
          <p key={index}>
            {new Date(date).toLocaleDateString("en-GB")}
          </p>
        ))
    ) : (
      <p>No history available</p>
    )}
  </div>
)}

</>
)}
    

   

  </div>
                                   
    <div className = "action-buttons">
                                      <button 
                                                className = "complete-btn"
                                                  onClick ={() =>toggleHabit(h._id)}>
                                            {h.completed ? "Undo" : "complete"}
                                                            </button>
                                                            <button
                                                                  className="edit-btn"
                                                                    onClick={() => editHabit(h)}
                                                                      >
                                                                     Edit
                                                                      </button>

                                                                      {editingId === h._id && (
  <button
    className="edit-btn"
    onClick={() => saveEdit(h._id)}
  >
    Save
  </button>
  
)}

  <button
  className="details-btn"
  onClick={() =>
    setShowDetails(showDetails === h._id ? null : h._id)
  }
>
  {showDetails === h._id ? "Hide Details" : "Details"}
</button>
                                                                    <button 
                                                            className="delete-btn"
                                                               onClick={() => deleteHabit(h._id)}>
                            Delete
                  </button>
                  </div>
          </li>
        ))}
      </ul>
    </div>
    
   {showLogoutPopup && (
  <div className="popup-overlay">
    <div className="logout-popup">
      <h3>Logout</h3>
      <p>Are you sure you want to logout?</p>

      <div className="popup-buttons">
        <button
          className="cancel-btn"
          onClick={() => setShowLogoutPopup(false)}
        >
          Cancel
        </button>

        <button
          className="confirm-btn"
          onClick={() => {
            setShowLogoutPopup(false);
            localStorage.removeItem("token");
            setToken(null);
          }}
        >
          Logout
        </button>
      </div>
    </div>
  </div>
)}



  </div>
  

  );
  }

export default App;