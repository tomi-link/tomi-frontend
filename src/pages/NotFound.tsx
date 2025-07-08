import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

const NotFound: React.FC = () => {
  return (
    <Container className="text-center py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="display-3">404</h1>
          <p className="lead">Oops! The page you are looking for does not exist.</p>
          <Link to="/" className="btn btn-primary mt-3">
            Go to Home
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
