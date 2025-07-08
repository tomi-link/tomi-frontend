import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Modal,
  Form,
} from 'react-bootstrap';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number;
  category: string | null;
  imageUrl?: string | null;
  business?: {
    id?: string;
    name: string;
    location?: string;
    phone?: string;
  };
}

const categories = [
  'All',
  'Electronics and Accessories',
  'Beauty Products',
  'Food Products',
  'Fashion Products',
];

const Browse: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderNote, setOrderNote] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [chatMessage, setChatMessage] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products`);
        setProducts(res.data);
        setFilteredProducts(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [API_BASE_URL]);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter(
          (p) =>
            p.category?.toLowerCase() === selectedCategory.toLowerCase()
        )
      );
    }
  }, [selectedCategory, products]);

  const handleOrder = (product: Product) => {
    setSelectedProduct(product);
    setShowOrderModal(true);
  };

  const handleBook = (product: Product) => {
    setSelectedProduct(product);
    setShowBookingModal(true);
  };

  const handleChat = (product: Product) => {
    setSelectedProduct(product);
    setShowChatModal(true);
  };

  const handleAddFavorite = async (product: Product) => {
    if (!product.business?.id) {
      alert('No associated business found');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to favorite a business.');
        return;
      }

      await axios.post(
        `${API_BASE_URL}/api/favorites`,
        { businessId: product.business.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Added to favorites!');
    } catch (err) {
      console.error(err);
      alert('Failed to add to favorites.');
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedProduct || !selectedProduct.business?.id) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/orders`,
        {
          productId: selectedProduct.id,
          businessId: selectedProduct.business.id,
          note: orderNote,
          type: 'order',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Order placed successfully!');
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Failed to place order.');
    } finally {
      setShowOrderModal(false);
      setOrderNote('');
    }
  };

  const handleSubmitBooking = async () => {
    if (!selectedProduct || !selectedProduct.business?.id) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/orders`,
        {
          businessId: selectedProduct.business.id,
          productId: selectedProduct.id,
          bookingDate,
          type: 'booking',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Booking submitted successfully!');
    } catch (err) {
      console.error('Error booking service:', err);
      alert('Failed to submit booking.');
    } finally {
      setShowBookingModal(false);
      setBookingDate('');
    }
  };

  const handleSubmitChat = () => {
    alert(`Message sent to ${selectedProduct?.business?.name}: ${chatMessage}`);
    setShowChatModal(false);
    setChatMessage('');
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Browse Products & Services</h2>

      <div className="text-center mb-4">
        {categories.map((cat) => (
          <Button
            key={cat}
            className="me-2 mb-2"
            variant={selectedCategory === cat ? 'primary' : 'outline-primary'}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" />
          <p className="mt-2">Loading products...</p>
        </div>
      ) : error ? (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      ) : filteredProducts.length === 0 ? (
        <Alert variant="info" className="text-center">
          No products found in this category.
        </Alert>
      ) : (
        <Row>
          {filteredProducts.map((product) => (
            <Col key={product.id} md={4} sm={6} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Img
                  variant="top"
                  src={
                    product.imageUrl
                      ? `${API_BASE_URL}${product.imageUrl}`
                      : '/assets/images/placeholder.png'
                  }
                  alt={product.name}
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src =
                      '/assets/images/placeholder.png')
                  }
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text>
                    <strong>Category:</strong> {product.category || 'Uncategorized'} <br />
                    <strong>Price:</strong> KES {Number(product.price).toLocaleString()} <br />
                    <small className="text-muted">
                      {product.business?.name && `By: ${product.business.name}`}
                    </small>
                  </Card.Text>

                  <div className="d-grid gap-2">
                    <Button variant="outline-success" size="sm" onClick={() => handleOrder(product)}>Order</Button>
                    <Button variant="outline-warning" size="sm" onClick={() => handleBook(product)}>Book</Button>
                    <Button variant="outline-info" size="sm" onClick={() => handleChat(product)}>Call / Chat</Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleAddFavorite(product)}>❤️ Add to Favorites</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modals follow — unchanged, already functional */}
      {/* Order Modal */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Order {selectedProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Notes (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>Cancel</Button>
          <Button variant="success" onClick={handleSubmitOrder}>Place Order</Button>
        </Modal.Footer>
      </Modal>

      {/* Booking Modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Book {selectedProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Select Date & Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBookingModal(false)}>Cancel</Button>
          <Button variant="warning" onClick={handleSubmitBooking}>Confirm Booking</Button>
        </Modal.Footer>
      </Modal>

      {/* Chat Modal */}
      <Modal show={showChatModal} onHide={() => setShowChatModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chat with {selectedProduct?.business?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Type your message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChatModal(false)}>Close</Button>
          <Button variant="info" onClick={handleSubmitChat}>Send</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Browse;
