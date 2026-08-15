import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from "@react-oauth/google";
import reportWebVitals from './reportWebVitals';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
    <GoogleOAuthProvider clientId="924742727538-n06rmei66cdeb997bjv4p7l8g0arhr0n.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
