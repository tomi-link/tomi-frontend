import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Spinner, Alert } from 'react-bootstrap';

const EditBusinessProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    phone: '',
    location: '',
    paymentPhone: '',
    paymentMethod: '',
    paymentEmail: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/businesses/profile`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });

        const {
          name,
          description,
          category,
          phone,
          location,
          paymentPhone,
          paymentMethod,
          paymentEmail,
        } = res.data;

        setFormData({
          name,
          description,
          category,
          phone,
          location,
          paymentPhone: paymentPhone || '',
          paymentMethod: paymentMethod || '',
          paymentEmail: paymentEmail || '',
        });
      } catch (err: any) {
        console.error(err);
        setError('Failed to load business profile.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token && user.role === 'business') {
      fetchProfile();
    } else {
      setError('Unauthorized access');
      setLoading(false);
    }
  }, [user, API_BASE_URL]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationAutoFill = () => {
    if (!navigator.geolocation) {
      return setError('Geolocation is not supported by your browser');
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const geoRes = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const address = geoRes.data?.display_name || '';
          setFormData((prev) => ({ ...prev, location: address }));
        } catch (err) {
          console.error(err);
          setError('Failed to auto-detect location');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Failed to get your location. Please allow permission.');
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await axios.patch(`${API_BASE_URL}/api/businesses/profile`, formData, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/business/dashboard'), 1500);
    } catch (err: any) {
      console.error(err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <h2 className="mb-4 text-center">Edit Business Profile</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Business Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Description</label>
          <textarea
            className="form-control"
            name="description"
            required
            rows={3}
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="mb-3">
          <label>Category</label>
          <input
            type="text"
            className="form-control"
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Phone Number</label>
          <input
            type="text"
            className="form-control"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>
            Location{' '}
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary ms-2"
              onClick={handleLocationAutoFill}
              disabled={locating}
            >
              {locating ? 'Detecting...' : 'Use My Location'}
            </button>
          </label>
          <input
            type="text"
            className="form-control"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <hr className="my-4" />
        <h5 className="mb-3">M-Pesa Payment Details</h5>

        <div className="mb-3">
          <label>M-Pesa Phone (e.g. 2547XXXXXXXX)</label>
          <input
            type="text"
            className="form-control"
            name="paymentPhone"
            value={formData.paymentPhone}
            onChange={handleChange}
            placeholder="2547XXXXXXXX"
          />
        </div>

        <div className="mb-3">
          <label>Payment Method</label>
          <input
            type="text"
            className="form-control"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            placeholder="e.g. MPESA, TILL"
          />
        </div>

        <div className="mb-3">
          <label>Payment Email (optional)</label>
          <input
            type="email"
            className="form-control"
            name="paymentEmail"
            value={formData.paymentEmail}
            onChange={handleChange}
            placeholder="For receipts or notifications"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditBusinessProfile;
