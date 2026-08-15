import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";
import LoginImage from "../Assets/Back.jpg";


function Login({setToken,setShowLogin,setShowGetStarted}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error , setError] = useState ("");
const [loginMessage, setLoginMessage] = useState("");

 const handleLogin = async () => {
  try {
    const res = await fetch("https://evolve-backend-18vo.onrender.com/login", {
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
  const handleGoogleLogin = async (credentialResponse) => {
  try {
    const res = await fetch(
      "https://evolve-backend-18vo.onrender.com/google-login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      }
    );

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setError("");
    } else {
      setError(data.message || "Google login failed");
    }
  } catch (err) {
    console.error("Google login error:", err);
    setError("Something went wrong with Google login.");
  }
};
     return (
  <div className="login-container">

    {/* Left Side */}
    <div className="login-left">

      <div className="login-box">
        <button
  className="back-btn"
  onClick={() => {
    setShowLogin(false);
    setShowGetStarted(true);
  }}
>
  ← Back
</button>

        <p className="login-quote">
  Good Things Take Time.
</p>
        {loginMessage && (
  <p className="success-message">{loginMessage}
  </p>
)}

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

        <div className="or-divider">
  <span>OR</span>
</div>

<div className="google-login">
  <GoogleLogin
    onSuccess={handleGoogleLogin}
    onError={() => {
      setError("Google login failed.");
    }}
  />
</div>
        <p className="signup-text">
          Don't have an account?

          <button
            className="signup-btn"
            onClick={() => setShowLogin(false)}
          >
            Create Account
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

export default Login;