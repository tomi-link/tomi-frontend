import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  // Get user info from localStorage or fallback
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Compute dashboard path based on user role
  const getDashboardPath = () => {
    if (!user || !user.role) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'business':
        return '/business/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/dashboard';
    }
  };

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(getDashboardPath());
  };

  return (
    <footer
      className="pt-5 pb-3 mt-auto text-white"
      style={{
        background: 'linear-gradient(to right, #0d0d0d, #1a1a1a)',
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '0.95rem',
      }}
    >
      <div className="container text-center text-md-start">
        <div className="row">

          {/* Branding */}
          <div className="col-md-4 mb-4">
            <h4 className="fw-bold text-white">TomiLink</h4>
            <p className="text-light small">
              Connecting Karatina University students with trusted local businesses.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-semibold text-white">Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-light text-decoration-none">Home</Link></li>
              <li><Link to="/browse" className="text-light text-decoration-none">Browse</Link></li>
              {/* Dashboard as a button to handle dynamic routing */}
              <li>
                <a href="/dashboard" className="text-light text-decoration-none" onClick={handleDashboardClick}>
                  Dashboard
                </a>
              </li>
              {/* Replace Contact link with direct contact info below */}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-semibold text-white">Contact Us</h5>
            <p>Email: <a href="mailto:youremail@example.com" className="text-light">icttom608@gmail.com</a></p>
            <p>Phone: <a href="tel:+254700000000" className="text-light">+254 723487051</a></p>
            <p>Address: Karatina, Kenya</p>
            <p>You can reach us via email or phone during business hours (Mon-Sun, 7am-9pm).</p>
          </div>
        </div>

        {/* Social Media */}
        <div className="d-flex gap-3 justify-content-center justify-content-md-start mb-3">
          <a
            href="https://facebook.com/tomilink"
            target="_blank"
            rel="noopener noreferrer"
            className="text-light fs-5"
          ><FaFacebookF /></a>
          <a
            href="https://twitter.com/tomilink"
            target="_blank"
            rel="noopener noreferrer"
            className="text-light fs-5"
          ><FaTwitter /></a>
          <a
            href="https://instagram.com/tomilink"
            target="_blank"
            rel="noopener noreferrer"
            className="text-light fs-5"
          ><FaInstagram /></a>
          <a
            href="https://linkedin.com/company/tomilink"
            target="_blank"
            rel="noopener noreferrer"
            className="text-light fs-5"
          ><FaLinkedin /></a>
        </div>

        <hr className="border-secondary" />
        <div className="text-center small text-secondary">
          &copy; {new Date().getFullYear()} <strong className="text-light">TomiLink</strong>. All rights reserved. | Designed for Karatina University.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
