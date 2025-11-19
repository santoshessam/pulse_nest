import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function DataTable({ data, isLoading, error, onDeviceSelect, onCustomerClick, onTopologyClick, onEmailClick, onRefresh }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [sendMessage, setSendMessage] = useState('');
  const tableWrapperRef = useRef(null);

  // Clear selections when page changes
  useEffect(() => {
    setSelectedCustomers([]);
  }, [currentPage]);

  if (isLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading eligible customers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <p>No eligible customers found. Try adjusting your filters.</p>
      </div>
    );
  }

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCustomers(currentData.map(customer => customer.account_id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (accountId) => {
    setSelectedCustomers(prev => {
      if (prev.includes(accountId)) {
        return prev.filter(id => id !== accountId);
      } else {
        return [...prev, accountId];
      }
    });
  };

  const handleSendUpgradeOffer = async () => {
    if (selectedCustomers.length === 0) {
      setSendMessage('Please select at least one customer');
      return;
    }

    setIsSending(true);
    setSendMessage('');

    try {
      const response = await axios.post('/api/customers/bulk-send-offer', {
        customerIds: selectedCustomers
      });

      if (response.data.success) {
        setSendMessage(`Successfully sent offers to ${response.data.sent} customer(s)`);
        setSelectedCustomers([]);
        // Refresh data to show updated records
        if (onRefresh) {
          onRefresh();
        }
        setTimeout(() => setSendMessage(''), 5000);
      } else {
        setSendMessage('Error: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error sending bulk offers:', error);
      setSendMessage('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSending(false);
    }
  };

  const formatSpeed = (mbps) => {
    if (!mbps) return 'N/A';
    const speed = parseFloat(mbps);
    if (speed >= 1000) {
      return `${(speed / 1000).toFixed(1)}G`;
    }
    return `${speed.toFixed(0)}M`;
  };

  const getUsageClass = (usage) => {
    const usagePercent = parseFloat(usage);
    if (usagePercent >= 80) return 'usage-high';
    if (usagePercent >= 60) return 'usage-medium';
    return '';
  };

  // Sorting function
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Apply sorting to data
  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue = parseFloat(a[sortColumn]) || 0;
    let bValue = parseFloat(b[sortColumn]) || 0;

    if (sortDirection === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const renderPagination = () => (
    <div className="pagination">
      <button
        className="pagination-button"
        onClick={goToPreviousPage}
        disabled={currentPage === 1}
      >
        ← Previous
      </button>

      <div className="pagination-pages">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            className={`pagination-number ${
              page === currentPage ? 'active' : ''
            } ${page === '...' ? 'dots' : ''}`}
            onClick={() => page !== '...' && goToPage(page)}
            disabled={page === '...'}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        className="pagination-button"
        onClick={goToNextPage}
        disabled={currentPage === totalPages}
      >
        Next →
      </button>

      <div className="pagination-info">
        Showing {startIndex + 1}-{Math.min(endIndex, sortedData.length)} of{' '}
        {sortedData.length} customers
      </div>
    </div>
  );

  return (
    <div className="data-table-container">
      {selectedCustomers.length > 0 && (
        <div style={{
          backgroundColor: '#e8f5e9',
          padding: '16px',
          marginBottom: '16px',
          borderRadius: '8px',
          border: '2px solid #4caf50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: '600', color: '#2e7d32', fontSize: '1rem' }}>
              {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleSendUpgradeOffer}
              disabled={isSending}
              style={{
                background: 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: isSending ? 'not-allowed' : 'pointer',
                opacity: isSending ? 0.6 : 1,
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(67, 160, 71, 0.3)'
              }}
              onMouseOver={(e) => !isSending && (e.target.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => !isSending && (e.target.style.transform = 'translateY(0)')}
            >
              {isSending ? 'Sending...' : 'Send Upgrade Offer'}
            </button>
          </div>
          {sendMessage && (
            <div style={{
              padding: '8px 16px',
              borderRadius: '4px',
              backgroundColor: sendMessage.includes('Error') ? '#ffebee' : '#c8e6c9',
              color: sendMessage.includes('Error') ? '#c62828' : '#2e7d32',
              fontWeight: '500'
            }}>
              {sendMessage}
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && renderPagination()}

      <div className="data-table" ref={tableWrapperRef}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '50px' }}>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedCustomers.length === currentData.length && currentData.length > 0}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th>Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Account ID</th>
              <th>Current Speed</th>
              <th
                className="sortable-header"
                onClick={() => handleSort('avg_usage_percentage')}
                style={{ cursor: 'pointer' }}
              >
                Customer usage %
                {sortColumn === 'avg_usage_percentage' && (
                  <span style={{ marginLeft: '5px' }}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className="sortable-header"
                onClick={() => handleSort('avg_link_utilization_percentage')}
                style={{ cursor: 'pointer' }}
              >
                Agg Usage %
                {sortColumn === 'avg_link_utilization_percentage' && (
                  <span style={{ marginLeft: '5px' }}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className="sortable-header"
                onClick={() => handleSort('avg_uplink_utilization_percentage')}
                style={{ cursor: 'pointer' }}
              >
                EDR usage %
                {sortColumn === 'avg_uplink_utilization_percentage' && (
                  <span style={{ marginLeft: '5px' }}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Avg Download (Mbps)</th>
              <th>Technology</th>
              <th>OLT Device</th>
              <th>Capacity Notes</th>
              <th>Last Upgrade Date</th>
              <th>Last Offer Date</th>
              <th>Contact Preference</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((customer, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(customer.account_id)}
                    onChange={() => handleSelectCustomer(customer.account_id)}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td>
                  <span
                    className="customer-name-link"
                    onClick={() => onCustomerClick && onCustomerClick(customer.account_id)}
                    style={{
                      color: 'var(--primary-red)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontWeight: '700',
                    }}
                    title="Click to view customer details"
                  >
                    {customer.name || 'N/A'}
                  </span>
                </td>
                <td>{customer.address || 'N/A'}</td>
                <td>{customer.phone || 'N/A'}</td>
                <td>
                  <span
                    className="email-link"
                    onClick={() => onEmailClick && onEmailClick(customer)}
                    style={{
                      color: '#2e7d32',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontWeight: '600',
                    }}
                    title="Click to send upgrade notification"
                  >
                    {customer.email || 'N/A'}
                  </span>
                </td>
                <td>{customer.account_id || 'N/A'}</td>
                <td>
                  <span className="speed-badge">
                    {formatSpeed(customer.current_download_mbps)}
                  </span>
                </td>
                <td>
                  <span
                    className={`usage-badge ${getUsageClass(
                      customer.avg_usage_percentage
                    )}`}
                  >
                    {customer.avg_usage_percentage
                      ? `${parseFloat(customer.avg_usage_percentage).toFixed(1)}%`
                      : 'N/A'}
                  </span>
                </td>
                <td>
                  <span
                    className={`usage-badge ${getUsageClass(
                      customer.avg_link_utilization_percentage
                    )}`}
                  >
                    {customer.avg_link_utilization_percentage
                      ? `${parseFloat(customer.avg_link_utilization_percentage).toFixed(1)}%`
                      : 'N/A'}
                  </span>
                </td>
                <td>
                  <span
                    className={`usage-badge ${getUsageClass(
                      customer.avg_uplink_utilization_percentage
                    )}`}
                  >
                    {customer.avg_uplink_utilization_percentage
                      ? `${parseFloat(customer.avg_uplink_utilization_percentage).toFixed(1)}%`
                      : 'N/A'}
                  </span>
                </td>
                <td>
                  {customer.avg_download_usage_mbps
                    ? parseFloat(customer.avg_download_usage_mbps).toFixed(2)
                    : 'N/A'}
                </td>
                <td>{customer.olt_technology || 'N/A'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      className="olt-device-link"
                      onClick={() => onDeviceSelect && onDeviceSelect(customer.olt)}
                      style={{
                        color: 'var(--primary-red)',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontWeight: '600',
                      }}
                      title="Click to filter by this OLT Device"
                    >
                      {customer.olt || 'N/A'}
                    </span>
                    {customer.olt && onTopologyClick && (
                      <button
                        className="topology-button"
                        onClick={() => onTopologyClick(customer.olt)}
                        title="View network topology"
                        style={{
                          background: 'linear-gradient(135deg, #cc0033 0%, #990026 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          transition: 'transform 0.2s',
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                      >
                        📊
                      </button>
                    )}
                  </div>
                </td>
                <td>
                  {customer.capacity_notes ? (
                    <span className="capacity-alert">
                      ⚠️ {customer.capacity_notes}
                    </span>
                  ) : (
                    <span className="capacity-ok">✓ OK</span>
                  )}
                </td>
                <td>
                  {customer.last_upgrade_date
                    ? new Date(customer.last_upgrade_date).toLocaleDateString()
                    : 'N/A'}
                </td>
                <td>
                  {customer.last_promo_offer_date
                    ? new Date(customer.last_promo_offer_date).toLocaleDateString()
                    : 'N/A'}
                </td>
                <td>
                  {customer.contact_preference ? (
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        backgroundColor:
                          customer.contact_preference === 'email'
                            ? '#e3f2fd'
                            : customer.contact_preference === 'phone'
                            ? '#fff3e0'
                            : '#e8f5e9',
                        color:
                          customer.contact_preference === 'email'
                            ? '#1565c0'
                            : customer.contact_preference === 'phone'
                            ? '#e65100'
                            : '#2e7d32',
                      }}
                    >
                      {customer.contact_preference.charAt(0).toUpperCase() +
                        customer.contact_preference.slice(1)}
                    </span>
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && renderPagination()}
    </div>
  );
}

export default DataTable;
