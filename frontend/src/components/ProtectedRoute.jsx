import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { tokenUtils } from '../utils/api';

/**
 * ProtectedRoute Component
 * 
 * Wrapper component that protects routes requiring authentication.
 * Redirects unauthenticated users to the login page while preserving
 * the intended destination for post-login redirect.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.ReactElement} Protected content or redirect to login
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = tokenUtils.isAuthenticated();

  // If user is not authenticated, redirect to login page
  // Pass the current location in state so we can redirect back after login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // If authenticated, render the protected content
  return children;
};

export default ProtectedRoute;