import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Spinner, Container, Image } from 'react-bootstrap';

const CATEGORY_OPTIONS = [
  'Electronics and Accessories',
  'Beauty Products',
  'Food Products',
  'Fashion Products',
];

const AddProduct: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageFile: null as File | null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [serverImageUrl, setServerImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token =
      localStorage.getItem('token') ||
      JSON.parse(localStorage.getItem('user') || '{}').token;

    if (!token) {
      setError('You must be logged in.');
      setLoading(false);
      return;
    }

    try {
      let uploadedImageUrl = '';

      // Upload image first
      if (formData.imageFile) {
        const imageData = new FormData();
        imageData.append('image', formData.imageFile);

        const uploadRes = await axios.post(`${API_BASE_URL}/api/uploads`, imageData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        uploadedImageUrl = uploadRes.data.imageUrl;
        setServerImageUrl(`${API_BASE_URL}${uploadedImageUrl}`);
      }

      // Add product
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl: uploadedImageUrl || undefined,
      };

      await axios.post(`${API_BASE_URL}/api/products`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate('/business/products');
    } catch (err: any) {
      console.error('Error adding product:', err);
      setError(err.response?.data?.message || 'Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ maxWidth: '600px' }} className="py-4">
      <h3 className="mb-4">Add New Product</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit} encType="multipart/form-data">
        <Form.Group className="mb-3">
          <Form.Label>Product Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
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
            placeholder="Product details..."
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Price (KES)</Form.Label>
          <Form.Control
            type="number"
            name="price"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g. 150"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Select
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">-- Select Category --</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Product Image</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </Form.Group>

        {(previewUrl || serverImageUrl) && (
          <div className="mb-3 text-center">
            <Image
              src={serverImageUrl || previewUrl || ''}
              alt="Preview"
              thumbnail
              height={180}
              style={{ maxWidth: '100%' }}
            />
          </div>
        )}

        <Button type="submit" disabled={loading} variant="primary" className="w-100">
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            'Add Product'
          )}
        </Button>
      </Form>
    </Container>
  );
};

export default AddProduct;
