import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Spinner,
  Alert,
  Container,
  Row,
  Col,
  Image,
  Button,
  Badge,
  Card,
} from 'react-bootstrap';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error('Failed to load product:', err);
        setError('Product not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate('/products')}>
          ← Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col md={6} className="text-center mb-4">
          <Image
            src={
              product.imageUrl
                ? `${API_BASE_URL}${product.imageUrl}`
                : '/assets/images/placeholder.png'
            }
            alt={product.name}
            fluid
            rounded
            style={{ maxHeight: '400px', objectFit: 'cover' }}
          />
        </Col>

        <Col md={6}>
          <h2>{product.name}</h2>
          <Badge bg="info" className="mb-2">{product.category}</Badge>
          <h4 className="text-success">
            KES {product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h4>

          <p className="mt-3 text-muted small">
            Posted on {new Date(product.createdAt).toLocaleDateString()}
          </p>

          <p>{product.description}</p>

          <div className="d-flex gap-2 mt-4">
            <Button variant="primary" size="lg">
              Buy Now
            </Button>
            <Button variant="outline-secondary" size="lg">
              Add to Cart
            </Button>
          </div>
        </Col>
      </Row>

      <Card className="mt-5 p-4 shadow-sm">
        <h4>Similar Products (Coming Soon)</h4>
        <p className="text-muted">
          We will show related items here based on category and price range.
        </p>
      </Card>
    </Container>
  );
};

export default ProductDetail;
