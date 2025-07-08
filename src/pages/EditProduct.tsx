import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Spinner, Alert, Container, Image } from 'react-bootstrap';

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products/${id}`);
        setFormData({
          name: res.data.name,
          description: res.data.description || '',
          price: res.data.price.toString(),
          category: res.data.category || '',
          image: res.data.imageUrl || '', // ✅ ensure correct key
        });
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, API_BASE_URL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in.');
      setSaving(false);
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/api/products/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/business/products');
    } catch (err: any) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading product...</p>
      </div>
    );
  }

  const displayImage = formData.image
    ? formData.image.startsWith('http') || formData.image.startsWith('/uploads')
      ? `${API_BASE_URL}${formData.image.startsWith('/') ? '' : '/'}${formData.image}`
      : formData.image
    : '';

  return (
    <Container style={{ maxWidth: '600px' }} className="py-4">
      <h3 className="mb-4">Edit Product</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Product Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Price (KES)</Form.Label>
          <Form.Control
            type="number"
            name="price"
            required
            value={formData.price}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Control
            type="text"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Image URL</Form.Label>
          <Form.Control
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="/uploads/your-image.jpg"
          />
        </Form.Group>

        {displayImage && (
          <div className="mb-3 text-center">
            <Image
              src={displayImage}
              thumbnail
              height={180}
              alt="Product Preview"
            />
          </div>
        )}

        <Button type="submit" disabled={saving} variant="primary" className="w-100">
          {saving ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </Form>
    </Container>
  );
};

export default EditProduct;
