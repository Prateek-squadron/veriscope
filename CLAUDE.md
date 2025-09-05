# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a full-stack web application with three main components:

- **Backend**: Node.js/Express API server with MongoDB integration
  - Located in `backend/` directory
  - Uses Express.js framework with JWT authentication
  - MongoDB database with Mongoose ODM
  - Structured with controllers, models, routes, and utilities
  - Dependencies: express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv, axios

- **Frontend**: React application with Tailwind CSS
  - Located in `frontend/` directory
  - React 19.x with React Router for client-side routing
  - Tailwind CSS for styling with PostCSS processing
  - Axios for API communication
  - Structured with components, pages, and services

- **Extension**: Browser extension component
  - Located in `extension/` directory

## Development Commands

### Backend
```bash
cd backend
npm install           # Install dependencies
npm run lint         # Run ESLint (if configured)
npm run format       # Run Prettier (if configured)
```

### Frontend
```bash
cd frontend
npm install           # Install dependencies
```

## Key Configuration Files

- `frontend/tailwind.config.js`: Tailwind CSS configuration
- `frontend/postcss.config.js`: PostCSS configuration for Tailwind processing
- Both package.json files use CommonJS modules (type: "commonjs")

## Technology Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT authentication
- **Frontend**: React 19, React Router, Tailwind CSS, Axios
- **Development Tools**: ESLint, Prettier, nodemon

## Project Status

This appears to be a newly initialized project with basic structure and dependencies but minimal implementation.