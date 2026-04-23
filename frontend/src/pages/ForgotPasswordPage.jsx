import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { forgotPassword } from '../api/auth';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      Swal.fire({
        icon: 'success',
        title: t('forgot_password.success_title'),
        text: t('forgot_password.success_text'),
        background: '#1a1a2e',
        color: '#f1f5f9',
        confirmButtonColor: '#6366f1',
      });
      setEmail('');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: t('forgot_password.failed_title'),
        text: err.message,
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
              <i className="bi bi-envelope-check"></i>
            </div>
            <h1 className="h3 fw-bold text-white">{t('forgot_password.title')}</h1>
            <p className="text-muted-custom">{t('forgot_password.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label text-label">
                {t('forgot_password.email')}
              </label>
              <input
                type="email"
                className="form-control custom-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
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
                  {t('forgot_password.submitting')}
                </>
              ) : (
                t('forgot_password.submit')
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <a href="/login" className="admin-link">
              {t('forgot_password.back_link')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
