import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  Spinner,
  Alert,
  ButtonGroup,
  ToggleButton,
} from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface OrderOrBooking {
  id: string;
  type: 'order' | 'booking';
  note?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  bookingDate?: string | null;
  createdAt: string;
  orderBusiness: {
    id: string;
    name: string;
  };
  product?: {
    id: string;
    name: string;
  };
  service?: {
    id: string;
    name: string;
    category?: string;
  } | null;
}

const Orders: React.FC = () => {
  const [items, setItems] = useState<OrderOrBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'order' | 'booking'>('all');

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('User not logged in');

        const res = await axios.get(`${API_BASE_URL}/api/orders/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setItems(res.data);
      } catch (err: any) {
        setError(
          err.response?.data?.error ||
          err.message ||
          'Failed to load orders'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [API_BASE_URL]);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const filteredItems =
    filter === 'all' ? items : items.filter((i) => i.type === filter);

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">My Orders & Bookings</h2>

      <div className="d-flex justify-content-center mb-3">
        <ButtonGroup>
          <ToggleButton
            id="all"
            type="radio"
            variant="outline-dark"
            name="filter"
            value="all"
            checked={filter === 'all'}
            onChange={() => setFilter('all')}
          >
            All
          </ToggleButton>
          <ToggleButton
            id="order"
            type="radio"
            variant="outline-dark"
            name="filter"
            value="order"
            checked={filter === 'order'}
            onChange={() => setFilter('order')}
          >
            Orders
          </ToggleButton>
          <ToggleButton
            id="booking"
            type="radio"
            variant="outline-dark"
            name="filter"
            value="booking"
            checked={filter === 'booking'}
            onChange={() => setFilter('booking')}
          >
            Bookings
          </ToggleButton>
        </ButtonGroup>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : filteredItems.length === 0 ? (
        <Alert variant="info">
          No {filter === 'all' ? '' : filter} items found.
        </Alert>
      ) : (
        filteredItems.map((item) => {
          const itemName =
            item.type === 'order'
              ? item.product?.name || 'Product'
              : item.service?.name || 'Service';

          const dateRaw =
            item.type === 'booking' ? item.bookingDate : item.createdAt;

          const dateFormatted = dateRaw
            ? new Date(dateRaw).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })
            : 'N/A';

          return (
            <Card key={item.id} className="mb-3 shadow-sm">
              <Card.Body>
                <Card.Title>{item.orderBusiness?.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {itemName}{' '}
                  ({item.type === 'order' ? 'Product Order' : 'Service Booking'})
                </Card.Subtitle>
                <Card.Text>
                  <strong>Date:</strong> {dateFormatted} <br />
                  <strong>Status:</strong>{' '}
                  <span className={`badge bg-${getStatusVariant(item.status)}`}>
                    {item.status}
                  </span>
                </Card.Text>
                {item.type === 'order' && item.status === 'pending' && (
                  <Link
                    to={`/payment?orderId=${item.id}`}
                    className="btn btn-warning btn-sm mt-2"
                  >
                    Pay Now
                  </Link>
                )}
              </Card.Body>
            </Card>
          );
        })
      )}
    </Container>
  );
};

export default Orders;
