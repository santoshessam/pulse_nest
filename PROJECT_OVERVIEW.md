# Boost the Broadband - Project Overview

## Application Summary

A full-stack single-page application designed to identify and target customers eligible for broadband speed upgrades based on real-time network utilization, customer usage patterns, and technology capabilities.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Port 3000)                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │           React Frontend (SPA)                    │  │
│  │  ┌─────────────┐  ┌──────────────┐              │  │
│  │  │ FilterSection│  │  DataTable   │              │  │
│  │  └─────────────┘  └──────────────┘              │  │
│  │          Axios HTTP Client                        │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/JSON
                     │
┌────────────────────▼────────────────────────────────────┐
│              Node.js Backend (Port 5000)                │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Express.js API                       │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │  /api/customers/eligible                     │ │  │
│  │  │  /api/devices                                │ │  │
│  │  │  /api/technologies                           │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  │              PostgreSQL Client (pg)               │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ SQL Queries
                     │
┌────────────────────▼────────────────────────────────────┐
│         PostgreSQL Database (212.2.245.85:6432)         │
│  ┌───────────────────────────────────────────────────┐  │
│  │     Database: hackathon                           │  │
│  │     Schema: team_pulse_nest                       │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │ Tables:                                      │ │  │
│  │  │  - customers                                 │ │  │
│  │  │  - network_topology_edges                    │ │  │
│  │  │  - oversubscription_standards                │ │  │
│  │  │  - service_plans                             │ │  │
│  │  │  - ... (and more)                            │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Dynamic Filtering
- Filter by OLT Device ID
- Filter by OLT Technology (XGS-PON, 25XGS-PON)
- Adjustable minimum usage percentage threshold
- Real-time search and results

### 2. Customer Data Display
Shows comprehensive customer information:
- Name and full address
- Contact details (phone, email)
- Account ID
- Current broadband speed (with visual badge)
- Usage percentage (color-coded by intensity)
- Average download usage
- OLT technology and device information

