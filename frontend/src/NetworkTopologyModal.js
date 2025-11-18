import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Network } from 'vis-network';
import './NetworkTopologyModal.css';

function NetworkTopologyModal({ deviceId, onClose }) {
  const [topology, setTopology] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const networkContainer = useRef(null);
  const networkInstance = useRef(null);

  useEffect(() => {
    const fetchTopology = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching topology for device:', deviceId);
        const response = await axios.get(`/api/network/topology/${deviceId}`);

        if (response.data.success) {
          setTopology(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch topology');
        }
      } catch (err) {
        console.error('Error fetching topology:', err);
        setError(err.response?.data?.message || err.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (deviceId) {
      fetchTopology();
    }
  }, [deviceId]);

  useEffect(() => {
    if (topology && topology.edges && networkContainer.current) {
      // Create nodes from edges
      const nodesMap = new Map();

      topology.edges.forEach(edge => {
        if (!nodesMap.has(edge.parent_device_id)) {
          nodesMap.set(edge.parent_device_id, {
            id: edge.parent_device_id,
            label: edge.parent_device_id,
            color: edge.parent_device_id === deviceId ? '#cc0033' : '#4a90e2',
            font: { color: '#ffffff', size: 14, face: 'Arial', bold: true }
          });
        }
        if (!nodesMap.has(edge.child_device_id)) {
          nodesMap.set(edge.child_device_id, {
            id: edge.child_device_id,
            label: edge.child_device_id,
            color: edge.child_device_id === deviceId ? '#cc0033' : '#2ecc71',
            font: { color: '#ffffff', size: 14, face: 'Arial', bold: true }
          });
        }
      });

      const nodes = Array.from(nodesMap.values());

      const edges = topology.edges.map((edge, index) => ({
        id: index,
        from: edge.parent_device_id,
        to: edge.child_device_id,
        label: `${parseFloat(edge.link_utilization_percentage).toFixed(1)}%`,
        color: {
          color: edge.link_status === 'Up' ? '#2ecc71' : '#e74c3c',
          highlight: '#cc0033'
        },
        width: edge.link_status === 'Up' ? 3 : 1,
        dashes: edge.link_status !== 'Up',
        arrows: 'to',
        font: { size: 12, align: 'middle', background: 'white' },
        title: `Status: ${edge.link_status}\nUtilization: ${edge.link_utilization_percentage}%\nBandwidth: ${edge.link_bandwidth_gbps} Gbps\nLAG Type: ${edge.lag_type}`
      }));

      const data = { nodes, edges };

      const options = {
        nodes: {
          shape: 'box',
          margin: 10,
          widthConstraint: { maximum: 150 },
          borderWidth: 2,
          borderWidthSelected: 4
        },
        edges: {
          smooth: {
            type: 'curvedCW',
            roundness: 0.2
          }
        },
        physics: {
          enabled: true,
          barnesHut: {
            gravitationalConstant: -8000,
            centralGravity: 0.3,
            springLength: 150,
            springConstant: 0.04
          },
          stabilization: {
            iterations: 200
          }
        },
        interaction: {
          hover: true,
          tooltipDelay: 100,
          zoomView: true,
          dragView: true
        }
      };

      if (networkInstance.current) {
        networkInstance.current.destroy();
      }

      networkInstance.current = new Network(networkContainer.current, data, options);

      // Add click event
      networkInstance.current.on('click', (params) => {
        if (params.nodes.length > 0) {
          console.log('Clicked node:', params.nodes[0]);
        }
      });
    }

    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
      }
    };
  }, [topology, deviceId]);

  const handleBackdropClick = (e) => {
    if (e.target.className === 'topology-modal-backdrop') {
      onClose();
    }
  };

  return (
    <div className="topology-modal-backdrop" onClick={handleBackdropClick}>
      <div className="topology-modal-content">
        <div className="topology-modal-header">
          <h2>Network Topology - {deviceId}</h2>
          <button className="topology-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="topology-modal-body">
          {isLoading && (
            <div className="topology-loading">
              <div className="loading-spinner"></div>
              <p>Loading network topology...</p>
            </div>
          )}

          {error && (
            <div className="topology-error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {topology && !isLoading && !error && (
            <>
              <div className="topology-stats">
                <div className="stat-grid">
                  <div className="stat-item">
                    <label>Connected Parents</label>
                    <span>{topology.statistics?.connected_parents || 0}</span>
                  </div>
                  <div className="stat-item">
                    <label>Total Links</label>
                    <span>{topology.statistics?.total_links || 0}</span>
                  </div>
                  <div className="stat-item">
                    <label>Links Up</label>
                    <span className="status-up">{topology.statistics?.links_up || 0}</span>
                  </div>
                  <div className="stat-item">
                    <label>Links Down</label>
                    <span className="status-down">{topology.statistics?.links_down || 0}</span>
                  </div>
                  <div className="stat-item">
                    <label>Avg Utilization</label>
                    <span className="utilization">
                      {topology.statistics?.avg_utilization
                        ? `${parseFloat(topology.statistics.avg_utilization).toFixed(1)}%`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <label>Max Utilization</label>
                    <span className="utilization">
                      {topology.statistics?.max_utilization
                        ? `${parseFloat(topology.statistics.max_utilization).toFixed(1)}%`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <label>Total Bandwidth</label>
                    <span>
                      {topology.statistics?.total_bandwidth
                        ? `${parseFloat(topology.statistics.total_bandwidth).toFixed(1)} Gbps`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <label>LAG Type</label>
                    <span className="lag-type">{topology.statistics?.lag_type || 'N/A'}</span>
                  </div>
                  <div className="stat-item">
                    <label>Customer Count</label>
                    <span className="customer-count">{topology.customerCount || 0}</span>
                  </div>
                </div>
              </div>

              <div className="topology-legend">
                <h4>Legend</h4>
                <div className="legend-items">
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#cc0033' }}></div>
                    <span>Selected Device</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#4a90e2' }}></div>
                    <span>Parent Device</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#2ecc71' }}></div>
                    <span>Child Device / Link Up</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#e74c3c' }}></div>
                    <span>Link Down</span>
                  </div>
                </div>
              </div>

              <div className="topology-visualization" ref={networkContainer}></div>
            </>
          )}
        </div>

        <div className="topology-modal-footer">
          <button className="button button-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default NetworkTopologyModal;
