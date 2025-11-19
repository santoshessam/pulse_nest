import React from 'react';
import './EmailMessageModal.css';

function EmailMessageModal({ customer, onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target.className === 'email-modal-backdrop') {
      onClose();
    }
  };

  // Define speed tiers in Mbps
  const speedTiers = [500, 1000, 2000, 5000, 7000];

  // Get current speed and find next available tier
  const currentSpeed = customer.current_download_mbps;
  const nextSpeedTier = speedTiers.find(tier => tier > currentSpeed) || currentSpeed;

  // Format speed display (convert Mbps to readable format)
  const formatSpeed = (mbps) => {
    if (mbps >= 1000) {
      return `${mbps / 1000}G`;
    }
    return `${mbps}M`;
  };

  // Check if 5G can be sold based on constraint
  const canSell5G = customer.avg_usage_percentage <= 50;

  // Generate upgrade recommendations
  const getUpgradeRecommendations = () => {
    let recommendations = [];
    const availableTiers = speedTiers.filter(tier => tier > currentSpeed);

    availableTiers.forEach((tier, index) => {
      // Skip 5G (5000M) if usage exceeds 50%
      if (tier === 5000 && !canSell5G) {
        return;
      }

      const timeframe = index === 0 ? '1 month' : index === 1 ? '2 months' : `${index + 1} months`;
      recommendations.push(`• ${formatSpeed(tier)} - Recommended for ${timeframe}`);
    });

    return recommendations.join('\n');
  };

  // Build capacity notes message
  const capacityNotesMessage = customer.capacity_notes
    ? `\n\nIMPORTANT: ${customer.capacity_notes}`
    : '';

  const emailMessage = `Dear ${customer.name},

We noticed that your current internet usage is at ${customer.avg_usage_percentage}%, which is above 50% of your current plan capacity.

Current Plan Details:
• Speed: ${formatSpeed(currentSpeed)}
• Usage: ${customer.avg_usage_percentage}%
• Status: High usage detected

To ensure you continue to enjoy the best online experience, we recommend upgrading your internet speed.

Recommended Upgrade Options:
${getUpgradeRecommendations()}${capacityNotesMessage}

Click the link below to explore our faster plans and upgrade today!`;

  const smsMessage = `Hi ${customer.name}! Your internet usage is at ${customer.avg_usage_percentage}% on your ${formatSpeed(currentSpeed)} plan. Upgrade to ${formatSpeed(nextSpeedTier)} for better experience! Visit: https://www.frontier.com/upgrade`;

  return (
    <div className="email-modal-backdrop" onClick={handleBackdropClick}>
      <div className="email-modal-content">
        <div className="email-modal-header">
          <div className="header-content">
            <div className="frontier-logo">FRONTIER</div>
            <h2>Send Upgrade Notification</h2>
          </div>
          <button className="email-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="email-modal-body">
          <div className="customer-info-banner">
            <h3>{customer.name}</h3>
            <p>Current Usage: <strong className="usage-highlight">{customer.avg_usage_percentage}%</strong></p>
            <p>Current Speed: <strong>{customer.current_download_mbps}M</strong></p>
          </div>

          <div className="message-section">
            <h4>📧 Email Message</h4>
            <div className="message-preview">
              <div className="message-header">
                <strong>To:</strong> {customer.email || 'N/A'}
              </div>
              <div className="message-header">
                <strong>Subject:</strong> Upgrade Your Internet Speed - Better Experience Awaits!
              </div>
              <div className="message-body">
                {emailMessage}
              </div>
              <div className="message-link">
                <a href="#" onClick={(e) => e.preventDefault()}>
                  🔗 https://www.frontier.com/upgrade?id={customer.account_id}
                </a>
              </div>
            </div>
          </div>

          <div className="message-section">
            <h4>📱 SMS Message</h4>
            <div className="message-preview sms-preview">
              <div className="message-header">
                <strong>To:</strong> {customer.phone || 'N/A'}
              </div>
              <div className="message-body">
                {smsMessage}
              </div>
            </div>
          </div>

          <div className="action-options">
            <h4>Available Actions</h4>
            <div className="action-buttons">
              <button className="action-btn email-btn" onClick={(e) => e.preventDefault()}>
                📧 Send Email
              </button>
              <button className="action-btn sms-btn" onClick={(e) => e.preventDefault()}>
                📱 Send SMS
              </button>
              <button className="action-btn both-btn" onClick={(e) => e.preventDefault()}>
                📧📱 Send Both
              </button>
            </div>
            <p className="action-note">
              * This is a preview only. No actual messages will be sent.
            </p>
          </div>
        </div>

        <div className="email-modal-footer">
          <button className="button button-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailMessageModal;
