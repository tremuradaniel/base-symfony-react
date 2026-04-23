import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { login, getMe } from '../api/auth';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      const me = await getMe();

      if (!me.roles.includes('ROLE_SUPER_ADMIN')) {
        Swal.fire({
          icon: 'warning',
          title: t('admin_login.access_denied_title'),
          text: t('admin_login.access_denied_text'),
          confirmButtonColor: '#ef4444',
          background: '#1a1a2e',
          color: '#f1f5f9',
        });
        return;
      }

      Swal.fire({
        icon: 'success',
        title: t('admin_login.verified_title'),
        text: t('admin_login.verified_text'),
        timer: 1500,
        showConfirmButton: false,
        background: '#1a1a2e',
        color: '#f1f5f9',
        iconColor: '#ef4444',
      });

      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: t('admin_login.failed_title'),
        text: err.message || t('admin_login.failed_text'),
        confirmButtonColor: '#ef4444',
        background: '#1a1a2e',
        color: '#f1f5f9',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page d-flex align-items-center justify-content-center min-vh-100">
      <div className="login-card card shadow-lg border-0">
        <div className="card-body p-5">
          <div className="d-flex justify-content-end mb-2">
            <LanguageSwitcher />
          </div>
          <div className="text-center mb-4">
            <div className="admin-login-icon mb-3">
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            <h1 className="h3 fw-bold text-white">{t('admin_login.title')}</h1>
            <p className="text-muted-custom">{t('admin_login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} id="admin-login-form">
            <div className="mb-3">
              <label htmlFor="admin-email" className="form-label text-label">
                {t('admin_login.email')}
              </label>
              <input
                id="admin-email"
                type="email"
                className="form-control custom-input"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="admin-password" className="form-label text-label">
                {t('admin_login.password')}
              </label>
              <input
                id="admin-password"
                type="password"
                className="form-control custom-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              className="btn btn-danger-custom w-100 py-2 fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  {t('admin_login.authenticating')}
                </>
              ) : (
                t('admin_login.sign_in')
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <a href="/login" className="user-link">
              {t('admin_login.back_link')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
