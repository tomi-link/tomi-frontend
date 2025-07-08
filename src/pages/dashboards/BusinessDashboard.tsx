import { useEffect, useState, type ChangeEvent } from 'react';
import {
  Card,
  Button,
  Spinner,
  Modal,
  Table,
  Alert,
  ListGroup,
  Image,
  Form,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Order {
  id: number;
  clientName: string;
  item: string;
  status: string;
  total: number;
  createdAt: string;
}

interface Business {
  id: number;
  name: string;
  category: string;
  location: string;
  phone: string;
  profileImage?: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
}

const BusinessDashboard = () => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrders, setShowOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchBusinessData = async (token: string) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const res = await axios.get(`${API_BASE_URL}/api/businesses/profile`, config);
      setBusiness(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        try {
          const defaultProfile = {
            name: 'My Business',
            category: 'General',
            location: 'Unknown',
            phone: 'N/A',
          };
          await axios.post(`${API_BASE_URL}/api/businesses`, defaultProfile, config);
          const retryRes = await axios.get(`${API_BASE_URL}/api/businesses/profile`, config);
          setBusiness(retryRes.data);
        } catch (createErr) {
          console.error('Failed to create default profile', createErr);
          setError('Failed to create business profile.');
        }
      } else {
        console.error('Error fetching business profile:', err);
        setError('Failed to load business profile.');
      }
    }
  };

  const fetchOrders = async (token: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/orders/business`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(Array.isArray(res.data) ? res.data : res.data?.orders || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchServices = async (token: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/services/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(res.data);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to view this page.');
        setLoading(false);
        navigate('/login');
        return;
      }
      try {
        await Promise.all([
          fetchBusinessData(token),
          fetchOrders(token),
          fetchServices(token),
        ]);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.clear();
          navigate('/login');
        } else {
          setError('Failed to load business dashboard data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, API_BASE_URL]);

  const handleProfileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('profileImage', file);

      const res = await axios.post(`${API_BASE_URL}/api/uploads/profile-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setBusiness((prev) => prev ? { ...prev, profileImage: res.data.path } : prev);
    } catch (err) {
      console.error('Profile image upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container mt-5">
        <Alert variant="warning">Business profile not found.</Alert>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const deliveredCount = orders.filter(
    (o) => o.status?.toLowerCase() === 'delivered'
  ).length;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Welcome, {business.name}</h2>
          <p className="text-muted">Your business overview</p>
        </div>
        <div className="text-end">
          <Image
            src={
              business.profileImage
                ? `${API_BASE_URL}/${business.profileImage}`
                : '/assets/images/placeholder.png'
            }
            roundedCircle
            width={80}
            height={80}
            className="mb-2 border"
            alt="Profile"
          />
          <Form.Group controlId="uploadProfileBiz">
            <Form.Label className="btn btn-sm btn-outline-secondary">
              {uploading ? 'Uploading...' : 'Upload Photo'}
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleProfileUpload}
                style={{ display: 'none' }}
              />
            </Form.Label>
          </Form.Group>
          <div>
            <Link to={`/business/${business.id}`} className="btn btn-outline-info btn-sm">
              View Public Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>My Profile</Card.Title>
              <Card.Text>
                <strong>Category:</strong> {business.category} <br />
                <strong>Location:</strong> {business.location} <br />
                <strong>Phone:</strong> {business.phone}
              </Card.Text>
              <Link to="/business/edit-profile" className="btn btn-outline-primary btn-sm">
                Edit Profile
              </Link>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Orders</Card.Title>
              <Card.Text>
                You have <strong>{orders.length}</strong> orders.
              </Card.Text>
              <Button variant="outline-success" size="sm" onClick={() => setShowOrders(true)}>
                View Orders
              </Button>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Chat with Clients</Card.Title>
              <Card.Text>
                Stay connected with your clients and respond to inquiries.
              </Card.Text>
              <Link to="/chat" className="btn btn-outline-secondary btn-sm">
                Open Chat
              </Link>
            </Card.Body>
          </Card>
        </div>
      </div>

      <div className="row g-4 mt-4">
        <div className="col-md-6">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Performance Overview</Card.Title>
              <div className="row text-center mt-3">
                <div className="col">
                  <h5>{orders.length}</h5>
                  <p>Orders Received</p>
                </div>
                <div className="col">
                  <h5>KES {totalRevenue.toFixed(2)}</h5>
                  <p>Total Revenue</p>
                </div>
                <div className="col">
                  <h5>{deliveredCount}</h5>
                  <p>Delivered</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-6">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>My Services</Card.Title>
              {services.length === 0 ? (
                <p className="text-muted">No services added yet.</p>
              ) : (
                <ListGroup variant="flush">
                  {services.map((s) => (
                    <ListGroup.Item key={s.id}>
                      <strong>{s.name}</strong> - {s.category} - KES {s.price.toLocaleString()}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
              <div className="mt-3">
                <Link to="/business/services" className="btn btn-outline-success btn-sm">
                  Manage Services
                </Link>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Modal show={showOrders} onHide={() => setShowOrders(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Orders</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Client</th>
                  <th>Item</th>
                  <th>Status</th>
                  <th>Total (KES)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr key={order.id}>
                    <td>{idx + 1}</td>
                    <td>{order.clientName || 'N/A'}</td>
                    <td>{order.item || 'N/A'}</td>
                    <td>{order.status || 'Pending'}</td>
                    <td>{order.total?.toFixed(2) || '0.00'}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default BusinessDashboard;
