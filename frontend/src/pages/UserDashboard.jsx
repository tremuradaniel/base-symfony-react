import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, logout } from '../api/auth';

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => {
        logout();
        navigate('/login');
      });
  }, [navigate]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="dashboard-page min-vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-dark dashboard-nav px-4">
        <span className="navbar-brand fw-bold">
          <i className="bi bi-columns-gap me-2"></i>My Dashboard
        </span>
        <button
          id="user-logout-btn"
          className="btn btn-outline-light btn-sm"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-1"></i>Sign Out
        </button>
      </nav>

      <div className="container py-5">
        {/* Welcome card */}
        <div className="dashboard-welcome-card card border-0 shadow mb-5">
          <div className="card-body p-4">
            <div className="d-flex align-items-center gap-3">
              <div className="avatar-circle">
                <i className="bi bi-person-fill"></i>
              </div>
              <div>
                <p className="text-muted mb-0 small">Signed in as</p>
                <h2 className="h5 fw-bold mb-0 text-white">
                  {user ? user.email : '…'}
                </h2>
                <div className="mt-1">
                  {user?.roles.map((r) => (
                    <span key={r} className="badge role-badge me-1">{r}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="row g-4 mb-5">
          {[
            { icon: 'bi-file-earmark-text', label: 'Documents', value: '0' },
            { icon: 'bi-chat-dots', label: 'Messages', value: '0' },
            { icon: 'bi-bell', label: 'Notifications', value: '0' },
          ].map((item) => (
            <div className="col-md-4" key={item.label}>
              <div className="stat-card card border-0 shadow-sm h-100">
                <div className="card-body d-flex align-items-center gap-3 p-4">
                  <div className="stat-icon">
                    <i className={`bi ${item.icon}`}></i>
                  </div>
                  <div>
                    <div className="stat-value">{item.value}</div>
                    <div className="stat-label">{item.label}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-placeholder card border-0 shadow-sm p-5 text-center">
          <i className="bi bi-boxes display-4 text-muted mb-3 d-block"></i>
          <p className="text-muted mb-0">Your workspace is ready. Start building something great.</p>
        </div>
      </div>
    </div>
  );
}
