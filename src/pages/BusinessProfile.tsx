import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Spinner,
  Alert,
  Card,
  Row,
  Col,
  Badge,
  Form,
  Button,
} from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  phone: string;
  location: string;
  latitude?: number;
  longitude?: number;
  paymentNumber?: string;
  paymentMethod?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  description: string;
  category: string;
}

const BusinessProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const businessRes = await axios.get(`${API_BASE_URL}/api/businesses/${id}`);
        setBusiness(businessRes.data);

        const productRes = await axios.get(`${API_BASE_URL}/api/products?businessId=${id}`);
        setProducts(productRes.data);
        setFilteredProducts(productRes.data);
      } catch (err) {
        console.error(err);
        setError('Unable to load business profile or products.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    const keyword = search.trim().toLowerCase();
    if (keyword === '') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((p) =>
          p.name.toLowerCase().includes(keyword) ||
          p.description.toLowerCase().includes(keyword)
        )
      );
    }
  }, [search, products]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading business profile...</p>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">{error || 'Business not found.'}</Alert>
      </div>
    );
  }

  const position = [
    business.latitude || -0.5406,
    business.longitude || 36.9607,
  ];

  return (
    <div className="container py-4">
      {/* Business Info */}
      <Card className="mb-4 p-4 shadow-sm">
        <div>
          <h2 className="fw-bold">{business.name}</h2>
          <p className="text-muted">{business.description}</p>
          <Badge bg="info" className="mb-2">{business.category}</Badge>
          <p><i className="bi bi-geo-alt"></i> {business.location}</p>
          <p><i className="bi bi-telephone"></i> {business.phone}</p>

          {/* ✅ Display Payment Info */}
          {business.paymentNumber && (
            <p className="mt-2">
              <i className="bi bi-credit-card"></i>{" "}
              <strong>Pay via {business.paymentMethod?.toUpperCase() || "M-PESA"}:</strong>{" "}
              <span className="text-success">{business.paymentNumber}</span>
            </p>
          )}

          <div className="d-flex gap-2 mt-2">
            <Button
              variant="success"
              size="sm"
              onClick={() => window.location.href = `tel:${business.phone}`}
            >
              Call Now
            </Button>
            <Button
              variant="outline-success"
              size="sm"
              onClick={() =>
                window.open(
                  `https://wa.me/${business.phone.replace(/\D/g, '')}`,
                  '_blank'
                )
              }
            >
              WhatsApp
            </Button>
          </div>
        </div>
      </Card>

      {/* Search Bar */}
      <Form className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Form>

      {/* Products */}
      <Card className="mb-4 shadow-sm p-3">
        <h4 className="mb-3">Products</h4>
        {filteredProducts.length === 0 ? (
          <p>No products match your search.</p>
        ) : (
          <Row xs={2} md={4} className="g-3">
            {filteredProducts.map((product) => (
              <Col key={product.id}>
                <Card className="h-100">
                  <Card.Img
                    variant="top"
                    src={
                      product.imageUrl
                        ? `${API_BASE_URL}${product.imageUrl.startsWith('/') ? '' : '/'}${product.imageUrl}`
                        : 'https://via.placeholder.com/300x200?text=No+Image'
                    }
                    style={{ height: '160px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Title className="text-truncate">{product.name}</Card.Title>
                    <Card.Text className="text-muted small">
                      {product.description?.substring(0, 60)}...
                    </Card.Text>
                    <Badge bg="secondary" className="mb-2">{product.category}</Badge>
                    <h6 className="text-primary">KES {product.price.toLocaleString()}</h6>
                    <Link
                      to={`/product/${product.id}`}
                      className="btn btn-primary btn-sm w-100"
                    >
                      View Product
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Map */}
      <Card className="mb-4 shadow-sm p-3">
        <h4 className="mb-3">Location</h4>
        <div style={{ height: '300px' }}>
          <MapContainer
            center={position as [number, number]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={position as [number, number]}>
              <Popup>{business.name}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </Card>
    </div>
  );
};

export default BusinessProfile;
