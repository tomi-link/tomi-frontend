import { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Pagination,
  Modal,
} from 'react-bootstrap';
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface Service {
  id: string;
  name: string;
  category: string;
  business: { id: string; name: string };
}

const BusinessServices: React.FC = () => {
  const { id: businessIdParam } = useParams<{ id: string }>();

  const [services, setServices] = useState<Service[]>([]);
  const [filtered, setFiltered] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const itemsPerPage = 6;
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const categoryIcons: Record<string, string> = {
    'Electronics & Accessories': '💻',
    'Beauty Products': '💄',
    'Food Products': '🍔',
    'Fashion Products': '👗',
  };

  const categoryList = useMemo(() => Object.keys(categoryIcons), []);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/services`);
        let data: Service[] = res.data;

        if (businessIdParam) {
          data = data.filter((s) => s.business.id === businessIdParam);
        }

        setServices(data);
        setFiltered(data);
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [API_BASE_URL, businessIdParam]);

  // Filtering logic
  useEffect(() => {
    let result = [...services];

    if (search.trim()) {
      result = result.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((s) => s.category === selectedCategory);
    }

    if (selectedBusiness !== 'all') {
      result = result.filter((s) => s.business.name === selectedBusiness);
    }

    setFiltered(result);
    setCurrentPage(1);
  }, [search, selectedCategory, selectedBusiness, services]);

  // Pagination data
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const uniqueBusinesses = useMemo(
    () => Array.from(new Set(services.map((s) => s.business.name))),
    [services]
  );

  // Booking
  const handleBookNow = (service: Service) => {
    setSelectedService(service);
    setShowModal(true);
  };

  const handleConfirmBooking = async () => {
    try {
      if (!selectedService) return;

      const token = localStorage.getItem('token');
      if (!token) {
        alert('Login required to book a service');
        return;
      }

      setBookingLoading(true);

      const payload = {
        type: 'booking',
        serviceId: selectedService.id,
        businessId: selectedService.business.id,
      };

      await axios.post(`${API_BASE_URL}/api/orders`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('✅ Service booked successfully!');
      setShowModal(false);
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Failed to book service';
      console.error('Booking error:', error);
      alert(`❌ ${message}`);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <h3 className="fw-bold mb-4">Services Offered</h3>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={3} className="mb-2">
          <Form.Control
            type="text"
            placeholder="Search by service name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col md={3} className="mb-2">
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categoryList.map((cat) => (
              <option key={cat} value={cat}>
                {categoryIcons[cat]} {cat}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3} className="mb-2">
          <Form.Select
            value={selectedBusiness}
            onChange={(e) => setSelectedBusiness(e.target.value)}
          >
            <option value="all">All Businesses</option>
            {uniqueBusinesses.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3} className="mb-2">
          <Button
            variant="outline-secondary"
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
              setSelectedBusiness('all');
            }}
          >
            Clear Filters
          </Button>
        </Col>
      </Row>

      {/* Content */}
      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted">No services found.</p>
      ) : (
        <>
          <Row>
            {paginated.map((s) => (
              <Col md={4} key={s.id} className="mb-3">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <h5 className="fw-bold">{s.name}</h5>
                    <p className="text-muted mb-1">
                      {categoryIcons[s.category] || '📦'} {s.category}
                    </p>
                    <p className="small text-muted mb-3">
                      Business: {s.business.name}
                    </p>
                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={() => handleBookNow(s)}
                    >
                      Book Now
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() =>
                    setCurrentPage((p) => Math.max(p - 1, 1))
                  }
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages)].map((_, idx) => (
                  <Pagination.Item
                    key={idx}
                    active={currentPage === idx + 1}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Booking Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedService && (
            <p>
              Book <strong>{selectedService.name}</strong> from{' '}
              <strong>{selectedService.business.name}</strong>?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={bookingLoading}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleConfirmBooking}
            disabled={bookingLoading}
          >
            {bookingLoading ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BusinessServices;
