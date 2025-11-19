# Boost the Broadband - Version 2 (V2)

This is Version 2 of the Boost the Broadband application with an enhanced eligibility query that includes uplink topology analysis.

## Key Differences from V1

### V1 (Original Version)
- **Location**: `backend/` and `frontend/`
- **Backend Port**: 5000
- **Frontend Port**: 3000
- **Eligibility Query**: Uses `network_topology_edges` only
- **Filter Criteria**: Based on OLT link utilization only

### V2 (Enhanced Version)
- **Location**: `backend-v2/` and `frontend-v2/`
- **Backend Port**: 5001
- **Frontend Port**: 3001 (when running)
- **Eligibility Query**: Uses CTE with `uplink_topology_edges` + `network_topology_edges`
- **Filter Criteria**: Includes uplink utilization filtering (< 91%)

## V2 Query Enhancements

### New Features in V2 Query:

1. **Uplink Topology Integration**
   - Queries `uplink_topology_edges` table via CTE (Common Table Expression)
   - Calculates average uplink utilization and bandwidth per ULT

2. **Additional Filtering**
   - Adds uplink utilization filter: `avg_uplink_utilization_percentage < 91`
   - Ensures customers are only eligible if uplink capacity is available

3. **Enhanced Data**
   - Returns uplink utilization metrics alongside OLT metrics
   - Provides `avg_uplink_utilization_percentage`
   - Provides `total_uplink_bandwidth_gbps`

### V2 Query Structure:

```sql
WITH uplink AS (
  SELECT
    ute.child_device_id as ULT,
    AVG(ute.link_utilization_percentage) as avg_uplink_utilization_percentage,
    AVG(ute.link_bandwidth_gbps) as total_uplink_bandwidth_gbps
  FROM team_pulse_nest.uplink_topology_edges ute
  GROUP BY ute.child_device_id
)
SELECT
  nte.child_device_id as OLT,
  AVG(nte.link_utilization_percentage) as avg_link_utilization_percentage,
  AVG(nte.link_bandwidth_gbps) as total_link_bandwidth_gbps,
  u.avg_uplink_utilization_percentage,
  u.total_uplink_bandwidth_gbps,
  -- ... customer details ...
FROM team_pulse_nest.network_topology_edges nte
JOIN uplink u ON u.ult = nte.parent_device_id
JOIN team_pulse_nest.oversubscription_standards os ON os.lag_type = nte.lag_type
JOIN team_pulse_nest.customers c ON c.device_id = nte.child_device_id
WHERE nte.link_status = 'Up'
  AND c.olt_technology IN ('XGS-PON', '25XGS-PON')
  AND CAST(c.avg_usage_percentage AS FLOAT) > 50
  AND u.avg_uplink_utilization_percentage < 91  -- NEW FILTER
  AND c.account_status = 'Active'
  -- ... additional filters ...
```

## Installation & Setup

### Backend V2 Setup

1. Navigate to backend-v2:
```bash
cd backend-v2
```

2. Install dependencies:
```bash
npm install
```

3. Ensure `.env` file exists with PORT=5001:
```env
DB_HOST=your_database_host
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
PORT=5001
```

4. Start backend-v2:
```bash
npm start
```

Server will run on `http://localhost:5001`

### Frontend V2 Setup

1. Navigate to frontend-v2:
```bash
cd frontend-v2
```

2. Install dependencies:
```bash
npm install
```

3. Set custom port (optional - to run alongside V1):
```bash
set PORT=3001 && npm start
```

Application will open at `http://localhost:3001`

## Running Both Versions Simultaneously

You can run V1 and V2 side-by-side for comparison:

### Terminal 1 - V1 Backend:
```bash
cd backend
npm start
# Runs on port 5000
```

### Terminal 2 - V1 Frontend:
```bash
cd frontend
npm start
# Runs on port 3000
```

### Terminal 3 - V2 Backend:
```bash
cd backend-v2
npm start
# Runs on port 5001
```

### Terminal 4 - V2 Frontend:
```bash
cd frontend-v2
set PORT=3001 && npm start
# Runs on port 3001
```

