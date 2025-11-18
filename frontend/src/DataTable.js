import React, { useState, useRef, useEffect } from 'react';

function DataTable({ data, isLoading, error, onDeviceSelect, onCustomerClick, onTopologyClick }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const tableWrapperRef = useRef(null);
  const topScrollRef = useRef(null);

  // Synchronize horizontal scrolling
  useEffect(() => {
    const tableWrapper = tableWrapperRef.current;
    const topScroll = topScrollRef.current;

    if (!tableWrapper || !topScroll) return;

    const syncTopToTable = () => {
      if (tableWrapper.scrollLeft !== topScroll.scrollLeft) {
        tableWrapper.scrollLeft = topScroll.scrollLeft;
      }
    };

    const syncTableToTop = () => {
      if (topScroll.scrollLeft !== tableWrapper.scrollLeft) {
        topScroll.scrollLeft = tableWrapper.scrollLeft;
      }
    };

    topScroll.addEventListener('scroll', syncTopToTable);
    tableWrapper.addEventListener('scroll', syncTableToTop);

    return () => {
      topScroll.removeEventListener('scroll', syncTopToTable);
      tableWrapper.removeEventListener('scroll', syncTableToTop);
    };
  }, []);

  // Update top scrollbar width when data changes
  useEffect(() => {
    const tableWrapper = tableWrapperRef.current;
    const topScroll = topScrollRef.current;

    if (!tableWrapper || !topScroll) return;

    const updateScrollWidth = () => {
      const table = tableWrapper.querySelector('table');
      const scrollContent = topScroll.firstChild;

      if (table && scrollContent) {
        const tableWidth = table.scrollWidth;
        scrollContent.style.width = `${tableWidth}px`;
        console.log('Table scrollWidth:', tableWidth, 'offsetWidth:', table.offsetWidth, 'Wrapper clientWidth:', tableWrapper.clientWidth);
      }
    };

    // Run after render with multiple attempts to ensure DOM is ready
    setTimeout(updateScrollWidth, 0);
    setTimeout(updateScrollWidth, 100);
    setTimeout(updateScrollWidth, 500);

    window.addEventListener('resize', updateScrollWidth);

    return () => {
      window.removeEventListener('resize', updateScrollWidth);
    };
  }, [data, currentPage]);

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
      {totalPages > 1 && renderPagination()}

      {/* Top horizontal scrollbar */}
      <div className="table-top-scroll" ref={topScrollRef}>
        <div></div>
      </div>

      <div className="data-table" ref={tableWrapperRef}>
        <table>
          <thead>
            <tr>
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
                OLT USAGE %
                {sortColumn === 'avg_link_utilization_percentage' && (
                  <span style={{ marginLeft: '5px' }}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Avg Download (Mbps)</th>
              <th>Technology</th>
              <th>OLT Device</th>
              <th>Capacity Notes</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((customer, index) => (
              <tr key={index}>
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
                <td>{customer.email || 'N/A'}</td>
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
