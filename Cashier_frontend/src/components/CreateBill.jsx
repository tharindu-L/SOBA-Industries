import './BillingSystem.css';

import { useEffect, useState } from 'react';

import axios from 'axios';

const BillingSystem = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/product/get');
            setProducts(response.data.products);
        } catch (error) {
            console.error('Error fetching products:', error);
            alert('Failed to load products');
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.productId === product.productId);
        
        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                alert('Cannot add more than available stock');
                return;
            }
            setCart(cart.map(item =>
                item.productId === product.productId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            if (product.stock < 1) {
                alert('Product out of stock');
                return;
            }
            setCart([...cart, {
                productId: product.productId,
                name: product.name,
                price: parseFloat(product.price),
                quantity: 1,
                stock: product.stock
            }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }
        
        const product = products.find(p => p.productId === productId);
        if (newQuantity > product.stock) {
            alert(`Only ${product.stock} items available`);
            return;
        }
        
        setCart(cart.map(item =>
            item.productId === productId
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    const handleCheckout = async () => {
        if (!customerName.trim()) {
            alert('Please enter customer name');
            return;
        }
        
        if (cart.length === 0) {
            alert('Please add items to cart');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:4000/api/bill/create-order', {
                customerName: customerName.trim(),
                paymentMethod,
                items: cart
            });

            alert(`Order #${response.data.orderId} created successfully!\nTotal: $${response.data.totalAmount}`);
            setCart([]);
            setCustomerName('');
            fetchProducts(); // Refresh product list
        } catch (error) {
            console.error('Error creating order:', error);
            alert(error.response?.data?.message || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="billing-container">
            <h1>Point of Sale System</h1>
            
            <div className="billing-layout">
                {/* Product Search and List */}
                <div className="product-section">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="product-list">
                        {filteredProducts.length === 0 ? (
                            <p>No products found</p>
                        ) : (
                            filteredProducts.map(product => (
                                <div 
                                    key={product.productId} 
                                    className={`product-card ${product.stock < 1 ? 'out-of-stock' : ''}`}
                                    onClick={() => product.stock > 0 && addToCart(product)}
                                >
                                    <div className="product-info">
                                        <h3>{product.name}</h3>
                                        <div className="product-meta">
                                            <span>ID: {product.productId}</span>
                                            <span>Category: {product.category}</span>
                                        </div>
                                        <div className="product-price-stock">
                                            <span>${product.price}</span>
                                            <span>{product.stock} in stock</span>
                                        </div>
                                    </div>
                                    {product.stock < 1 && (
                                        <div className="out-of-stock-label">OUT OF STOCK</div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
                
                {/* Order Section */}
                <div className="order-section">
                    <div className="customer-info">
                        <h2>Order Details</h2>
                        <div className="form-group">
                            <label>Customer Name *</label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Enter customer name"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Payment Method</label>
                            <div className="static-field">Cash</div>
                            {/* Hidden input to maintain the paymentMethod state */}
                            <input type="hidden" value={paymentMethod} />
                        </div>
                    </div>
                    
                    <div className="cart-items">
                        <h3>Cart Items {cart.length > 0 && `(${cart.length})`}</h3>
                        
                        {cart.length === 0 ? (
                            <p className="empty-cart">Your cart is empty</p>
                        ) : (
                            <div className="items-list">
                                {cart.map(item => (
                                    <div key={item.productId} className="cart-item">
                                        <div className="item-info">
                                            <h4>{item.name}</h4>
                                            <span>${item.price.toFixed(2)}</span>
                                        </div>
                                        <div className="item-controls">
                                            <button 
                                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                            >
                                                −
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                disabled={item.quantity >= item.stock}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="item-subtotal">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                        <button 
                                            className="remove-item"
                                            onClick={() => removeFromCart(item.productId)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="order-summary">
                        <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>${calculateTotal()}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total:</span>
                            <span>${calculateTotal()}</span>
                        </div>
                        
                        <button 
                            className={`checkout-btn ${loading ? 'loading' : ''}`}
                            onClick={handleCheckout}
                            disabled={loading || cart.length === 0 || !customerName.trim()}
                        >
                            {loading ? 'Processing...' : 'Complete Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingSystem;