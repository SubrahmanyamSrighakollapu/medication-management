// src/components/Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Header = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <span className="navbar-brand">MediCare</span>
      <div className="ms-auto m-2">
        <button
  className="btn btn-outline-light me-2"
  onClick={() => window.location.href = "/switch-role"}
>
  Switch Role
</button>
        <button
  className="btn btn-outline-light me-2"
  onClick={() => window.location.href = "/"}
>
  Login
</button>
<button
  className="btn btn-outline-light me-2"
  onClick={() => window.location.href = "/signup"}
>
  Sign Up
</button>

      </div>
    </nav>
  );
};

export default Header;
