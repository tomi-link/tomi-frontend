// src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Show login-required message if redirected
  useEffect(() => {
    const state = location.state as { from?: string };
    if (state?.from) {
      setNotice('Please log in to access the requested page.');
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/users/login', formData);

      const { id, fullName, email, role, isApproved, token } = response.data;

      if ((role === 'business' || role === 'admin') && !isApproved) {
        throw new Error('Your account is awaiting admin approval');
      }

      // Save token
      localStorage.setItem('token', token);

      // Save to auth context
      login({
        id,
        name: fullName,
        email,
        role,
        approved: isApproved,
        token,
      });

      // ✅ Redirect to intended destination or dashboard
      const redirectTo = (location.state as any)?.from || getDashboardRoute(role);
      navigate(redirectTo, { replace: true });

    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.request) {
        setError('Server not responding. Check your connection.');
      } else {
        setError(err.message || 'Something went wrong during login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getDashboardRoute = (role: string) => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'business') return '/business/dashboard';
    if (role === 'client') return '/client/dashboard';
    return '/';
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <h2 className="mb-4 text-center">Login</h2>

      {notice && (
        <div className="alert alert-info" role="alert">
          {notice}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Email address</label>
          <input
            type="email"
            className="form-control"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
