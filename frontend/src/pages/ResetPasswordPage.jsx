import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { resetPassword } from '../api/auth';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const token = searchParams.get('token');

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirm) {
      Swal.fire({
        icon: 'warning',
        title: t('reset_password.failed_title'),
        text: t('reset_password.mismatch'),
        background: '#1a1a2e',
        color: '#f1f5f9',
        confirmButtonColor: '#6366f1',
      });
      return;
    }

    if (!token) {
      Swal.fire({
        icon: 'error',
        title: t('reset_password.failed_title'),
        text: t('reset_password.invalid_token'),
        background: '#1a1a2e',
        color: '#f1f5f9',
        confirmButtonColor: '#6366f1',
      });
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      await Swal.fire({
        icon: 'success',
        title: t('reset_password.success_title'),
        text: t('reset_password.success_text'),
        background: '#1a1a2e',
        color: '#f1f5f9',
        confirmButtonColor: '#6366f1',
      });
      navigate('/login');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: t('reset_password.failed_title'),
        text: err.message || t('reset_password.invalid_token'),
        background: '#1a1a2e',
        color: '#f1f5f9',
        confirmButtonColor: '#6366f1',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page d-flex align-items-center justify-content-center min-vh-100">
      <div className="login-card card shadow-lg border-0">
        <div className="card-body p-5">
          <div className="d-flex justify-content-end mb-2">
            <LanguageSwitcher />
          </div>
          <div className="text-center mb-4">
            <div className="login-icon mb-3">
              <i className="bi bi-key-fill"></i>
            </div>
            <h1 className="h3 fw-bold text-white">{t('reset_password.title')}</h1>
            <p className="text-muted-custom">{t('reset_password.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-label">
                {t('reset_password.password')}
              </label>
              <input
                type="password"
                className="form-control custom-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-label">
                {t('reset_password.confirm')}
              </label>
              <input
                type="password"
                className="form-control custom-input"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary-custom w-100 py-2 fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  {t('reset_password.submitting')}
                </>
              ) : (
                t('reset_password.submit')
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <a href="/login" className="admin-link">
              {t('reset_password.back_link')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}