import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, logout } from '../api/auth';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => {
        logout();
        navigate('/admin/login');
      });
  }, [navigate]);

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div className="admin-dashboard-page min-vh-100">
      {/* Sidebar */}
      <div className="admin-layout">
        <aside className="admin-sidebar d-flex flex-column p-4">
          <div className="sidebar-logo mb-5">
            <i className="bi bi-shield-fill-check me-2"></i>
            <span className="fw-bold">Admin Panel</span>
          </div>
          <nav className="sidebar-nav flex-grow-1">
            <a href="#" className="sidebar-link active">
              <i className="bi bi-speedometer2 me-2"></i>Dashboard
            </a>
            <a href="#" className="sidebar-link">
              <i className="bi bi-people me-2"></i>Users
            </a>
            <a href="#" className="sidebar-link">
              <i className="bi bi-gear me-2"></i>Settings
            </a>
            <a href="#" className="sidebar-link">
              <i className="bi bi-bar-chart me-2"></i>Analytics
            </a>
          </nav>
          <button
            id="admin-logout-btn"
            className="btn btn-logout mt-auto"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-left me-2"></i>Sign Out
          </button>
        </aside>

        {/* Main content */}
        <main className="admin-main p-5">
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-5">
            <div>
              <h1 className="h4 fw-bold text-white mb-0">Overview</h1>
              <p className="text-muted-admin mb-0 small">Welcome back, administrator</p>
            </div>
            <div className="admin-avatar-chip">
              <i className="bi bi-shield-lock me-2"></i>
              {user ? user.email : '…'}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="row g-4 mb-5">
            {[
              { icon: 'bi-people-fill', label: 'Total Users', value: '–', color: 'kpi-purple' },
              { icon: 'bi-activity', label: 'Active Sessions', value: '–', color: 'kpi-blue' },
              { icon: 'bi-shield-exclamation', label: 'Security Alerts', value: '0', color: 'kpi-red' },
              { icon: 'bi-hdd-stack', label: 'System Health', value: 'OK', color: 'kpi-green' },
            ].map((item) => (
              <div className="col-md-3" key={item.label}>
                <div className={`kpi-card card border-0 ${item.color}`}>
                  <div className="card-body p-4">
                    <div className="kpi-icon mb-2">
                      <i className={`bi ${item.icon}`}></i>
                    </div>
                    <div className="kpi-value">{item.value}</div>
                    <div className="kpi-label">{item.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Session info */}
          <div className="admin-info-card card border-0 p-4">
            <h5 className="text-white fw-semibold mb-3">
              <i className="bi bi-person-badge me-2"></i>Session Info
            </h5>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{user?.email || '…'}</span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="info-item">
                  <span className="info-label">Roles</span>
                  <span className="info-value">
                    {user?.roles.map((r) => (
                      <span key={r} className="badge admin-role-badge me-1">{r}</span>
                    ))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
