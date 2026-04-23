import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { fetchUsers, deleteUser } from '../api/admin';
import { getMe, logout } from '../api/auth';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    getMe()
      .then(setAdmin)
      .catch(() => {
        logout();
        navigate('/admin/login');
      });

    loadUsers();
  }, [navigate]);

  async function loadUsers() {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: t('user_management.session_error_title'),
        text: t('user_management.session_error_text'),
        background: '#131522',
        color: '#f8fafc',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, email) {
    const result = await Swal.fire({
      title: t('user_management.delete_title'),
      text: t('user_management.delete_text', { email }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#475569',
      confirmButtonText: t('user_management.delete_confirm'),
      background: '#131522',
      color: '#f8fafc',
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(id);
        Swal.fire({
          icon: 'success',
          title: t('user_management.deleted_title'),
          text: t('user_management.deleted_text'),
          background: '#131522',
          color: '#f8fafc',
          timer: 1500,
          showConfirmButton: false,
        });
        loadUsers();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: t('user_management.action_failed'),
          text: err.message,
          background: '#131522',
          color: '#f8fafc',
        });
      }
    }
  }

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.roles.some(r => r.toLowerCase().includes(search.toLowerCase()))
  );

  const getInitials = (email) => email.substring(0, 2).toUpperCase();

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <i className="bi bi-shield-check-fill me-3"></i>
          <span>ANTIGRAVITY</span>
        </div>
        <nav className="flex-grow-1">
          <Link to="/admin/dashboard" className="sidebar-link">
            <i className="bi bi-grid-1x2-fill"></i>{t('sidebar.overview')}
          </Link>
          <Link to="/admin/users" className="sidebar-link active">
            <i className="bi bi-people-fill"></i>{t('sidebar.team_members')}
          </Link>
          <a href="#" className="sidebar-link">
            <i className="bi bi-shield-lock-fill"></i>{t('sidebar.security')}
          </a>
          <a href="#" className="sidebar-link">
            <i className="bi bi-terminal-fill"></i>{t('sidebar.system_logs')}
          </a>
        </nav>
        <div className="mb-3">
          <LanguageSwitcher />
        </div>
        <button className="btn btn-secondary-custom w-100" onClick={() => { logout(); navigate('/admin/login'); }}>
          <i className="bi bi-box-arrow-left me-2"></i>{t('sidebar.sign_out')}
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="d-flex align-items-center justify-content-between mb-5 fade-in">
          <div>
            <h1 className="h3 fw-bold mb-1">{t('user_management.title')}</h1>
            <p className="text-muted mb-0">{t('user_management.subtitle')}</p>
          </div>
          <button
            className="btn btn-primary-custom px-4"
            onClick={() => navigate('/admin/users/new')}
          >
            <i className="bi bi-plus-lg me-2"></i>{t('user_management.add_member')}
          </button>
        </div>

        {/* Filters Header */}
        <div className="glass-card mb-4 p-3 d-flex align-items-center gap-3 fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="position-relative flex-grow-1">
            <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-dim"></i>
            <input
              type="text"
              className="form-control custom-input ps-5"
              placeholder={t('user_management.search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary-custom">
            <i className="bi bi-filter me-2"></i>{t('user_management.filters')}
          </button>
        </div>

        {/* Users Table */}
        <div className="glass-card overflow-hidden fade-in" style={{ animationDelay: '0.2s' }}>
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('user_management.col_member')}</th>
                    <th>{t('user_management.col_id')}</th>
                    <th>{t('user_management.col_permissions')}</th>
                    <th className="text-end">{t('user_management.col_actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="user-avatar">{getInitials(u.email)}</div>
                          <div>
                            <div className="fw-bold text-white mb-0">{u.email}</div>
                            <div className="text-dim small">{t('user_management.user_account')}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="text-id">#{u.id}</span></td>
                      <td>
                        <div className="d-flex gap-2">
                          {u.roles.map((r) => (
                            <span key={r} className={`role-pill ${r === 'ROLE_SUPER_ADMIN' ? 'role-pill-admin' : 'role-pill-user'}`}>
                              {r.replace('ROLE_', '').replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn-icon-sm"
                            title="Modify User"
                            onClick={() => navigate(`/admin/users/${u.id}/edit`)}
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            className="btn-icon-sm"
                            title="Delete User"
                            onClick={() => handleDelete(u.id, u.email)}
                            disabled={admin?.email === u.email}
                          >
                            <i className="bi bi-trash3-fill"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}