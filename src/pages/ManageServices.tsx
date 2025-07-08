import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  InputGroup,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";

interface Service {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  duration: number; // integer minutes
}

const categories = [
  "Electronics & Accessories",
  "Beauty Products",
  "Food Products",
  "Fashion Products",
  "Health & Wellness",
  "Home Services",
  "Education & Training",
  "Others",
];

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ManageServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentService, setCurrentService] = useState<Service | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    duration: "", // string input, converted to number on submit
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");

  const fetchServices = useCallback(async () => {
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }
    setLoading(true);
    let mounted = true;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/services/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Ensure price and duration are numbers:
      const servicesData: Service[] = res.data.map((s: any) => ({
        ...s,
        price: Number(s.price),
        duration: Number(s.duration),
      }));

      if (mounted) {
        setServices(servicesData);
        setError(null);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to fetch services.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      if (mounted) setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Validation for form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Service name is required";
    if (!form.category) errors.category = "Category is required";
    if (!form.price) errors.price = "Price is required";
    else if (isNaN(Number(form.price)) || Number(form.price) <= 0)
      errors.price = "Price must be a positive number";
    if (!form.duration) errors.duration = "Duration is required";
    else if (isNaN(Number(form.duration)) || Number(form.duration) <= 0)
      errors.duration = "Duration must be a positive number";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reset form state
  const resetForm = () => {
    setForm({ name: "", description: "", category: "", price: "", duration: "" });
    setFormErrors({});
    setCurrentService(null);
  };

  const handleShowAddModal = () => {
    resetForm();
    setModalMode("add");
    setShowModal(true);
  };

  const handleShowEditModal = (service: Service) => {
    setCurrentService(service);
    setForm({
      name: service.name,
      description: service.description || "",
      category: service.category,
      price: service.price.toString(),
      duration: service.duration.toString(),
    });
    setFormErrors({});
    setModalMode("edit");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      price: Number(form.price),
      duration: Number(form.duration), // integer minutes
    };

    try {
      setLoading(true);
      if (modalMode === "add") {
        await axios.post(`${API_BASE_URL}/api/services`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Service added successfully");
      } else if (modalMode === "edit" && currentService) {
        await axios.put(`${API_BASE_URL}/api/services/${currentService.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Service updated successfully");
      }
      fetchServices();
      handleCloseModal();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to save service. Please try again.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/api/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Service deleted successfully");
      fetchServices();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to delete service. Please try again.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container className="py-4">
      <h2 className="mb-4">Manage Services</h2>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      <Row className="mb-3 align-items-center">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Search services by name or category"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="text-md-end mt-2 mt-md-0">
          <Button onClick={handleShowAddModal} variant="primary">
            + Add New Service
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
          <div>Loading services...</div>
        </div>
      ) : filteredServices.length === 0 ? (
        <p className="text-center text-muted">No services found.</p>
      ) : (
        <Card className="shadow-sm">
          <Table responsive hover bordered>
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Price (KES)</th>
                <th>Duration</th>
                <th style={{ width: "140px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id}>
                  <td>{service.name}</td>
                  <td>{service.description || "-"}</td>
                  <td>{service.category}</td>
                  <td>{Number(service.price).toFixed(2)}</td>
                  <td>{service.duration} mins</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                      onClick={() => handleShowEditModal(service)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(service.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === "add" ? "Add New Service" : "Edit Service"}</Modal.Title>
        </Modal.Header>
        <Form noValidate onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="serviceName">
              <Form.Label>Service Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter service name"
                name="name"
                value={form.name}
                onChange={handleChange}
                isInvalid={!!formErrors.name}
                required
              />
              <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="serviceDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Optional description"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="serviceCategory">
              <Form.Label>Category *</Form.Label>
              <Form.Select
                name="category"
                value={form.category}
                onChange={handleChange}
                isInvalid={!!formErrors.category}
                required
              >
                <option value="">-- Select category --</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{formErrors.category}</Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="servicePrice">
                  <Form.Label>Price (KES) *</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="e.g. 500"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    isInvalid={!!formErrors.price}
                    min={0}
                    step={0.01}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.price}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="serviceDuration">
                  <Form.Label>Duration (minutes) *</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="e.g. 30"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    isInvalid={!!formErrors.duration}
                    min={1}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.duration}</Form.Control.Feedback>
                  <Form.Text className="text-muted">Duration in minutes</Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Saving...
                </>
              ) : modalMode === "add" ? (
                "Add Service"
              ) : (
                "Save Changes"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ManageServices;
