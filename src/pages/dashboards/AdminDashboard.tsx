import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import {
  Card, Button, Spinner, Table, Alert, Form, InputGroup, Tab, Tabs, Modal,
} from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const [userGrowthData, setUserGrowthData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [editUserModal, setEditUserModal] = useState(false);
  const [viewBusinessModal, setViewBusinessModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = user?.token;

  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, businessesRes, paymentsRes, adminsRes, logsRes] = await Promise.all([
          axios.get('/api/admin/stats', headers),
          axios.get('/api/admin/users', headers),
          axios.get('/api/admin/businesses', headers),
          axios.get('/api/admin/payments', headers),
          axios.get('/api/admin/admins', headers),
          axios.get('/api/admin/logs', headers),
        ]);

        setStats(statsRes.data);
        setUsers(usersRes.data);
        setBusinesses(businessesRes.data);
        setPayments(paymentsRes.data);
        setAdmins(adminsRes.data);
        setLogs(logsRes.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load admin dashboard data. Please check if you are logged in as an admin.');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const handleUserAction = async (id: string, action: string) => {
    try {
      await axios.put(`/api/admin/users/${id}/${action}`, {}, headers);
      setSuccess(`User ${action}ed successfully`);
      setUsers((prev) =>
        prev.map((u) => u.id === id ? { ...u, status: action === 'resume' ? 'active' : action } : u)
      );
    } catch (err) {
      console.error(err);
      setError(`Failed to ${action} user.`);
    }
  };

  const handleBusinessAction = async (id: string, action: string) => {
    try {
      if (action === 'delete') {
        await axios.delete(`/api/admin/businesses/${id}`, headers);
        setBusinesses((prev) => prev.filter((b) => b.id !== id));
      } else {
        await axios.put(`/api/admin/businesses/${id}/${action}`, {}, headers);
        setBusinesses((prev) =>
          prev.map((b) => b.id === id ? { ...b, status: action === 'resume' ? 'Approved' : action } : b)
        );
      }
      setSuccess(`Business ${action}ed successfully`);
    } catch (err) {
      console.error(err);
      setError(`Failed to ${action} business.`);
    }
  };

  const handleViewBusiness = async (id: string) => {
    try {
      const res = await axios.get(`/api/admin/businesses/${id}`, headers);
      setSelectedBusiness(res.data);
      setViewBusinessModal(true);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch business details.');
    }
  };

  const handleEditUser = async (id: string) => {
    try {
      const res = await axios.get(`/api/admin/users/${id}`, headers);
      setSelectedUser(res.data);
      setEditUserModal(true);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch user details.');
    }
  };

  const handleApproveUser = async (id: string) => {
    try {
      await axios.put(`/api/admin/users/${id}/resume`, {}, headers);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: 'active' } : u));
      setSuccess('User approved successfully');
    } catch (err) {
      console.error(err);
      setError('Failed to approve user.');
    }
  };

  const handleRejectUser = async (id: string) => {
    try {
      await axios.put(`/api/admin/users/${id}/ban`, {}, headers);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: 'banned' } : u));
      setSuccess('User rejected successfully');
    } catch (err) {
      console.error(err);
      setError('Failed to reject user.');
    }
  };

  const filteredUsers = roleFilter === 'all' ? users : users.filter((u) => u.role === roleFilter);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Tabs defaultActiveKey="businesses" className="mb-4">
        <Tab eventKey="businesses" title="Business Management">
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Products</th>
                <th>Services</th>
                <th>Orders</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {businesses.filter((b) =>
                b.name.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((b) => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td>{b.category}</td>
                  <td>{b.status}</td>
                  <td>{b.productCount}</td>
                  <td>{b.serviceCount}</td>
                  <td>{b.orderCount}</td>
                  <td>
                    <Button size="sm" variant="success" className="me-2" onClick={() => handleBusinessAction(b.id, 'approve')}>Approve</Button>
                    <Button size="sm" variant="info" className="me-2" onClick={() => handleViewBusiness(b.id)}>View</Button>
                    <Button size="sm" variant="warning" className="me-2" onClick={() => handleBusinessAction(b.id, 'suspend')}>Suspend</Button>
                    <Button size="sm" variant="danger" onClick={() => handleBusinessAction(b.id, 'delete')}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>

        <Tab eventKey="users" title="User Management">
          <Form.Select
            className="mb-3"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="client">Client</option>
            <option value="business">Business</option>
            <option value="admin">Admin</option>
          </Form.Select>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.status}</td>
                  <td>
                    <Button size="sm" variant="success" className="me-2" onClick={() => handleApproveUser(u.id)}>Approve</Button>
                    <Button size="sm" variant="danger" className="me-2" onClick={() => handleRejectUser(u.id)}>Reject</Button>
                    <Button size="sm" variant="primary" onClick={() => handleEditUser(u.id)}>Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>

        <Tab eventKey="moderation" title="Product & Service Moderation">
          <p>List of new or reported products/services pending review...</p>
        </Tab>

        <Tab eventKey="payments" title="Payments & Revenue">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Business</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{p.businessName}</td>
                  <td>Ksh {p.amount.toLocaleString()}</td>
                  <td>{new Date(p.date).toLocaleDateString()}</td>
                  <td>{p.method}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>

        <Tab eventKey="tools" title="Admin Tools">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Admin</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td>{a.email}</td>
                  <td>{a.role}</td>
                  <td>
                    <Button size="sm" variant="outline-primary">Edit</Button>{' '}
                    <Button size="sm" variant="outline-danger">Remove</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <h5 className="mt-4">Login History / Audit Logs</h5>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.user}</td>
                  <td>{log.action}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
      </Tabs>

      {/* View Business Modal */}
      <Modal show={viewBusinessModal} onHide={() => setViewBusinessModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Business Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBusiness ? (
            <>
              <p><strong>Name:</strong> {selectedBusiness.name}</p>
              <p><strong>Category:</strong> {selectedBusiness.category}</p>
              <p><strong>Location:</strong> {selectedBusiness.location}</p>
              <p><strong>Status:</strong> {selectedBusiness.status}</p>
              <p><strong>Approved:</strong> {selectedBusiness.isApproved ? 'Yes' : 'No'}</p>
            </>
          ) : <p>Loading...</p>}
        </Modal.Body>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={editUserModal} onHide={() => setEditUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser ? (
            <Form>
              <Form.Group controlId="editUserName" className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control type="text" value={selectedUser.fullName} readOnly />
              </Form.Group>
              <Form.Group controlId="editUserEmail" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={selectedUser.email} readOnly />
              </Form.Group>
              <Form.Group controlId="editUserStatus" className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Control type="text" value={selectedUser.status} readOnly />
              </Form.Group>
            </Form>
          ) : <p>Loading...</p>}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
