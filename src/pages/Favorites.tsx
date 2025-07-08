import React, { useEffect, useState } from 'react';
import { Card, Button, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  image_url?: string; // ✅ handle snake_case
  businessId: string;
}

interface FavoriteBusiness {
  id: string;
  name: string;
  category: string;
  imageUrl?: string | null;
  image_url?: string | null; // ✅ handle snake_case
  products?: Product[];
}

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteBusiness[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFavorites(res.data);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
      setError('Unable to load favorite businesses.');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (businessId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/favorites/${businessId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFavorites((prev) => prev.filter((biz) => biz.id !== businessId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      alert('Failed to remove from favorites.');
    }
  };

  const handleViewProfile = (businessId: string) => {
    navigate(`/business-profile/${businessId}`);
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Your Favorite Businesses</h2>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
          <p className="mt-2">Loading favorites...</p>
        </div>
      ) : error ? (
        <Alert variant="danger" className="text-center">{error}</Alert>
      ) : favorites.length === 0 ? (
        <p className="text-muted text-center">
          You haven’t added any favorite businesses yet.
        </p>
      ) : (
        <Row xs={1} sm={2} md={3} className="g-4">
          {favorites.map((biz) => {
            const product = biz.products?.[0];
            const productImage = product?.imageUrl || product?.image_url;
            const businessImage = biz.imageUrl || biz.image_url;

            const imageSrc = productImage
              ? productImage.startsWith('/uploads')
                ? `${API_BASE_URL}${productImage}`
                : productImage
              : businessImage || '/assets/images/placeholder.png';

            const businessIdToUse = product?.businessId || biz.id;

            return (
              <Col key={biz.id}>
                <Card className="h-100 shadow-sm border-0">
                  <Card.Img
                    variant="top"
                    src={imageSrc}
                    alt={biz.name}
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src = '/assets/images/placeholder.png')
                    }
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Title className="fw-bold">{biz.name}</Card.Title>
                    <Card.Text className="text-muted">
                      {biz.category} <br />
                      {product?.name && (
                        <span><strong>Latest Product:</strong> {product.name}</span>
                      )}
                    </Card.Text>
                    <div className="d-flex justify-content-between">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleViewProfile(businessIdToUse)}
                      >
                        View Profile
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeFavorite(biz.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default Favorites;
