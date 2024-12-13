import React from 'react';
import ReactDOM from 'react-dom/client'; // Verwende den 'client'-Export von ReactDOM
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Dein AuthContext importieren
import App from './App';
import './styles/index.css'; // Importiere die Styles

// Verwende createRoot statt render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);