Now you can access:
- **V1**: http://localhost:3000
- **V2**: http://localhost:3001

## Database Requirements

V2 requires an additional table that V1 does not use:

### Required Tables:
- `team_pulse_nest.customers` (same as V1)
- `team_pulse_nest.network_topology_edges` (same as V1)
- `team_pulse_nest.oversubscription_standards` (same as V1)
- **`team_pulse_nest.uplink_topology_edges`** ⭐ NEW FOR V2

### uplink_topology_edges Schema:
The table should contain:
- `child_device_id` - ULT identifier
- `link_utilization_percentage` - Uplink utilization percentage
- `link_bandwidth_gbps` - Uplink bandwidth in Gbps

## Key Implementation Changes

### Backend Changes (server.js)

**Lines 24-31**: Added CTE for uplink topology
```javascript
WITH uplink AS (
  SELECT
    ute.child_device_id as ULT,
    AVG(ute.link_utilization_percentage) as avg_uplink_utilization_percentage,
    AVG(ute.link_bandwidth_gbps) as total_uplink_bandwidth_gbps
  FROM team_pulse_nest.uplink_topology_edges ute
  GROUP BY ute.child_device_id
)
```

**Line 59**: Added uplink JOIN
```javascript
JOIN uplink u ON u.ult = nte.parent_device_id
```

**Line 65**: Added uplink utilization filter
```javascript
AND u.avg_uplink_utilization_percentage < 91
```

**Lines 107-108**: Added uplink fields to GROUP BY
```javascript
u.avg_uplink_utilization_percentage,
u.total_uplink_bandwidth_gbps,
```

### Frontend Changes

- Updated `proxy` in package.json from port 5000 to 5001
- All other frontend code remains identical to V1

## API Differences

### V2 API Response

The V2 API returns additional fields in the customer eligibility response:

```json
{
  "success": true,
  "count": 42,
  "data": [
    {
      "olt": "OLT-001",
      "avg_link_utilization_percentage": 45.2,
      "avg_uplink_utilization_percentage": 78.5,  ← NEW
      "total_uplink_bandwidth_gbps": 100,         ← NEW
      "customer_id": "100000989",
      "name": "Robert King",
      // ... rest of customer data
    }
  ]
}
```

## When to Use V1 vs V2

### Use V1 When:
- You only need OLT-level capacity analysis
- Uplink topology data is not available
- Simpler eligibility criteria is sufficient

### Use V2 When:
- You need comprehensive network capacity analysis
- Uplink utilization is a concern
- You want to ensure end-to-end network capacity before upgrades
- You have `uplink_topology_edges` data available

## Troubleshooting V2

### Backend Won't Start

**Port Conflict:**
```bash
# Check if port 5001 is in use
netstat -ano | findstr :5001

# Kill the process if needed
taskkill //PID <PID> //F
```

**Missing uplink_topology_edges Table:**
```
Error: relation "team_pulse_nest.uplink_topology_edges" does not exist
```

**Solution**: Ensure the `uplink_topology_edges` table exists in your database or modify the query to use available tables.

### No Customers Showing in V2

V2 has stricter criteria than V1:
- All V1 criteria must be met
- **PLUS** uplink utilization must be < 91%

If no customers appear, check:
1. Uplink utilization values in database
2. Whether uplink data exists for your OLTs
3. If the 91% threshold needs adjustment

## Migration Path

To migrate from V1 to V2:

1. **Database**: Ensure `uplink_topology_edges` table exists and is populated
2. **Test**: Run V2 alongside V1 to compare results
3. **Adjust**: Fine-tune the uplink utilization threshold (currently 91%)
4. **Switch**: Once validated, point production to V2

## Support

For V2-specific issues:
- Check that `uplink_topology_edges` table exists
- Verify uplink utilization data is current
- Compare V2 results with V1 to understand filtering differences
- Review query execution plans for performance

---

**Version**: 2.0.0
**Last Updated**: November 2025
**Based On**: Boost the Broadband V1.0.0
