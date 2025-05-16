import './CreateCustomOrder.css';

import React, { useState } from 'react';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateCustomOrder = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customerName: '',
        description: '',
        itemType: 'medal',
        quantity: 1,
        designImage: null
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const itemTypes = [
        { value: 'medal', label: 'Medal' },
        { value: 'batch', label: 'Batch' },
        { value: 'mug', label: 'Mug' },
        { value: 'souvenir', label: 'Souvenir' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const formPayload = new FormData();
        formPayload.append('customerName', formData.customerName);
        formPayload.append('description', formData.description);
        formPayload.append('itemType', formData.itemType);
        formPayload.append('quantity', formData.quantity);
        if (formData.designImage) {
            formPayload.append('designImage', formData.designImage);
        }

        try {
            const response = await axios.post(
                'http://localhost:4000/api/custom-orders',
                formPayload,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            alert(`Order request created successfully! Request ID: ${response.data.orderRequest.requestId}`);
            navigate('/custom-orders');
        } catch (err) {
            console.error('Error creating custom order:', err);
            setError(err.response?.data?.message || 'Failed to create order request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="custom-order-container">
            <h1>Create Custom Order Request</h1>
            
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
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                    />
                </div>

                <div className="form-row">
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
                </div>

                <div className="form-group">
                    <label>Design Image (Optional)</label>
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

                {error && <div className="error-message">{error}</div>}

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
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCustomOrder;