# Boost the Broadband

A comprehensive full-stack web application for Frontier Communications that identifies and manages customers eligible for broadband speed upgrades based on usage patterns, network capacity, and technology capabilities.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## Overview

Boost the Broadband helps telecommunications network engineers identify customers who are eligible for broadband speed upgrades by analyzing customer usage patterns, network topology, and available capacity to make data-driven upgrade recommendations.

### Key Capabilities

- Smart customer eligibility filtering with 7+ filter options
- Bulk customer selection and offer management
- Network topology visualization
- Automated promotional offer tracking
- Customer communication routing by preference
- Real-time data refresh and updates

## Features

### Customer Eligibility Management

- **Advanced Filtering System**
  - Filter by OLT Device ID
  - Filter by technology type (XGS-PON, 25XGS-PON)
  - Minimum usage percentage filter (customizable)
  - Current speed filters (25M to 7G)
  - Exact speed matching option
  - Last offer date tracking (7, 30, 60, 90 days)

- **Automatic Eligibility Criteria**
  - Active account status required
  - Network link must be "Up"
  - Customer usage > 50% of current speed
  - No upgrades in the last 6 months
  - No promotional offers in the last 2 months (configurable)

### Data Visualization & Management

- **Interactive Customer Data Table**
  - Sortable columns (usage %, OLT usage %)
  - Pagination (10 records per page)
  - Color-coded usage indicators (high/medium/normal)
  - Speed badge formatting (M/G notation)
  - Contact preference badges
  - Real-time data refresh after bulk operations

- **Network Topology Visualization**
  - Interactive network diagram using vis-network
  - Visual representation of OLT connections
  - Bandwidth and utilization metrics
  - LAG type information
  - Device relationship mapping

### Customer Communication

- **Bulk Selection & Offer Management**
  - Multi-select customers via checkboxes
  - Select all/deselect all functionality
  - Bulk upgrade offer sending
  - Automatic last_promo_offer_date updates
  - Communication routing by preference (email/phone/text)
  - Success/error message feedback
  - Automatic table refresh after sending

- **Individual Customer Notifications**
  - Custom email/SMS message preview
  - Personalized upgrade recommendations
  - Contact preference-based delivery options
  - Send via email, SMS, or both

### Customer Details

- **Comprehensive Customer View Modal**
  - Full account information
  - Service details and current speeds
  - Usage statistics and trends
  - Upgrade history with dates
  - Promotional offer history
  - Device and technology information
  - Contact preferences

## Technology Stack

### Backend
- **Node.js** 18+ - Runtime environment
- **Express.js** - Web application framework
- **pg (node-postgres)** - PostgreSQL database client
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** 18.x - UI framework with hooks
- **Axios** - HTTP client for API requests
- **Vis-Network** - Network topology visualization library
- **CSS3** - Modern styling with Frontier branding

### Database
- **PostgreSQL** 12.x+ - Relational database
- **Schema**: `team_pulse_nest`

## Project Structure

```
boost-broadband/
├── backend/
│   ├── src/
│   │   ├── server.js                    # Main server with API routes
│   │   └── db.js                        # PostgreSQL connection pool
│   ├── debug-customer.js                # Customer debugging utility
│   ├── populate-contact-preference.js   # Data population script
│   ├── package.json
│   └── .env                            # Environment variables (not in repo)
│
├── frontend/
│   ├── src/
│   │   ├── App.js                      # Main application component
│   │   ├── App.css                     # Global styles
│   │   ├── FilterSection.js            # Filter controls component
│   │   ├── DataTable.js                # Customer data table
│   │   ├── CustomerModal.js            # Customer details modal
│   │   ├── CustomerModal.css
│   │   ├── NetworkTopologyModal.js     # Network visualization modal
│   │   ├── NetworkTopologyModal.css
│   │   ├── EmailMessageModal.js        # Email/SMS notification modal
│   │   ├── EmailMessageModal.css
│   │   ├── index.js                    # React entry point
│   │   └── index.css                   # Base styles
│   ├── public/
│   │   └── index.html
│   └── package.json
│
└── README.md                           # This file
```

## Installation

### Prerequisites

- Node.js 18.x or higher
- npm package manager
- PostgreSQL 12.x or higher
- Access to the team_pulse_nest database

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your database credentials:
```env
DB_HOST=your_database_host
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
PORT=5000
```

4. Start the backend server:
```bash
npm start
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

Application will open at `http://localhost:3000`

## Configuration

### Environment Variables (Backend)

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=your_postgres_host
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_database_name

# Server Configuration
PORT=5000
```

### Database Schema

The application uses the `team_pulse_nest` schema with the following key tables:

**customers** - Customer records with usage metrics
- customer_id, first_name, last_name, email, phone, address
- current_download_mbps, current_upload_mbps
- avg_usage_percentage, avg_download_usage_mbps
- device_id, olt_technology, account_status
- last_upgrade_date, last_promo_offer_date, contact_preference

**network_topology_edges** - Network connection data
- parent_device_id, child_device_id
- link_status, link_bandwidth_gbps, link_utilization_percentage
- lag_type

**oversubscription_standards** - Network capacity thresholds
- lag_type, max_utilization_pct, notes

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### GET /api/health
Health check to verify server status.

**Response:**
```json
{
  "status": "OK",
  "message": "Boost the Broadband API is running"
}
```

### GET /api/customers/eligible
Retrieves customers eligible for broadband upgrades based on filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `device_id` | string | Filter by specific OLT device ID |
| `technology` | string | XGS-PON or 25XGS-PON |
| `min_usage` | number | Minimum usage percentage (default: 50) |
| `current_speed` | number | Current speed in Mbps |
| `exact_speed_match` | boolean | Match exact speed vs minimum |
| `last_offer_days` | number | Filter by offer recency (7, 30, 60, 90) |

**Response:**
```json
{
  "success": true,
  "count": 42,
  "data": [
    {
      "customer_id": "100000989",
      "name": "Robert King",
      "address": "123 Main St",
      "phone": "555-1234",
      "email": "robert.king@email.com",
      "account_id": "100000989",
      "current_download_mbps": 100,
      "avg_usage_percentage": 75.5,
      "avg_download_usage_mbps": 75.5,
      "olt": "OLT-001",
      "olt_technology": "XGS-PON",
      "avg_link_utilization_percentage": 45.2,
      "last_upgrade_date": null,
      "last_promo_offer_date": "2025-07-02",
      "contact_preference": "email",
      "capacity_notes": null
    }
  ]
}
```

### GET /api/customers/:accountId
Retrieves detailed information for a specific customer.

**Response:**
```json
{
  "success": true,
  "data": {
    "customer_id": "100000989",
    "first_name": "Robert",
    "last_name": "King",
    "email": "robert.king@email.com",
    "phone": "555-1234",
    "address": "123 Main St",
    "account_status": "Active",
    "current_download_mbps": 100,
    "avg_usage_percentage": 75.5,
    "olt_technology": "XGS-PON",
    "last_upgrade_date": null,
    "last_promo_offer_date": "2025-07-02",
    "contact_preference": "email"
  }
}
```

### POST /api/customers/bulk-send-offer
Sends upgrade offers to multiple customers and updates their last offer dates.

**Request Body:**
```json
{
  "customerIds": ["100000989", "100000990", "100000991"]
}
```

**Response:**
```json
{
  "success": true,
  "sent": 3,
  "message": "Successfully sent upgrade offers to 3 customer(s)",
  "breakdown": {
    "email": 2,
    "phone": 1,
    "text": 0
  }
}
```

### GET /api/devices
Returns list of all available OLT devices.

**Response:**
```json
{
  "success": true,
  "data": [
    { "device_id": "OLT-001" },
    { "device_id": "OLT-002" }
  ]
}
```

### GET /api/technologies
Returns list of available network technologies.

**Response:**
```json
{
  "success": true,
  "data": [
    { "technology": "XGS-PON" },
    { "technology": "25XGS-PON" }
  ]
}
```

### GET /api/topology/:deviceId
Retrieves network topology data for visualization.

**Response:**
```json
{
  "success": true,
  "data": {
    "device_id": "OLT-001",
    "edges": [...],
    "metrics": {...}
  }
}
```

## Usage Guide

### Finding Eligible Customers

1. **Initial Load**
   - Application automatically loads eligible customers on startup
   - Default view shows customers not contacted in 2+ months

2. **Apply Filters**
   - **OLT Device ID**: Select specific device from dropdown
   - **Technology**: Choose XGS-PON or 25XGS-PON
   - **Minimum Usage %**: Set threshold (default: 50%)
   - **Current Speed**: Filter by speed tier (25M - 7G)
   - **Exact Speed Match**: Toggle for exact vs minimum speed
   - **Last Offer Date**: Track recent campaigns (7/30/60/90 days)

3. **Search & Reset**
   - Click "Search" to apply filters
   - Click "Reset Filters" to clear all selections

### Viewing Customer Details

- Click customer name to open detailed modal
- View complete profile, usage stats, and history
- See upgrade and promotional offer history

### Sending Upgrade Offers

**Individual Customer:**
1. Click customer's email address
2. Review personalized message preview
3. Select communication method (Email/SMS/Both)
4. System routes based on contact_preference

**Bulk Sending:**
1. Use checkboxes to select customers
2. Click "Select All" for all visible customers
3. Click "Send Upgrade Offer" button
4. System automatically:
   - Sends via each customer's preferred method
   - Updates last_promo_offer_date to current date
   - Refreshes table with updated data

### Network Topology Visualization

- Click topology button (📊) next to OLT device
- View interactive network diagram
- Explore bandwidth and utilization metrics

### Filter Behavior Notes

- **No last_offer_days filter**: Shows eligible customers (not contacted in 2+ months)
- **With last_offer_days filter (7/30/60/90)**: Shows customers contacted WITHIN that timeframe
- Filter overrides base 2-month exclusion rule for tracking purposes

## Development

### Backend Architecture

**server.js** (Main API Server)
- Express.js REST API with 7 endpoints
- PostgreSQL connection pooling
- CORS-enabled for local development
- Conditional eligibility filtering logic
- Bulk operations with database updates

**db.js** (Database Configuration)
- PostgreSQL connection pool
- Environment variable configuration
- Connection error handling

### Frontend Architecture

**App.js** (Main Component)
- State management for customers, modals, filters
- API integration via axios
- Modal management for 3 modal types
- Device selection and filtering coordination

**DataTable.js** (Customer Table)
- Pagination (10 per page)
- Sortable columns
- Checkbox selection with select-all
- Bulk action bar with status messages
- Color-coded usage indicators
- Automatic refresh after bulk operations

**FilterSection.js** (Filter Controls)
- 6 filter types with validation
- Device and technology dropdowns
- Speed filtering with exact match toggle
- Last offer date tracking
- Reset functionality

**CustomerModal.js** (Customer Details)
- Full customer profile display
- Usage statistics and trends
- Historical data (upgrades, offers)

**NetworkTopologyModal.js** (Topology View)
- vis-network integration
- Interactive graph visualization
- Network metrics display

**EmailMessageModal.js** (Notification Preview)
- Personalized message generation
- Multi-channel delivery options
- Contact preference routing

### Development Commands

**Backend:**
```bash
cd backend
npm start                    # Start server
node debug-customer.js       # Debug specific customer
node populate-contact-preference.js  # Populate data
```

**Frontend:**
```bash
cd frontend
npm start                    # Start dev server
```

### Adding New Features

1. **New API Endpoint**: Add route in `backend/src/server.js`
2. **New Filter**: Update `FilterSection.js` state and query building in `App.js`
3. **New Modal**: Create component and add state management in `App.js`
4. **Database Changes**: Update queries in server.js

## Troubleshooting

### Backend Won't Start

**Port Already in Use:**
```bash
# Find process on port 5000
netstat -ano | findstr :5000