### 3. UI/UX Design
Inspired by Frontier Communications:
- Bold red (#ff0037) primary color
- Dark navy (#141928) for text
- Cyan (#96fff5) accent highlights
- Responsive design (mobile-first)
- Modern card-based layout
- Smooth animations and transitions

### 4. Database Query Logic
The core SQL query filters customers based on:
- Network link status (must be 'Up')
- OLT technology compatibility (XGS-PON, 25XGS-PON)
- Usage patterns (>50% average usage)
- LAG type matching with oversubscription standards
- Link utilization within acceptable limits

## File Structure

```
boost-the-broadband/
│
├── backend/                     # Node.js/Express Backend
│   ├── src/
│   │   ├── server.js           # API routes and Express setup
│   │   └── db.js               # PostgreSQL connection pool
│   ├── .env                    # Database credentials
│   └── package.json            # Backend dependencies
│
├── frontend/                    # React Frontend
│   ├── public/
│   │   └── index.html          # HTML template
│   ├── src/
│   │   ├── App.js              # Main application component
│   │   ├── App.css             # Frontier-inspired styling
│   │   ├── FilterSection.js    # Filter controls component
│   │   ├── DataTable.js        # Results display component
│   │   ├── index.js            # React entry point
│   │   └── index.css           # Base styles
│   └── package.json            # Frontend dependencies
│
├── package.json                # Root package.json (run both servers)
├── README.md                   # Comprehensive documentation
├── SETUP.md                    # Quick setup guide
├── PROJECT_OVERVIEW.md         # This file
└── .gitignore                  # Git ignore rules
```

## Data Flow

### 1. Initial Load
```
User opens browser
    → React app loads
    → Fetches initial customer data (no filters)
    → Fetches device list for dropdown
    → Fetches technology list for dropdown
    → Displays results in table
```

### 2. Filter & Search
```
User adjusts filters
    → Selects device ID / technology / usage %
    → Clicks "Search" button
    → Frontend sends GET request with query params
    → Backend constructs dynamic SQL query
    → PostgreSQL executes query
    → Results returned as JSON
    → Frontend updates table display
```

### 3. Reset Filters
```
User clicks "Reset Filters"
    → Clears all filter values
    → Fetches data with default parameters
    → Updates table display
```

## API Endpoints

### GET /api/health
**Purpose:** Health check endpoint
**Response:** Server status

### GET /api/customers/eligible
**Purpose:** Get eligible customers for upgrade
**Query Params:**
- `device_id` (optional)
- `technology` (optional)
- `min_usage` (optional)

**Response:** Array of customer objects

### GET /api/devices
**Purpose:** Get list of OLT device IDs
**Response:** Array of device IDs

### GET /api/technologies
**Purpose:** Get list of OLT technologies
**Response:** Array of technology types

## Technology Stack Details

### Frontend Technologies
- **React 18**: Modern React with hooks
- **Axios**: HTTP client for API calls
- **CSS3**: Modern styling with flexbox/grid
- **Create React App**: Build tooling

### Backend Technologies
- **Node.js**: JavaScript runtime
- **Express.js 4**: Web framework
- **pg (node-postgres)**: PostgreSQL client
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

### Database
- **PostgreSQL**: Relational database
- **Schema:** team_pulse_nest
- **Connection Pool**: Managed connections for performance

## Security Considerations

### Current Implementation
- CORS enabled for development
- Environment variables for sensitive data
- Connection pooling for database

### Production Recommendations
- Add authentication/authorization
- Implement rate limiting
- Use HTTPS/TLS
- Validate and sanitize inputs
- Use prepared statements (already implemented)
- Add API key authentication
- Implement logging and monitoring

## Performance Optimizations

1. **Database Connection Pool**: Reuses connections
2. **Efficient SQL Queries**: Uses indexes and proper joins
3. **React Component Structure**: Minimal re-renders
4. **Conditional Rendering**: Only shows data when available
5. **Responsive Design**: Mobile-optimized

## Customization Points

### To Change Colors
Edit [frontend/src/App.css](frontend/src/App.css):
```css
:root {
  --primary-red: #ff0037;      /* Change primary color */
  --secondary-dark: #141928;    /* Change text color */
  --tertiary-cyan: #96fff5;     /* Change accent color */
}
```

### To Modify SQL Query
Edit [backend/src/server.js](backend/src/server.js) in the `/api/customers/eligible` route.

### To Add New Filters
1. Add filter input in [frontend/src/FilterSection.js](frontend/src/FilterSection.js)
2. Update state management in FilterSection
3. Add query parameter in [backend/src/server.js](backend/src/server.js)
4. Update SQL WHERE clause

### To Add New Columns
1. Update SQL SELECT in [backend/src/server.js](backend/src/server.js)
2. Add table header in [frontend/src/DataTable.js](frontend/src/DataTable.js)
3. Add table cell in DataTable row mapping

## Deployment Considerations

### Frontend Deployment
- Build: `npm run build` in frontend directory
- Deploy build folder to static hosting (Netlify, Vercel, S3)
- Update API base URL for production

### Backend Deployment
- Use process manager (PM2)
- Set NODE_ENV=production
- Use reverse proxy (Nginx)
- Enable SSL/TLS
- Set up monitoring

### Database
- Current connection is to external PostgreSQL
- Ensure network security and firewall rules
- Consider VPN or private network access
- Regular backups recommended

## Future Enhancements

1. **Export Functionality**: Export filtered results to CSV/Excel
2. **Email Campaign**: Send upgrade offers directly
3. **Analytics Dashboard**: Visualize upgrade statistics
4. **Customer History**: Track upgrade offer responses
5. **Predictive Analytics**: ML model for upgrade likelihood
6. **Multi-language Support**: i18n implementation
7. **Dark Mode**: Theme switching
8. **Advanced Filters**: Date ranges, speed tiers
9. **Bulk Actions**: Select multiple customers
10. **Real-time Updates**: WebSocket for live data

## Testing Recommendations

### Backend Testing
- Unit tests for API routes
- Integration tests for database queries
- Load testing for performance

### Frontend Testing
- Component unit tests (React Testing Library)
- E2E tests (Cypress or Playwright)
- Accessibility testing (axe-core)

## Support & Maintenance

### Logs Location
- Backend: Console output or configure winston logger
- Frontend: Browser console (F12)

### Common Issues
1. **Port conflicts**: Change ports in .env (backend) or package.json (frontend)
2. **Database connection**: Verify credentials and network access
3. **CORS errors**: Check backend CORS configuration

### Monitoring
- Add logging middleware (morgan, winston)
- Set up error tracking (Sentry)
- Monitor API response times
- Track database query performance

## Credits

**Design Inspiration:** Frontier Communications
**Technology Stack:** MERN-style architecture (with PostgreSQL)
**Purpose:** Targeted broadband upgrade campaign

---

For detailed setup instructions, see [SETUP.md](SETUP.md)
For comprehensive documentation, see [README.md](README.md)
