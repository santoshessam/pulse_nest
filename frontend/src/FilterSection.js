import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FilterSection({ onFilter, isLoading, selectedDeviceId }) {
  const [filters, setFilters] = useState({
    device_id: '',
    technology: '',
    min_usage: '50',
    current_speed: '',
    exact_speed_match: false,
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
      current_speed: '',
      exact_speed_match: false,
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
          <label htmlFor="current_speed">
            {filters.exact_speed_match ? 'Exact Current Speed (Mbps)' : 'Minimum Current Speed (Mbps)'}
          </label>
          <select
            id="current_speed"
            name="current_speed"
            value={filters.current_speed}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          >
            <option value="">All Speeds</option>
            <option value="25">25 Mbps {filters.exact_speed_match ? 'only' : 'and above'}</option>
            <option value="50">50 Mbps {filters.exact_speed_match ? 'only' : 'and above'}</option>
            <option value="100">100 Mbps {filters.exact_speed_match ? 'only' : 'and above'}</option>
            <option value="200">200 Mbps {filters.exact_speed_match ? 'only' : 'and above'}</option>
            <option value="500">500 Mbps {filters.exact_speed_match ? 'only' : 'and above'}</option>
            <option value="1000">1000 Mbps {filters.exact_speed_match ? 'only' : 'and above'}</option>
            <option value="2000">2000 Mbps {filters.exact_speed_match ? 'only' : 'and above'}</option>
            <option value="5000">5000 Mbps {filters.exact_speed_match ? 'only' : 'and above'}</option>
            <option value="7000">7000 Mbps {filters.exact_speed_match ? 'only' : 'and above'}</option>
          </select>
          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="exact_speed_match"
                checked={filters.exact_speed_match}
                onChange={handleInputChange}
                style={{ cursor: 'pointer' }}
              />
              <span>Filter by exact speed only</span>
            </label>
          </div>
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
