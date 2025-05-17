import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { jwtDecode } from 'jwt-decode';

const ShopItems = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [quantityErrors, setQuantityErrors] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [customerId, setCustomerId] = useState(null);
  const navigate = useNavigate();

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  };

  useEffect(() => {
    // Check authentication first
    const token = localStorage.getItem('token');
    
    // We still allow non-authenticated users to view products
    // but we'll set customerId if they are logged in
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);
        setCustomerId(decoded.id);
      } catch (err) {
        console.error('Error decoding token:', err);
        // Don't redirect yet, still allow viewing products
      }
    }

    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/product/get');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        if (data.success) {
          setProducts(data.products);
          const initialQuantities = {};
          data.products.forEach(product => {
            initialQuantities[product.productId] = 1;
          });
          setQuantities(initialQuantities);
        } else {
          throw new Error(data.message || 'Failed to fetch products');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    updateCartCount();
  }, []);

  const handleQuantityChange = (productId, value) => {
    const numValue = parseInt(value);
    const product = products.find(p => p.productId === productId);
    
    // Remove strict validation to allow users to add to cart more easily
    if (value === '') {
      setQuantities(prev => ({ ...prev, [productId]: 1 }));
      setQuantityErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[productId];
        return newErrors;
      });
      return;
    }

    if (isNaN(numValue)) {
      setQuantities(prev => ({ ...prev, [productId]: 1 }));
      setQuantityErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[productId];
        return newErrors;
      });
      return;
    }

    // Ensure valid quantity
    if (numValue < 1) {
      setQuantities(prev => ({ ...prev, [productId]: 1 }));
      setQuantityErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[productId];
        return newErrors;
      });
      return;
    }

    if (numValue > product.stock) {
      setQuantities(prev => ({ ...prev, [productId]: product.stock }));
      setQuantityErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[productId];
        return newErrors;
      });
      return;
    }

    setQuantities(prev => ({ ...prev, [productId]: numValue }));
    setQuantityErrors(prev => {
      const newErrors = {...prev};
      delete newErrors[productId];
      return newErrors;
    });
  };

  const addToCart = (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.setItem('needsLogin', 'true');
      //localStorage.setItem('redirectAfterLogin', '/');
      navigate('/');
      return;
    }

    // Verify token is valid before adding to cart
    try {
      jwtDecode(token); // Will throw error if token is invalid
    } catch (err) {
      console.error('Error decoding token:', err);
      localStorage.removeItem('token'); // Remove invalid token
      localStorage.setItem('needsLogin', 'true');
      navigate('/');
      return;
    }

    const quantity = quantities[product.productId];
    if (!quantity || quantity < 1) {
      setQuantityErrors(prev => ({ ...prev, [product.productId]: 'Invalid quantity' }));
      return;
    }

    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItemIndex = cartItems.findIndex(item => item.productId === product.productId);

    if (existingItemIndex >= 0) {
      const newQuantity = cartItems[existingItemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        setQuantityErrors(prev => ({ ...prev, [product.productId]: `Only ${product.stock} available` }));
        return;
      }
      cartItems[existingItemIndex].quantity = newQuantity;
    } else {
      cartItems.push({
        productId: product.productId,
        name: product.name,
        price: product.price,
        productImage: product.productImage,
        category: product.category,
        stock: product.stock,
        quantity: quantity
      });
    }

    localStorage.setItem('cart', JSON.stringify(cartItems));
    updateCartCount();
    alert(`${quantity} ${product.name}(s) added to cart!`);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem', color: '#666' }}>
      Loading products...
    </div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem', color: '#e63946' }}>
      Error: {error}
    </div>;
  }

  if (products.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem', color: '#666' }}>
      No products available
    </div>;
  }

  return (
    <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Cart Icon positioned inside component on right side */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 100,
        backgroundColor: 'white',
        borderRadius: '50%',
        padding: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
          <Badge badgeContent={cartCount} color="error" overlap="circular">
            <ShoppingCartIcon style={{ fontSize: 30, color: '#333' }} />
          </Badge>
        </Link>
      </div>

      {/* Product Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '30px',
        paddingTop: '60px' // Added padding to prevent overlap with cart icon
      }}>
        {products.map((product) => (
          <div key={product.productId} style={{
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            ':hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
            }
          }}>
            {/* Product image and details */}
            <div style={{ width: '50%', height: '200px', overflow: 'hidden',marginLeft:'25%' }}>
              <img 
                src={`http://localhost:4000/images/${product.productImage}`} 
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                  e.target.style = { objectFit: 'contain', background: '#f5f5f5', padding: '20px' };
                }}
              />
            </div>
            
            <div style={{ padding: '20px', flexGrow: 1 }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#333', fontWeight: '600' }}>
                {product.name}
              </h3>
              
              <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '12px', textTransform: 'capitalize' }}>
                {product.category}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <p style={{ fontWeight: 'bold', color: '#e63946', fontSize: '1.3rem', margin: '0' }}>
                  ${product.price}
                </p>
                
                <p style={{
                  fontSize: '0.85rem',
                  margin: '0',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: product.stock > 0 ? '#e8f5e9' : '#ffebee',
                  color: product.stock > 0 ? '#2e7d32' : '#c62828'
                }}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </p>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <label style={{ marginRight: '10px', fontSize: '0.9rem', color: '#666' }}>
                    Quantity:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantities[product.productId] ?? 1}
                    onChange={(e) => handleQuantityChange(product.productId, e.target.value)}
                    style={{
                      width: '60px',
                      padding: '5px',
                      border: quantityErrors[product.productId] ? '1px solid #e63946' : '1px solid #ddd',
                      borderRadius: '4px',
                      textAlign: 'center'
                    }}
                    disabled={product.stock <= 0}
                  />
                </div>
                {quantityErrors[product.productId] && (
                  <p style={{ color: '#e63946', fontSize: '0.75rem', margin: '5px 0 0 0', textAlign: 'center' }}>
                    {quantityErrors[product.productId]}
                  </p>
                )}
              </div>
              
              <button 
                style={{
                  backgroundColor: product.stock > 0 ? '#4CAF50' : '#9e9e9e',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  width: '100%',
                  borderRadius: '5px',
                  cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold',
                  marginTop: 'auto'
                }} 
                disabled={product.stock <= 0}
                onClick={() => addToCart(product)}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopItems;