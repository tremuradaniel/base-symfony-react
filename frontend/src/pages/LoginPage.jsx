import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { login, getMe } from '../api/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      const me = await getMe();

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Logging you in...',
        timer: 1500,
        showConfirmButton: false,
        background: '#1a1a2e',
        color: '#f1f5f9',
        iconColor: '#6366f1',
      });

      setTimeout(() => {
        if (me.roles.includes('ROLE_SUPER_ADMIN')) {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.message || 'Invalid credentials. Please try again.',
        confirmButtonColor: '#6366f1',
        background: '#1a1a2e',
        color: '#f1f5f9',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page d-flex align-items-center justify-content-center min-vh-100">
      <div className="login-card card shadow-lg border-0">
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="login-icon mb-3">
              <i className="bi bi-person-circle"></i>
            </div>
            <h1 className="h3 fw-bold text-white">Welcome Back</h1>
            <p className="text-muted-custom">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} id="user-login-form">
            <div className="mb-3">
              <label htmlFor="user-email" className="form-label text-label">
                Email address
              </label>
              <input
                id="user-email"
                type="email"
                className="form-control custom-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="user-password" className="form-label text-label">
                Password
              </label>
              <input
                id="user-password"
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
              id="user-login-btn"
              type="submit"
              className="btn btn-primary-custom w-100 py-2 fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <a href="/admin/login" className="admin-link">
              Admin login →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
