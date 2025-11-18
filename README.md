# Boost the Broadband

A single-page application for identifying and targeting customers eligible for broadband speed upgrades based on usage patterns, network capacity, and technology capabilities.

## Features

- Filter customers by OLT Device ID, technology type, and usage percentage
- Display eligible customers with detailed information
- Modern UI inspired by Frontier Communications design
- Responsive design for mobile and desktop
- Real-time data filtering and search

## Technology Stack

### Backend
- Node.js
- Express.js
- PostgreSQL (pg driver)
- CORS enabled

### Frontend
- React 18
- Axios for API calls
- Modern CSS with Frontier Communications-inspired styling

## Project Structure

```
boost-the-broadband/
├── backend/
│   ├── src/
│   │   ├── server.js       # Express server and API routes
│   │   └── db.js           # PostgreSQL connection configuration
│   ├── .env                # Environment variables
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js          # Main application component
│   │   ├── App.css         # Styling
│   │   ├── FilterSection.js # Filter component
│   │   ├── DataTable.js    # Data display component
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Base styles
│   └── package.json
└── README.md
```

## Database Configuration

The application connects to PostgreSQL with the following configuration:

- **Host:** 212.2.245.85
- **Port:** 6432
- **Database:** hackathon
- **Schema:** team_pulse_nest
- **User:** postgres
- **Password:** Tea_IWMZ5wuUta97gupb

### Database Tables Used

- `customers`
- `network_devices`
- `service_plans`
- `ts_metrics`
- `billing_history`
- `campaign_tracking`
- `upgrade_eligibility`
- `customer_satisfaction`
- `support_tickets`
- `network_topology_edges`
- `aggregation_switches`
- `oversubscription_standards`
- `kpi_summary`

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Access to PostgreSQL database

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. The `.env` file is already configured with database credentials

4. Start the backend server:
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000`

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

   The application will open in your browser at `http://localhost:3000`

## API Endpoints

### GET /api/health
Health check endpoint to verify API is running.

**Response:**
```json
{
  "status": "OK",
  "message": "Boost the Broadband API is running"
}
```

### GET /api/customers/eligible
Get eligible customers for broadband upgrade.

**Query Parameters:**
- `device_id` (optional): Filter by OLT device ID
- `technology` (optional): Filter by OLT technology (XGS-PON, 25XGS-PON)
- `min_usage` (optional): Minimum usage percentage (default: 50)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "olt": "DEV006293",
      "customer_id": "CUST001",
      "name": "Santosh Essam",
      "address": "7912 Cottonwood Ln",
      "phone": "8702753244",
      "email": "customer@example.com",
      "account_id": "ACC001",
      "current_download_mbps": "500",
      "avg_usage_percentage": "75.5",
      "avg_download_usage_mbps": "375.5",
      "olt_technology": "XGS-PON"
    }
  ]
}
```

### GET /api/devices
Get list of available OLT device IDs.

### GET /api/technologies
Get list of available OLT technologies.

## Usage

1. Start both backend and frontend servers (see Installation section)

2. Open your browser to `http://localhost:3000`

3. Use the filter section to search for eligible customers:
   - Select an OLT Device ID (optional)
   - Select a technology type (optional)
   - Set minimum usage percentage (default: 50%)
   - Click "Search" to filter results

4. View the results table showing:
   - Customer name and contact information
   - Current broadband speed
   - Usage percentage
   - Average download usage
   - OLT technology and device

5. Use "Reset Filters" to clear all filters and show all eligible customers

## Design Features

The UI is inspired by Frontier Communications website with:

- **Primary Color:** #ff0037 (Frontier Red)
- **Secondary Color:** #141928 (Dark Navy)
- **Accent Color:** #96fff5 (Cyan)
- **Modern card-based layout**
- **Responsive design** for all screen sizes
- **Smooth transitions** and hover effects
- **Professional typography** and spacing

## Development

### Backend Development

The backend uses Express.js with the following structure:

- `server.js`: Main server file with API routes
- `db.js`: PostgreSQL connection pool configuration

To add new API endpoints, edit [backend/src/server.js](backend/src/server.js)

### Frontend Development

The frontend uses React with functional components:

- `App.js`: Main application component
- `FilterSection.js`: Filter controls
- `DataTable.js`: Results display
- `App.css`: All styling

## Troubleshooting

### Backend won't start
- Verify PostgreSQL credentials in `.env` file
- Check if port 5000 is available
- Ensure all dependencies are installed

### Frontend won't connect to backend
- Verify backend is running on port 5000
- Check proxy configuration in `frontend/package.json`
- Look for CORS errors in browser console

### Database connection errors
- Verify database host is accessible
- Check firewall settings for port 6432
- Confirm database credentials are correct

## License

This project is proprietary and confidential.
