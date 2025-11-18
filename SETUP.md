# Quick Setup Guide

Follow these steps to get the "Boost the Broadband" application running:

## Step 1: Install Dependencies

### Option A: Install All at Once (Recommended)
```bash
npm run install:all
```

### Option B: Install Separately
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## Step 2: Verify Database Configuration

The database credentials are already configured in `backend/.env`:

```
DB_HOST=212.2.245.85
DB_PORT=6432
DB_USER=postgres
DB_PASSWORD=Tea_IWMZ5wuUta97gupb
DB_NAME=hackathon
DB_SCHEMA=team_pulse_nest
```

If you need to change these, edit the `backend/.env` file.

## Step 3: Start the Application

### Option A: Run Both Servers Together (Recommended)
```bash
npm start
```

This will start both the backend (port 5000) and frontend (port 3000) servers.

### Option B: Run Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## Step 4: Access the Application

Once both servers are running:

1. Open your browser to: **http://localhost:3000**
2. The backend API will be running on: **http://localhost:5000**

## Step 5: Test the Application

1. The page should load with the Frontier-inspired red header "Boost the Broadband"
2. Use the filter section to search for customers:
   - Try selecting different OLT Device IDs
   - Filter by technology (XGS-PON or 25XGS-PON)
   - Adjust minimum usage percentage
3. Click "Search" to see results
4. Click "Reset Filters" to clear all filters

## Troubleshooting

### If the backend won't start:
- Check if port 5000 is already in use
- Verify database connection (host: 212.2.245.85:6432)
- Check the backend terminal for error messages

### If the frontend won't start:
- Check if port 3000 is already in use
- Try clearing node_modules and reinstalling: `rm -rf node_modules && npm install`

### If you see "No eligible customers found":
- Try adjusting the filters
- Check the browser console (F12) for API errors
- Verify the backend is running and accessible

### Database connection issues:
- Ensure the database server at 212.2.245.85 is accessible
- Check your network/firewall settings for port 6432
- Verify credentials in `backend/.env`

## API Testing

You can test the API directly:

```bash
# Health check
curl http://localhost:5000/api/health

# Get all eligible customers
curl http://localhost:5000/api/customers/eligible

# Filter by device
curl "http://localhost:5000/api/customers/eligible?device_id=DEV006293"

# Get available devices
curl http://localhost:5000/api/devices

# Get available technologies
curl http://localhost:5000/api/technologies
```

## Development Mode

For development with auto-reload on both servers:

```bash
npm run dev
```

This uses nodemon for the backend (auto-restarts on file changes) and React's development server for the frontend.

## Next Steps

- Customize the styling in `frontend/src/App.css`
- Add more filters or features in `frontend/src/FilterSection.js`
- Modify the query logic in `backend/src/server.js`
- Add authentication or additional API endpoints

## Support

For issues or questions, check:
- The main [README.md](README.md) for detailed documentation
- Backend logs in the terminal running the backend
- Browser console (F12) for frontend errors
- Network tab in browser DevTools for API call inspection
