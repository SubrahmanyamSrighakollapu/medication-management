import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
  }, []);

  const validate = () => {
    const newErrors = {};
    if (username.trim().length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await api.post('/auth/signup', { username, password, role });
      alert('Signup successful. Please login.');
      setTimeout(() => navigate('/'), 100);
    } catch (err) {
      setErrors({ form: 'Signup failed. Try again with a different username.' });
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form onSubmit={handleSignup} className="border p-4 shadow rounded bg-light">
            <h2 className="text-center mb-4">Signup</h2>

            {errors.form && <div className="alert alert-danger">{errors.form}</div>}

            <div className="mb-3">
              <input
                type="text"
                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
            </div>

            <div className="mb-3">
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <div className="mb-4">
              <select
                className="form-select"
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <option value="patient">Patient</option>
                <option value="caretaker">Caretaker</option>
              </select>
            </div>

            <button type="submit" className="btn btn-success w-100">Signup</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
