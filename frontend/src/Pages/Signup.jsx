import { useState } from "react";
import "./Login.css";
import LoginImage from "../Assets/Habit.jpg";

function Signup({setShowLogin}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    const res = await fetch(
      "https://evolve-backend-18vo.onrender.com/signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      }
    );

    const data = await res.json();
    if (res.ok) {
  setMessage("✅ Successfully signed up! Please login.");

  setTimeout(() => {
    setShowLogin(true);
  }, 2000);
} else {
  setMessage(data.message);
}
  };

 return (
  <div className="login-container">

    {/* Left Side */}
    <div className="login-left">

      <div className="login-box">

        <h1 className="title">Habit Tracker</h1>

        <p className="quote">
          Create your account and start building better habits.
        </p>

        <input
          className="input-box"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="input-box"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input-box"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {message && (
          <p className="error" style={{ color: "green" }}>
            {message}
          </p>
        )}

        <button
          className="login-btn"
          onClick={handleSignup}
        >
          Sign Up
        </button>

        <p className="signup-text">
          Already have an account?

          <button
            className="signup-btn"
            onClick={() => setShowLogin(true)}
          >
            Login
          </button>
        </p>

      </div>

    </div>

    {/* Right Side */}

    <div className="login-right">
      <img src={LoginImage} alt="Habit Tracker" />
    </div>

  </div>
);
}

export default Signup;