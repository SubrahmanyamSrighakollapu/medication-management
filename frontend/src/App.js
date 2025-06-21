// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import RoleSwitcher from './components/RoleSwitcher';
import PatientDashboard from './components/PatientDashboard';
import CaretakerDashboard from './components/CaretakerDashboard';
import Header from './components/Header';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const user = JSON.parse(localStorage.getItem('user'));
  const activeRole = user?.activeRole;

  return (
    <Router>
      {isAuthenticated && <Header setIsAuthenticated={setIsAuthenticated} />}

      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to="/switch-role" replace />
              : <Login setIsAuthenticated={setIsAuthenticated} />
          }
        />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/switch-role"
          element={isAuthenticated ? <RoleSwitcher /> : <Navigate to="/" />}
        />

        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              activeRole === 'patient' ? (
                <Navigate to="/dashboard/patient" replace />
              ) : activeRole === 'caretaker' ? (
                <Navigate to="/dashboard/caretaker" replace />
              ) : (
                <Navigate to="/switch-role" />
              )
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/dashboard/patient"
          element={isAuthenticated ? <PatientDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/dashboard/caretaker"
          element={isAuthenticated ? <CaretakerDashboard /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
