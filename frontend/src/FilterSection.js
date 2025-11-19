import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FilterSection({ onFilter, isLoading, selectedDeviceId }) {
  const [filters, setFilters] = useState({
    device_id: '',
    technology: '',
    min_usage: '50',
    last_offer_days: '',
  });

  // Update device_id when selectedDeviceId prop changes
  useEffect(() => {
    if (selectedDeviceId) {
      setFilters((prev) => ({
        ...prev,
        device_id: selectedDeviceId,
      }));
    }
  }, [selectedDeviceId]);

  const [devices, setDevices] = useState([]);
  const [technologies, setTechnologies] = useState([]);

  useEffect(() => {
    // Fetch available devices
    axios
      .get('/api/devices')
      .then((response) => {
        if (response.data.success) {
          setDevices(response.data.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching devices:', error);
      });

    // Fetch available technologies
    axios
      .get('/api/technologies')
      .then((response) => {
        if (response.data.success) {
          setTechnologies(response.data.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching technologies:', error);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSearch = () => {
    onFilter(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      device_id: '',
      technology: '',
      min_usage: '50',
      last_offer_days: '',
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="filter-section">
      <h3>Filter Eligible Customers</h3>
      <div className="filter-grid">
        <div className="filter-group">
          <label htmlFor="device_id">OLT Device ID</label>
          <select
            id="device_id"
            name="device_id"
            value={filters.device_id}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          >
            <option value="">All Devices</option>
            {devices.map((device) => (
              <option key={device.device_id} value={device.device_id}>
                {device.device_id}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="technology">OLT Technology</label>
          <select
            id="technology"
            name="technology"
            value={filters.technology}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          >
            <option value="">All Technologies</option>
            {technologies.map((tech) => (
              <option key={tech.technology} value={tech.technology}>
                {tech.technology}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="min_usage">Minimum Usage (%)</label>
          <input
            type="number"
            id="min_usage"
            name="min_usage"
            value={filters.min_usage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            min="0"
            max="100"
            placeholder="e.g., 50"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="last_offer_days">Last Offer Date</label>
          <select
            id="last_offer_days"
            name="last_offer_days"
            value={filters.last_offer_days}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          >
            <option value="">All Customers</option>
            <option value="7">Offered within last 7 days</option>
            <option value="30">Offered within last 30 days</option>
            <option value="60">Offered within last 60 days</option>
            <option value="90">Offered within last 90 days</option>
          </select>
        </div>
      </div>

      <div className="filter-actions">
        <button
          className="button button-primary"
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
        <button
          className="button button-secondary"
          onClick={handleReset}
          disabled={isLoading}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}

export default FilterSection;
