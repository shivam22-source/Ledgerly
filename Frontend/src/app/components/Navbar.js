import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail') || 'User';

  const handleLogout = () => {
    // clear auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');

    // redirect to login
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link
          to="/"
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#000',
            textDecoration: 'none'
          }}
        >
          Ledgerly.
        </Link>
      </div>

      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/add">Add Task</Link>
        <Link to="/summary">Monthly Summary</Link>

        <span style={{ marginLeft: '30px', color: '#666', fontSize: '14px' }}>
          Logged in: <strong>{userEmail}</strong>
        </span>

        <button
          onClick={handleLogout}
          style={{
            marginLeft: '20px',
            background: 'none',
            border: 'none',
            color: '#d00',
            cursor: 'pointer',
            fontWeight: '500',
           transform: 'translateX(190px)' 
            
          }}
        >
          Log Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
