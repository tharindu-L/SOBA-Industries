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
        itemType: 'medal',
        quantity: 1,
        designImage: null,
        specialNotes: '',
        wantDate: ''
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [designFiles, setDesignFiles] = useState([]);

    // Get tomorrow's date for the minimum date in the date picker
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    const itemTypes = [
        { value: 'Medals', label: 'Medals' },
        { value: 'Badges', label: 'Badges' },
        { value: 'Mugs', label: 'Mugs' },
        { value: 'Other', label: 'Other' }
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

    const handleFilesChange = (e) => {
        setDesignFiles([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!formData.wantDate) {
            setError('Required by date is required');
            setIsSubmitting(false);
            return;
        }

        try {
            // Create FormData object
            const formPayload = new FormData();
            formPayload.append('customerName', formData.customerName);
            formPayload.append('description', formData.description);
            formPayload.append('itemType', formData.itemType);
            formPayload.append('quantity', formData.quantity);
            formPayload.append('specialNotes', formData.specialNotes || '');
            formPayload.append('wantDate', formData.wantDate);
            
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

            console.log('Submitting form data:', {
                customerName: formData.customerName,
                description: formData.description,
                itemType: formData.itemType,
                quantity: formData.quantity,
                specialNotes: formData.specialNotes,
                wantDate: formData.wantDate,
                hasDesignImage: !!formData.designImage,
                designFilesCount: designFiles.length
            });

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
                alert(`Order request created successfully! Request ID: ${response.data.orderRequest.requestId}`);
                navigate('/cashier-dashboard');
            } else {
                setError(response.data.message || 'Failed to create order request');
            }
        } catch (err) {
            console.error('Error creating custom order:', err);
            setError(err.response?.data?.message || 'Failed to create order request. Please try again.');
        } finally {
            setIsSubmitting(false);
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
                        onClick={() => navigate('/cashier-dashboard')}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Submitting...
                            </>
                        ) : (
                            'Submit Request'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCustomOrder;