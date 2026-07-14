import { useState } from "react";
import "./Login.css";
import LoginImage from "../Assets/Habit.jpg";


function Login({setToken,setShowLogin}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error , setError] = useState ("");
const [showForgotPassword, setShowForgotPassword] = useState(false);
const [resetEmail, setResetEmail] = useState("");
const [forgotMessage, setForgotMessage] = useState("");
const [loginMessage, setLoginMessage] = useState("");

 const handleLogin = async () => {
  try {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);

      setLoginMessage("Login successful");
      setForgotMessage(""); // Clear forgot password message
      setError("");
    } else {
      setLoginMessage("");
      setError("Invalid email or password");
    }
  } catch (error) {
    console.error(error);
    setLoginMessage("");
    setError("Something went wrong. Please try again.");
  }
};
const handleForgotPassword = async () => {
  if (!resetEmail) {
    alert("Please enter your email.");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: resetEmail,
      }),
    });

    const data = await res.json();

   setForgotMessage(data.message);
      // Show the message in the popup
      setTimeout(() => {
  setShowForgotPassword(false);
  setForgotMessage("");
  setResetEmail("");
}, 2500);
    setLoginMessage("");   

  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again.");
  }
};
     return (
  <div className="login-container">

    {/* Left Side */}
    <div className="login-left">

      <div className="login-box">

        <h1 className="title">EVOLVE</h1>

        <p className="quote">
          Track today. Transform tomorrow.
        </p>

        <input
          className="input-box"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && (
          <p className="error">{error}</p>
        )}

        <input
          className="input-box"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="login-btn"
          onClick={handleLogin}
         

        >
          Login
        </button>

        <button
          className="forgot-btn"
          onClick={() => setShowForgotPassword(true)}
        >
          Forgot Password?
        </button>

        <p className="signup-text">
          Don't have an account?

          <button
            className="signup-btn"
            onClick={() => setShowLogin(false)}
          >
            Sign Up
          </button>
        </p>

      </div>

    </div>

    {/* Right Side */}

   <div className="login-right">
  <img src={LoginImage} alt="Habit Tracker" />
  </div>
{showForgotPassword && (
  <div className="popup-overlay">

    <div className="popup">

      <h2>Reset Password</h2>

      <p>Enter your registered email.</p>

      <input
        type="email"
        placeholder="Email"
        value={resetEmail}
        onChange={(e) => setResetEmail(e.target.value)}
      />
      {forgotMessage && (
  <p className="success-message">{forgotMessage}</p>
)}

      <div className="popup-buttons">

        <button className="login-btn" 
        onClick={handleForgotPassword}
>
          Send Link
        </button>

        <button
          className="cancel-btn"
          onClick={() => {
            setShowForgotPassword(false);
            setForgotMessage("");
  setResetEmail("");
          }}
        >
          Cancel
        </button>

      </div>

    </div>

  </div>
)}
  </div>
);
      
  
}

export default Login;