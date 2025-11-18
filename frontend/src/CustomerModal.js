import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomerModal.css';

function CustomerModal({ accountId, onClose }) {
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching customer details for accountId:', accountId);
        const response = await axios.get(`/api/customers/${accountId}`);

        if (response.data.success) {
          setCustomer(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch customer details');
        }
      } catch (err) {
        console.error('Error fetching customer details:', err);
        console.error('Account ID that caused error:', accountId);
        console.error('Response data:', err.response?.data);
        setError(err.response?.data?.message || err.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (accountId) {
      fetchCustomerDetails();
    }
  }, [accountId]);

  const handleBackdropClick = (e) => {
    if (e.target.className === 'modal-backdrop') {
      onClose();
    }
  };

  const formatSpeed = (mbps) => {
    if (!mbps) return 'N/A';
    const speed = parseFloat(mbps);
    if (speed >= 1000) {
      return `${(speed / 1000).toFixed(1)} Gbps`;
    }
    return `${speed.toFixed(0)} Mbps`;
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Customer Details</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {isLoading && (
            <div className="modal-loading">
              <div className="loading-spinner"></div>
              <p>Loading customer details...</p>
            </div>
          )}

          {error && (
            <div className="modal-error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {customer && !isLoading && !error && (
            <div className="customer-details">
              <div className="detail-section">
                <h3>Personal Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Customer ID:</label>
                    <span>{customer.customer_id || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{`${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{customer.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{customer.phone || 'N/A'}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Address:</label>
                    <span>{customer.address || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Service Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Current Download Speed:</label>
                    <span className="speed-value">{formatSpeed(customer.current_download_mbps)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Current Upload Speed:</label>
                    <span className="speed-value">{formatSpeed(customer.current_upload_mbps)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Device ID:</label>
                    <span>{customer.device_id || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>OLT Technology:</label>
                    <span className="tech-badge">{customer.olt_technology || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Usage Statistics</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Average Usage:</label>
                    <span className="usage-value">
                      {customer.avg_usage_percentage
                        ? `${parseFloat(customer.avg_usage_percentage).toFixed(1)}%`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Avg Download Usage:</label>
                    <span>{customer.avg_download_usage_mbps
                      ? `${parseFloat(customer.avg_download_usage_mbps).toFixed(2)} Mbps`
                      : 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Avg Upload Usage:</label>
                    <span>{customer.avg_upload_usage_mbps
                      ? `${parseFloat(customer.avg_upload_usage_mbps).toFixed(2)} Mbps`
                      : 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Created Date:</label>
                    <span>{customer.created_at
                      ? new Date(customer.created_at).toLocaleDateString()
                      : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="button button-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerModal;
