import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import productService from '../services/productService';

interface Product {
  id: string;
  name: string;
  priceCents: number;
  countInStock: number;
}

// Basic styling - consider a CSS-in-JS solution or a UI library for a real app
const tableStyles = { width: '100%', borderCollapse: 'collapse' };
const thStyles = { backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', padding: '8px', border: '1px solid var(--color-border)', textAlign: 'left' };
const tdStyles = { padding: '8px', border: '1px solid var(--color-border)', color: 'inherit' };
const modalOverlayStyles = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyles = { padding: '20px', borderRadius: '5px', width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
const inputStyles = { width: '100%', padding: '8px', backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: '4px' };

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    countInStock: '0'
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts();
      setProducts(response.data);
      setError('');
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Failed to fetch products.';
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        // Optimistic UI update
        setProducts(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        const message = err.response?.data?.error || 'Failed to delete product.';
        setError(message);
        console.error(err);
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // Convert decimal string to integer cents (e.g., "10.99" -> 1099)
      // Math.round handles floating point quirks during multiplication
      const productData = {
        name: formData.name,
        priceCents: Math.round(Number(formData.price) * 100),
        countInStock: Number(formData.countInStock)
      };
      await productService.createProduct(productData);
      setShowModal(false);
      setFormData({ name: '', price: '', countInStock: '0' }); // Reset form
      fetchProducts(); // Refresh list
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to create product.';
      setError(message);
      console.error(err);
    }
  };

  if (loading) return <p>Loading products...</p>;
  if (loading) return <p style={{ color: 'var(--color-text-primary)' }}>Loading products...</p>;
  if (error) return <p style={{ color: 'var(--color-error)' }}>{error}</p>;

  return (
    <div style={{ color: 'var(--color-text-primary)' }}>
      <h1 style={{ color: 'var(--color-text-primary)' }}>Product Management</h1>
      <button onClick={() => setShowModal(true)}>Add New Product</button>
      
      {/* Modal */}
      {showModal && (
        <div style={modalOverlayStyles}>
          <div style={{ ...modalContentStyles, backgroundColor: 'var(--color-bg-primary)' }}>
            <h2 style={{ color: 'var(--color-text-primary)' }}>Add New Product</h2>
            <form onSubmit={handleAddSubmit}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', color: 'var(--color-text-primary)', marginBottom: '5px' }}>Name:</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={inputStyles} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', color: 'var(--color-text-primary)', marginBottom: '5px' }}>Price:</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required style={inputStyles} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', color: 'var(--color-text-primary)', marginBottom: '5px' }}>Stock:</label>
                <input type="number" name="countInStock" value={formData.countInStock} onChange={handleInputChange} required style={inputStyles} />
              </div>
              <button type="submit" style={{ marginRight: '10px' }}>Save</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <table style={tableStyles}>
        <thead>
          <tr>
            <th style={thStyles}>Name</th>
            <th style={thStyles}>Price</th>
            <th style={thStyles}>Stock</th>
            <th style={thStyles}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td style={tdStyles}>{product.name}</td>
              <td style={tdStyles}>${(product.priceCents / 100).toFixed(2)}</td>
              <td style={tdStyles}>{product.countInStock}</td>
              <td style={tdStyles}>
                <button>Edit</button> {/* TODO: Implement Edit Product Modal/Form */}
                <button onClick={() => handleDelete(product.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductManagement;