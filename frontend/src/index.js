import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import Tailwind CSS
import './index.css';

/**
 * Application Entry Point
 * 
 * Initializes the React application and renders the root App component.
 * This is where the React application starts and connects to the DOM.
 */

// Create root element for React 18+ concurrent features
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component with React.StrictMode for development checks
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/**
 * Development Notes:
 * 
 * - React.StrictMode helps identify potential problems in the application
 * - It activates additional checks and warnings for its descendants
 * - StrictMode does not render any visible UI elements
 * - It only affects development mode, not production builds
 */