# Kill the process (Windows)
taskkill //PID <PID> //F

# Restart backend
cd backend && npm start
```

**Database Connection Errors:**
- Verify PostgreSQL is running
- Check `.env` file credentials
- Test database connectivity:
  ```bash
  psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d <DB_NAME>
  ```
- Confirm `team_pulse_nest` schema exists

**Missing Dependencies:**
```bash
cd backend
rm -rf node_modules
npm install
```

### Frontend Issues

**Can't Connect to Backend:**
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify API calls are using correct URL
- Clear browser cache and refresh

**Filters Not Working:**
- Backend must be restarted after code changes
- Check browser Network tab for API errors
- Verify query parameters are being sent

**Table Not Refreshing After Bulk Send:**
- Confirm `onRefresh` prop is passed to DataTable
- Check browser console for errors
- Verify backend successfully updated dates

### Data Issues

**Customer Shows in Wrong Filter:**
- Run debug script to verify dates:
  ```bash
  cd backend
  node debug-customer.js
  ```
- Check conditional filter logic in server.js
- Verify date comparisons use CURRENT_DATE

**No Customers Showing:**
- Check base eligibility criteria:
  - Account status = 'Active'
  - Link status = 'Up'
  - Usage > 50%
  - Technology = XGS-PON or 25XGS-PON
- Verify database has data in team_pulse_nest schema
- Check for query errors in backend console

### Development Tips

**Restart Both Servers:**
```bash
# Kill and restart backend
taskkill //PID <PID> //F && cd backend && npm start

# Frontend usually hot-reloads, but if needed:
cd frontend && npm start
```

**Debug Customer Data:**
Modify `debug-customer.js` with specific customer ID to investigate data issues.

**Clear Application State:**
- Clear browser cache
- Remove and reinstall node_modules if needed
- Check for console errors in browser DevTools

## Key Implementation Notes

### Eligibility Logic

Customers are eligible when ALL conditions are met:
1. Account status is "Active"
2. Network link status is "Up"
3. OLT technology is XGS-PON or 25XGS-PON
4. Usage percentage > 50% of current speed
5. No upgrades in last 6 months OR last_upgrade_date is NULL
6. No offers in last 2 months OR last_promo_offer_date is NULL (unless filtering by specific timeframe)

### Filter Override Behavior

The `last_offer_days` filter has special behavior:
- **Not set**: Base rule applies (exclude customers contacted within 2 months)
- **Set (7/30/60/90)**: Overrides base rule to show customers contacted WITHIN that timeframe
- This allows tracking recent campaigns while maintaining eligibility rules

### Bulk Operations Flow

1. User selects customers via checkboxes
2. Clicks "Send Upgrade Offer"
3. Backend queries customer details and contact preferences
4. System logs communication routing (email/phone/text)
5. Updates `last_promo_offer_date` to CURRENT_DATE for all selected customers
6. Returns success with breakdown by communication method
7. Frontend automatically refreshes table to show updated dates

## Support & Contribution

For questions or issues:
- Check this documentation first
- Review code comments in source files
- Test with debug utilities provided
- Check browser and server console logs

## License

Proprietary - Frontier Communications

---

**Last Updated:** November 2025
**Version:** 1.0.0
