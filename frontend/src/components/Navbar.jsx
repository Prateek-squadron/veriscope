import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { tokenUtils, userUtils } from '../utils/api';
import ThemeToggle from './ThemeToggle';

/**
 * Navbar Component
 * 
 * Top navigation bar with app branding, navigation links, and user actions.
 * Displays different navigation options based on authentication status.
 * Includes responsive design for mobile devices.
 */
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = tokenUtils.isAuthenticated();
  const user = userUtils.getUser();

  /**
   * Handle user logout
   * Clears authentication data and redirects to home page
   */
  const handleLogout = () => {
    tokenUtils.removeToken();
    userUtils.removeUser();
    navigate('/', { replace: true });
  };

  /**
   * Check if current path matches the given path (for active link styling)
   */
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo and Name */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">VeriScope</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {!isAuthenticated ? (
              // Unauthenticated user navigation
              <>
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath('/') 
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/login" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath('/login') 
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
                <ThemeToggle />
              </>
            ) : (
              // Authenticated user navigation
              <>
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath('/dashboard') 
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/verify" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath('/verify') 
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Verify Content
                </Link>
                <Link 
                  to="/history" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath('/history') 
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  History
                </Link>
                
                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* User Menu */}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200 dark:border-gray-600">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Welcome, <span className="font-medium">{user?.username || 'User'}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              type="button"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:text-gray-900 dark:focus:text-white p-2"
              onClick={() => {
                // Simple mobile menu toggle (you could expand this with state management)
                const mobileMenu = document.getElementById('mobile-menu');
                mobileMenu.classList.toggle('hidden');
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          {!isAuthenticated ? (
            // Unauthenticated mobile navigation
            <>
              <Link 
                to="/" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActivePath('/') 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/login" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActivePath('/login') 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
              >
                Sign Up
              </Link>
            </>
          ) : (
            // Authenticated mobile navigation
            <>
              <Link 
                to="/dashboard" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActivePath('/dashboard') 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/verify" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActivePath('/verify') 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Verify Content
              </Link>
              <Link 
                to="/history" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActivePath('/history') 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                History
              </Link>
              <div className="border-t border-gray-300 dark:border-gray-600 mt-3 pt-3">
                <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                  Welcome, <span className="font-medium">{user?.username || 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;