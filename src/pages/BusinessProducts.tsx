import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number;
  imageUrl?: string;
  category: string;
}

const BusinessProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const navigate = useNavigate();

  const fetchProducts = async () => {
    const token =
      localStorage.getItem('token') ||
      JSON.parse(localStorage.getItem('user') || '{}').token;

    if (!token) {
      setError('You must be logged in');
      navigate('/login');
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/api/products/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [navigate, API_BASE_URL]);

  const handleDelete = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    const token =
      localStorage.getItem('token') ||
      JSON.parse(localStorage.getItem('user') || '{}').token;

    try {
      await axios.delete(`${API_BASE_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading your products...</p>
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

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>My Products</h3>
        <Button variant="primary" onClick={() => navigate('/business/products/add')}>
          + Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <Alert variant="info">You haven't added any products yet.</Alert>
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
                  style={{ objectFit: 'cover', height: '200px' }}
                />
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text>
                    <strong>Category:</strong> {product.category} <br />
                    <strong>Price:</strong> KES {Number(product.price).toFixed(2)} <br />
                    <span>{product.description}</span>
                  </Card.Text>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => navigate(`/business/products/edit/${product.id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default BusinessProducts;
