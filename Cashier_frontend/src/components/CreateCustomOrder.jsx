import './CreateCustomOrder.css';

import React, { useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateCustomOrder = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customerName: '',
        description: '',
        itemType: 'Medals', // Changed from 'medal' to 'Medals'
        quantity: 1,
        designImage: null,
        specialNotes: '',
        wantDate: ''
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [designFiles, setDesignFiles] = useState([]);
    // Add payment related states
    const [paymentMethod, setPaymentMethod] = useState('full');
    const [totalAmount, setTotalAmount] = useState(0);
    const [amountToPay, setAmountToPay] = useState(0);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    // Add service charge state
    const [serviceCharge, setServiceCharge] = useState(0);

    // Get tomorrow's date for the minimum date in the date picker
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    const itemTypes = [
        { value: 'Medals', label: 'Medals' },
        { value: 'Badges', label: 'Badges' },
        { value: 'Mugs', label: 'Mugs' },
        { value: 'Souvenirs', label: 'Souvenirs' }  // Changed from 'Other' to 'Souvenirs'
    ];

    // Price mapping for item types
    const itemPrices = {
        'Medals': 450.00,
        'Badges': 50.00,
        'Mugs': 500.00,
        'Souvenirs': 700.00
    };

    // Calculate total and payment amount when quantity or item type or service charge changes
    React.useEffect(() => {
        const price = itemPrices[formData.itemType] || 0;
        const subtotal = price * formData.quantity;
        const serviceChargeAmount = parseFloat(serviceCharge) || 0;
        const total = subtotal + serviceChargeAmount;
        
        setTotalAmount(total);
        
        // Calculate amount to pay based on payment method
        const amount = paymentMethod === 'advance' ? total * 0.3 : total;
        setAmountToPay(amount);
    }, [formData.itemType, formData.quantity, paymentMethod, serviceCharge]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                designImage: file
            }));
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFilesChange = (e) => {
        setDesignFiles([...e.target.files]);
    };

    const handleServiceChargeChange = (e) => {
        const value = e.target.value;
        // Only allow positive numbers or empty string
        if (value === '' || (parseFloat(value) >= 0 && !isNaN(parseFloat(value)))) {
            setServiceCharge(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        setPaymentProcessing(true);

        if (!formData.wantDate) {
            setError('Required by date is required');
            setIsSubmitting(false);
            setPaymentProcessing(false);
            return;
        }

        try {
            // Create FormData object for file upload
            const formPayload = new FormData();
            formPayload.append('customerName', formData.customerName);
            formPayload.append('description', formData.description);
            formPayload.append('itemType', formData.itemType);
            formPayload.append('quantity', formData.quantity);
            formPayload.append('specialNotes', formData.specialNotes || '');
            formPayload.append('wantDate', formData.wantDate);
            
            // Add payment information
            formPayload.append('paymentMethod', paymentMethod);
            formPayload.append('totalAmount', totalAmount.toFixed(2));
            formPayload.append('amountPaid', amountToPay.toFixed(2));
            
            // Only include service charge if it has a value
            if (parseFloat(serviceCharge) > 0) {
                formPayload.append('serviceCharge', serviceCharge);
            }
            
            // Add design image if present
            if (formData.designImage) {
                formPayload.append('designImage', formData.designImage);
            }

            // Add multiple design files if present
            if (designFiles.length > 0) {
                designFiles.forEach(file => {
                    formPayload.append('designFiles', file);
                });
            }

            console.log('Submitting custom order to API...');
            console.log('Payment method:', paymentMethod);

            // Make the API request with the FormData
            const response = await axios.post(
                'http://localhost:4000/api/custom-orders',
                formPayload,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            console.log('API response:', response.data);

            if (response.data.success) {
                // Display the payment status correctly based on payment method
                const paymentStatusText = paymentMethod === 'advance' 
                    ? '30% Advance (Partially Paid)' 
                    : 'Full Payment';
                    
                alert(`Order request created successfully! 
Request ID: ${response.data.orderRequest.requestId}
Payment: LKR ${amountToPay.toFixed(2)} (${paymentStatusText})
${paymentMethod === 'advance' ? `Remaining: LKR ${(totalAmount - amountToPay).toFixed(2)} (Due at pickup)` : ''}`);
                
                navigate('/cashier-dashboard');
            } else {
                setError(response.data.message || 'Failed to create order request');
            }
        } catch (err) {
            console.error('Error creating custom order:', err);
            setError(err.response?.data?.message || 'Failed to create order request. Please try again.');
        } finally {
            setIsSubmitting(false);
            setPaymentProcessing(false);
        }
    };

    return (
        <div className="custom-order-container">
            <h1>Create Custom Order Request</h1>
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            <form onSubmit={handleSubmit} className="custom-order-form">
                <div className="form-group">
                    <label>Customer Name *</label>
                    <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Item Type *</label>
                    <select
                        name="itemType"
                        value={formData.itemType}
                        onChange={handleChange}
                        required
                    >
                        {itemTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Description *</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Quantity *</label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="1"
                        required
                    />
                </div>
                
                {/* Add Service Charge field */}
                <div className="form-group">
                    <label>Service Charge (LKR)</label>
                    <input
                        type="number"
                        name="serviceCharge"
                        value={serviceCharge}
                        onChange={handleServiceChargeChange}
                        min="0"
                        step="0.01"
                        placeholder="Enter additional service charge if any"
                    />
                    <small className="form-text text-muted">
                        Optional: Add any additional service charges
                    </small>
                </div>
                
                <div className="form-group">
                    <label>Required By Date *</label>
                    <input
                        type="date"
                        name="wantDate"
                        value={formData.wantDate}
                        onChange={handleChange}
                        min={minDate}
                        required
                    />
                    <small className="form-text text-muted">
                        Please select the date you need this order completed by
                    </small>
                </div>

                <div className="form-group">
                    <label>Special Notes</label>
                    <textarea
                        name="specialNotes"
                        value={formData.specialNotes}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Any special instructions"
                    />
                </div>

                <div className="form-group">
                    <label>Design Image (Single)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {previewImage && (
                        <div className="image-preview">
                            <img src={previewImage} alt="Design preview" />
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Design Files (Multiple)</label>
                    <input
                        type="file"
                        multiple
                        onChange={handleFilesChange}
                    />
                    <small className="form-text text-muted">
                        Upload design files (images, PDFs, etc.)
                    </small>
                </div>

                {/* Add Payment Section */}
                <div className="form-section">
                    <h3>Payment Information</h3>
                    
                    <div className="form-group">
                        <label>Payment Method *</label>
                        <div className="payment-options">
                            <div className="payment-option">
                                <input
                                    type="radio"
                                    id="full-payment"
                                    name="paymentMethod"
                                    value="full"
                                    checked={paymentMethod === 'full'}
                                    onChange={handlePaymentMethodChange}
                                />
                                <label htmlFor="full-payment">Full Payment</label>
                            </div>
                            
                            <div className="payment-option">
                                <input
                                    type="radio"
                                    id="advance-payment"
                                    name="paymentMethod"
                                    value="advance"
                                    checked={paymentMethod === 'advance'}
                                    onChange={handlePaymentMethodChange}
                                />
                                <label htmlFor="advance-payment">30% Advance Payment</label>
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-group payment-summary">
                        <div className="summary-item">
                            <span>Base Amount:</span>
                            <span>${(totalAmount - parseFloat(serviceCharge || 0)).toFixed(2)}</span>
                        </div>
                        {parseFloat(serviceCharge) > 0 && (
                            <div className="summary-item">
                                <span>Service Charge:</span>
                                <span>${parseFloat(serviceCharge).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="summary-item highlight">
                            <span>Total Amount:</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="summary-item highlight">
                            <span>Amount to Pay Now:</span>
                            <span>${amountToPay.toFixed(2)}</span>
                        </div>
                        {paymentMethod === 'advance' && (
                            <div className="summary-item remaining">
                                <span>Remaining (Due Later):</span>
                                <span>${(totalAmount - amountToPay).toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => navigate('/cashier-dashboard')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> 
                                {paymentProcessing ? 'Processing Payment...' : 'Submitting...'}
                            </>
                        ) : (
                            `Submit & Pay ${paymentMethod === 'advance' ? '30% Advance' : 'Full Amount'}`
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCustomOrder;