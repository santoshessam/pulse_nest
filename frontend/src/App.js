import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FilterSection from './FilterSection';
import DataTable from './DataTable';
import CustomerModal from './CustomerModal';
import NetworkTopologyModal from './NetworkTopologyModal';
import './App.css';

function App() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTopologyDeviceId, setSelectedTopologyDeviceId] = useState(null);
  const [showTopologyModal, setShowTopologyModal] = useState(false);

  // Load initial data on mount
  useEffect(() => {
    fetchCustomers({});
  }, []);

  const fetchCustomers = async (filters) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (filters.device_id) {
        params.append('device_id', filters.device_id);
      }
      if (filters.technology) {
        params.append('technology', filters.technology);
      }
      if (filters.min_usage) {
        params.append('min_usage', filters.min_usage);
      }
      if (filters.current_speed) {
        params.append('current_speed', filters.current_speed);
      }
      if (filters.exact_speed_match) {
        params.append('exact_speed_match', 'true');
      }

      const response = await axios.get(`/api/customers/eligible?${params.toString()}`);

      if (response.data.success) {
        setCustomers(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch customers');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'An error occurred while fetching data'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = (filters) => {
    fetchCustomers(filters);
  };

  const handleDeviceSelect = (deviceId) => {
    setSelectedDeviceId(deviceId);
    // Trigger search with the selected device
    setTimeout(() => {
      fetchCustomers({ device_id: deviceId });
    }, 100);
  };

  const handleCustomerClick = (accountId) => {
    setSelectedCustomerId(accountId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCustomerId(null);
  };

  const handleTopologyClick = (deviceId) => {
    setSelectedTopologyDeviceId(deviceId);
    setShowTopologyModal(true);
  };

  const handleCloseTopologyModal = () => {
    setShowTopologyModal(false);
    setSelectedTopologyDeviceId(null);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-container">
          <div className="header-brand">
            <img
              src="https://tundra.frontier.redventures.io/migration/site-logo-rebrand.svg"
              alt="Frontier Communications"
              className="logo"
            />
            <div className="header-divider"></div>
            <div className="header-title">
              <h1>Boost the Broadband</h1>
              <p>Targeted Speed Upgrade Campaign</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="header-button">Support</button>
            <button className="header-button primary">Sign In</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <div className="hero-content">
            <h2>Identify & Upgrade Eligible Customers</h2>
            <p>
              Find customers ready for broadband speed upgrades based on usage
              patterns, network capacity, and technology capabilities.
            </p>
            <div className="hero-stats">
              <div className="stat-card">
                <div className="stat-icon">🚀</div>
                <div className="stat-text">
                  <h3>Fast Upgrades</h3>
                  <p>XGS-PON & 25XGS-PON</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-text">
                  <h3>Usage Based</h3>
                  <p>Smart Analysis</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💡</div>
                <div className="stat-text">
                  <h3>Network Ready</h3>
                  <p>Capacity Optimized</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FilterSection
          onFilter={handleFilter}
          isLoading={isLoading}
          selectedDeviceId={selectedDeviceId}
        />

        <section className="results-section">
          <div className="results-header">
            <h3>Eligible Customers</h3>
            {!isLoading && !error && (
              <span className="results-count">
                {customers.length} {customers.length === 1 ? 'Customer' : 'Customers'} Found
              </span>
            )}
          </div>

          <DataTable
            data={customers}
            isLoading={isLoading}
            error={error}
            onDeviceSelect={handleDeviceSelect}
            onCustomerClick={handleCustomerClick}
            onTopologyClick={handleTopologyClick}
          />
        </section>
      </main>

      {showModal && selectedCustomerId && (
        <CustomerModal
          accountId={selectedCustomerId}
          onClose={handleCloseModal}
        />
      )}

      {showTopologyModal && selectedTopologyDeviceId && (
        <NetworkTopologyModal
          deviceId={selectedTopologyDeviceId}
          onClose={handleCloseTopologyModal}
        />
      )}
    </div>
  );
}

export default App;
