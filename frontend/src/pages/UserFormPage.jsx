import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { fetchUser, createUser, updateUser } from '../api/admin';
import { getMe, logout } from '../api/auth';
import { useLanguage } from '../contexts/LanguageContext';

export default function UserFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState(['ROLE_USER']);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    getMe().catch(() => {
      logout();
      navigate('/admin/login');
    });

    if (isEdit) {
      loadUser();
    }
  }, [id, navigate]);

  async function loadUser() {
    try {
      const data = await fetchUser(id);
      setEmail(data.email);
      setRoles(data.roles);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: t('user_form.not_found_title'),
        text: t('user_form.not_found_text'),
        background: '#131522',
        color: '#f8fafc',
      });
      navigate('/admin/users');
    } finally {
      setFetching(false);
    }
  }

  const roleOptions = [
    { value: 'ROLE_USER', label: t('user_form.role_user_label'), desc: t('user_form.role_user_desc') },
    { value: 'ROLE_SUPER_ADMIN', label: t('user_form.role_admin_label'), desc: t('user_form.role_admin_desc') },
  ];

  function toggleRole(role) {
    if (roles.includes(role)) {
      if (role === 'ROLE_USER') return;
      setRoles(roles.filter(r => r !== role));
    } else {
      setRoles([...roles, role]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await updateUser(id, { roles });
        Swal.fire({ icon: 'success', title: t('user_form.updated_title'), background: '#131522', color: '#f8fafc', timer: 1500, showConfirmButton: false });
      } else {
        await createUser({ email, password, roles });
        Swal.fire({ icon: 'success', title: t('user_form.created_title'), background: '#131522', color: '#f8fafc', timer: 1500, showConfirmButton: false });
      }
      navigate('/admin/users');
    } catch (err) {
      Swal.fire({ icon: 'error', title: t('user_form.save_failed_title'), text: err.message, background: '#131522', color: '#f8fafc' });
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="admin-layout d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
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
        </nav>
      </aside>

      <main className="admin-main">
        <div className="max-w-3xl mx-auto">
          <div className="mb-5 fade-in">
            <Link to="/admin/users" className="text-accent text-decoration-none small mb-3 d-inline-block">
              <i className="bi bi-arrow-left me-2"></i>{t('user_form.back')}
            </Link>
            <h1 className="h3 fw-bold mb-1">{isEdit ? t('user_form.title_edit') : t('user_form.title_create')}</h1>
            <p className="text-muted">
              {isEdit ? t('user_form.subtitle_edit', { email }) : t('user_form.subtitle_create')}
            </p>
          </div>

          <div className="glass-card p-5 fade-in" style={{ animationDelay: '0.1s' }}>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="text-muted small fw-bold mb-2 d-block">{t('user_form.label_email')}</label>
                <input
                  type="email"
                  className="form-control custom-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isEdit}
                  required
                  placeholder="e.g. john@company.com"
                />
                {isEdit && <div className="text-dim x-small mt-2">{t('user_form.email_locked')}</div>}
              </div>

              {!isEdit && (
                <div className="mb-4">
                  <label className="text-muted small fw-bold mb-2 d-block">{t('user_form.label_password')}</label>
                  <input
                    type="password"
                    className="form-control custom-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!isEdit}
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div className="mb-5">
                <label className="text-muted small fw-bold mb-3 d-block">{t('user_form.label_permissions')}</label>
                <div className="row g-3">
                  {roleOptions.map(opt => (
                    <div className="col-12" key={opt.value}>
                      <div
                        className={`p-3 rounded-4 border ${roles.includes(opt.value) ? 'border-primary bg-primary-dim' : 'border-white border-opacity-5 bg-white bg-opacity-5'} transition-all`}
                        onClick={() => toggleRole(opt.value)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-center">
                          <div className={`me-3 rounded-circle d-flex align-items-center justify-content-center ${roles.includes(opt.value) ? 'bg-primary text-white' : 'bg-white bg-opacity-10 text-muted'}`} style={{ width: 24, height: 24 }}>
                            {roles.includes(opt.value) && <i className="bi bi-check" style={{ fontSize: '1.2rem' }}></i>}
                          </div>
                          <div>
                            <div className={`fw-bold ${roles.includes(opt.value) ? 'text-primary' : 'text-white'}`}>{opt.label}</div>
                            <div className="text-muted small">{opt.desc}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="d-flex gap-3 pt-3">
                <button type="submit" className="btn btn-primary-custom flex-grow-1 py-3 h6 mb-0" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm"></span> : (isEdit ? t('user_form.btn_edit') : t('user_form.btn_create'))}
                </button>
                <button type="button" className="btn btn-secondary-custom px-4" onClick={() => navigate('/admin/users')} disabled={loading}>
                  {t('user_form.btn_cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}