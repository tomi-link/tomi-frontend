import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: "student" | "business" | "admin";
  phone?: string;
  createdAt: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
        <Spinner animation="border" />
      </div>
    );
  }

  if (!user) {
    return (
      <Container className="text-center mt-5">
        <h4>Unable to load profile. Please try again later.</h4>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">My Profile</h4>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col sm={4}><strong>Name:</strong></Col>
                <Col sm={8}>{user.name}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4}><strong>Email:</strong></Col>
                <Col sm={8}>{user.email}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4}><strong>Role:</strong></Col>
                <Col sm={8}>{user.role}</Col>
              </Row>
              {user.phone && (
                <Row className="mb-3">
                  <Col sm={4}><strong>Phone:</strong></Col>
                  <Col sm={8}>{user.phone}</Col>
                </Row>
              )}
              <Row className="mb-3">
                <Col sm={4}><strong>Member Since:</strong></Col>
                <Col sm={8}>{new Date(user.createdAt).toLocaleDateString()}</Col>
              </Row>
              <div className="text-end">
                <Button variant="outline-primary" onClick={() => alert("Edit profile feature coming soon!")}>
                  Edit Profile
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
