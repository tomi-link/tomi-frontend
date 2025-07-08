import { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Spinner,
  Badge,
  ButtonGroup,
} from 'react-bootstrap';
import {
  FaShoppingCart,
  FaHeart,
  FaComments,
  FaStore,
} from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Order {
  id: string;
  orderBusiness: { id: string; name: string };
  createdAt: string;
  status: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  business: { id: string; name: string };
}

interface BusinessSummary {
  id: string;
  name: string;
  categories: string[];
  count: number;
}

interface Service {
  id: string;
  name: string;
  category: string;
  business: { id: string; name: string };
}

const ClientDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [popularBusinesses, setPopularBusinesses] = useState<BusinessSummary[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const categoryIcons: Record<string, string> = {
    'Electronics & Accessories': '💻',
    'Beauty Products': '💄',
    'Food Products': '🍔',
    'Fashion Products': '👗',
  };

  const categoryList = Object.keys(categoryIcons);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const ordersRes = await axios.get(`${API_BASE_URL}/api/orders/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecentOrders(ordersRes.data.slice(0, 5));

        const productsRes = await axios.get(`${API_BASE_URL}/api/products`);
        const products: Product[] = productsRes.data;

        const servicesRes = await axios.get(`${API_BASE_URL}/api/services`);
        setServices(servicesRes.data);

        const bizMap: Record<string, BusinessSummary> = {};
        products.forEach((p) => {
          const b = p.business;
          if (!bizMap[b.id]) {
            bizMap[b.id] = {
              id: b.id,
              name: b.name,
              categories: [],
              count: 0,
            };
          }
          if (!bizMap[b.id].categories.includes(p.category)) {
            bizMap[b.id].categories.push(p.category);
          }
          bizMap[b.id].count += 1;
        });

        const popular = Object.values(bizMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setPopularBusinesses(popular);
      } catch (err) {
        console.error('Dashboard load failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [API_BASE_URL]);

  const filteredBusinesses =
    categoryFilter === 'all'
      ? popularBusinesses
      : popularBusinesses.filter((b) =>
          b.categories.includes(categoryFilter)
        );

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <div>Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <h3 className="mb-4 fw-bold">Hello 👋</h3>
      <p className="text-muted">Here’s a summary of your recent activity</p>

      {/* Summary Cards */}
      <Row className="mb-4">
        {[
          { icon: FaShoppingCart, label: 'Orders', to: '/orders' },
          { icon: FaHeart, label: 'Favorites', to: '/favorites' },
          { icon: FaComments, label: 'Messages', to: '/chat' },
          { icon: FaStore, label: 'Explore', to: '/browse' },
        ].map(({ icon: Icon, label, to }) => (
          <Col md={3} sm={6} className="mb-3" key={label}>
            <Card
              className="shadow-sm text-center h-100 border-0"
              onClick={() => navigate(to)}
              style={{ cursor: 'pointer' }}
            >
              <Card.Body>
                <Icon size={30} className="mb-2" />
                <h5 className="fw-bold">{label}</h5>
                <p className="text-muted mb-0">{label}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Orders */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-white fw-bold border-bottom">
          Recent Orders
        </Card.Header>
        <Card.Body>
          {recentOrders.length === 0 ? (
            <p className="text-muted">You have no recent orders.</p>
          ) : (
            <Table responsive bordered hover>
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Business</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => navigate('/orders')}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{o.id}</td>
                    <td>{o.orderBusiness.name}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Badge bg="info">
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Category Filters */}
      <div className="mb-3 text-center">
        <ButtonGroup>
          <Button
            variant={categoryFilter === 'all' ? 'primary' : 'outline-primary'}
            onClick={() => setCategoryFilter('all')}
          >
            All
          </Button>
          {categoryList.map((cat) => (
            <Button
              key={cat}
              variant={
                categoryFilter === cat ? 'primary' : 'outline-primary'
              }
              onClick={() => setCategoryFilter(cat)}
            >
              {categoryIcons[cat]} {cat}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* Popular Businesses */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-white fw-bold border-bottom">
          Popular Near You
        </Card.Header>
        <Card.Body>
          {filteredBusinesses.length === 0 ? (
            <p className="text-muted">No businesses in this category.</p>
          ) : (
            <Row>
              {filteredBusinesses.map((b) => (
                <Col md={4} key={b.id} className="mb-3">
                  <Card className="h-100 border">
                    <Card.Body>
                      <h5 className="fw-bold">{b.name}</h5>
                      <p className="text-muted mb-2">
                        {b.categories
                          .map((cat) => `${categoryIcons[cat] || ''} ${cat}`)
                          .join(', ')}
                      </p>
                      <div className="d-flex gap-2 flex-wrap">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/business/${b.id}`)}
                        >
                          View Profile
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() =>
                            navigate(`/business/${b.id}/services`)
                          }
                        >
                          Services Offered
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Services Section with Link */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-white fw-bold border-bottom d-flex justify-content-between align-items-center">
          <span>Services You Might Like</span>
          <div className="d-flex gap-2">
            <NavLink
              to="/business-services"
              className={({ isActive }) =>
                `btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-primary'}`
              }
            >
              View All Services Offered
            </NavLink>
          </div>
        </Card.Header>
        <Card.Body>
          {services.length === 0 ? (
            <p className="text-muted">No services available at the moment.</p>
          ) : (
            <Row>
              {services.slice(0, 6).map((s) => (
                <Col md={4} key={s.id} className="mb-3">
                  <Card className="h-100 border">
                    <Card.Body>
                      <h6 className="fw-bold mb-1">{s.name}</h6>
                      <p className="text-muted mb-2">
                        {categoryIcons[s.category] || ''} {s.category}
                      </p>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() =>
                          navigate(`/business/${s.business.id}/services`)
                        }
                      >
                        Book Service
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ClientDashboard;
