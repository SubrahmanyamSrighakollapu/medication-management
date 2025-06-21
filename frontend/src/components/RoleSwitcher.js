import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PersonFill, HeartPulseFill,
  CheckCircleFill, CalendarEventFill,
  CameraFill, LaptopFill,
  EnvelopeFill, BarChartFill, GearFill
} from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';

const RoleSwitcher = () => {
  const navigate = useNavigate();

  const handleContinue = (role) => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    user.activeRole = role;
    localStorage.setItem('user', JSON.stringify(user));

    if (role === 'patient') {
      navigate('/dashboard/patient');
    } else if (role === 'caretaker') {
      navigate('/dashboard/caretaker');
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center px-3"
         style={{
           background: 'linear-gradient(135deg, #5c6bc0, #42a5f5, #81c784)',
           backgroundSize: '600% 600%',
           animation: 'gradientMove 15s ease infinite',
           color: 'white',
           textShadow: '0 1px 2px rgba(0,0,0,0.2)'
         }}>

      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">MediCare Companion</h1>
        <p className="lead">Your trusted partner in medication management. Please choose your role to login.</p>
      </div>

      <div className="container">
        <div className="row justify-content-center g-4">
          {/* Patient Card */}
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0 rounded-4 h-100">
              <div className="card-body text-center">
                <PersonFill size={50} className="text-primary mb-3" />
                <h4 className="fw-semibold mb-3">I'm a Patient</h4>
                <ul className="list-unstyled text-start mb-4">
                  <li className="mb-2"><CheckCircleFill className="me-2 text-success" />Mark medications as taken</li>
                  <li className="mb-2"><CameraFill className="me-2 text-warning" />Upload proof photos</li>
                  <li className="mb-2"><CalendarEventFill className="me-2 text-info" />View medication calendar</li>
                  <li className="mb-2"><LaptopFill className="me-2 text-secondary" />User-friendly dashboard</li>
                </ul>
                <button className="btn btn-primary w-100 rounded-pill" onClick={() => handleContinue('patient')}>
                  Continue as Patient
                </button>
              </div>
            </div>
          </div>

          {/* Caretaker Card */}
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0 rounded-4 h-100">
              <div className="card-body text-center">
                <HeartPulseFill size={50} className="text-danger mb-3" />
                <h4 className="fw-semibold mb-3">I'm a Caretaker</h4>
                <ul className="list-unstyled text-start mb-4">
                  <li className="mb-2"><CheckCircleFill className="me-2 text-success" />Monitor compliance</li>
                  <li className="mb-2"><GearFill className="me-2 text-dark" />Set notifications</li>
                  <li className="mb-2"><BarChartFill className="me-2 text-primary" />View adherence history</li>
                  <li className="mb-2"><EnvelopeFill className="me-2 text-info" />Receive alerts</li>
                </ul>
                <button className="btn btn-danger w-100 rounded-pill" onClick={() => handleContinue('caretaker')}>
                  Continue as Caretaker
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-white mt-5 small">You can switch roles anytime after login.</p>

      {/* Bootstrap animation keyframes via inline style injection */}
      <style>
        {`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        `}
      </style>
    </div>
  );
};

export default RoleSwitcher;
