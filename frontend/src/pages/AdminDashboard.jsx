import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <i className="bi bi-shield-check-fill me-3"></i>
          <span>ANTIGRAVITY</span>
        </div>
        <nav className="flex-grow-1">
          <Link to="/admin/dashboard" className="sidebar-link active">
            <i className="bi bi-grid-1x2-fill"></i>Overview
          </Link>
          <Link to="/admin/users" className="sidebar-link">
            <i className="bi bi-people-fill"></i>Team Members
          </Link>
          <a href="#" className="sidebar-link">
            <i className="bi bi-shield-lock-fill"></i>Security
          </a>
          <a href="#" className="sidebar-link">
            <i className="bi bi-terminal-fill"></i>System Logs
          </a>
        </nav>
        <button className="btn btn-secondary-custom w-100" onClick={() => { logout(); navigate('/admin/login'); }}>
          <i className="bi bi-box-arrow-left me-2"></i>Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="d-flex align-items-center justify-content-between mb-5 fade-in">
          <div>
            <h1 className="h3 fw-bold mb-1">Organization Overview</h1>
            <p className="text-muted mb-0">System health and high-level activity metrics.</p>
          </div>
          <div className="admin-avatar-chip">
            <i className="bi bi-person-circle me-2 text-accent"></i>
            {user?.email || 'Administrator'}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="row g-4 mb-5 fade-in" style={{ animationDelay: '0.1s' }}>
          {[
            { icon: 'bi-people', label: 'Total Members', value: '12', color: 'text-primary' },
            { icon: 'bi-lightning-charge', label: 'Traffic Rate', value: '42ms', color: 'text-success' },
            { icon: 'bi-shield-check', label: 'Incidents', value: '0', color: 'text-success' },
            { icon: 'bi-hdd', label: 'Storage', value: '84%', color: 'text-warning' },
          ].map((item) => (
            <div className="col-md-3" key={item.label}>
              <div className="glass-card p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className={`p-2 rounded-3 bg-opacity-10 ${item.color.replace('text-', 'bg-')}`}>
                    <i className={`bi ${item.icon} ${item.color}`}></i>
                  </div>
                  <i className="bi bi-arrow-up-right text-muted small"></i>
                </div>
                <div className="h4 fw-bold mb-1">{item.value}</div>
                <div className="text-dim small fw-semibold uppercase">{item.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Details Card */}
        <div className="glass-card p-4 fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h5 className="fw-bold mb-0">Identity Snapshot</h5>
            <button className="btn btn-sm btn-secondary-custom">Refresh</button>
          </div>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="p-3 rounded-4 bg-white bg-opacity-5 border border-white border-opacity-5">
                <div className="text-dim small mb-1">Email Identifier</div>
                <div className="fw-semibold">{user?.email || '…'}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-3 rounded-4 bg-white bg-opacity-5 border border-white border-opacity-5">
                <div className="text-dim small mb-1">Effective Permissions</div>
                <div className="d-flex gap-2">
                  {user?.roles.map((r) => (
                    <span key={r} className="role-pill role-pill-admin">{r}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
