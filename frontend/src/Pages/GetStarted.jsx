import "./GetStarted.css";
import LandingImage from "../Assets/Landing.jpg";

function GetStarted({ setShowLogin, setShowGetStarted })  {
  return (
    <div
      className="get-started"
      style={{ backgroundImage: `url(${LandingImage})` }}
    >
      <div className="get-started-overlay">
        <div className="get-started-content">
          <h1>EVOLVE</h1>

          <p>Track today. Transform tomorrow.</p>

          <button
  onClick={() => {
    setShowGetStarted(false);
    setShowLogin(true);
  }}
>
  Get Started
</button>
        </div>
      </div>
    </div>
  );
}

export default GetStarted;