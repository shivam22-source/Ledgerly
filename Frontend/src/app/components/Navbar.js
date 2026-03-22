import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.5px' }}>
            Ledgerly<span style={{ color: '#63d39f' }}>.</span>
          </span>
        </Link>
      </div>

      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/add">Add Task</Link>
        <Link to="/summary">Monthly Summary</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '13px', color: '#4a5568' }}>
          {userEmail}
        </span>
        <button
          onClick={handleLogout}
          className="nav-logout"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;