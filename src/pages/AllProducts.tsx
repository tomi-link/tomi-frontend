import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  Row,
  Col,
  Spinner,
  Alert,
  Container,
  Button,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number;
  category: string;
  imageUrl?: string;
  business?: {
    name: string;
    location?: string;
  };
}

const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products`);
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [API_BASE_URL]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h3 className="mb-4">Available Products & Services</h3>

      {products.length === 0 ? (
        <Alert variant="info">No products found.</Alert>
      ) : (
        <Row>
          {products.map((product) => (
            <Col md={4} key={product.id} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Img
                  variant="top"
                  src={
                    product.imageUrl
                      ? `${API_BASE_URL}${product.imageUrl}`
                      : '/assets/images/placeholder.png'
                  }
                  alt={product.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      '/assets/images/placeholder.png';
                  }}
                  style={{ objectFit: 'cover', height: '200px' }}
                />
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text>
                    <strong>Category:</strong> {product.category} <br />
                    <strong>Price:</strong> KES{' '}
                    {Number(product.price).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}{' '}
                    <br />
                    <small className="text-muted">
                      By: {product.business?.name || 'Unknown'}
                    </small>
                  </Card.Text>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/products/${product.id}`)} // ✅ Correct route
                  >
                    View
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default AllProducts;
