# Land Management REST API

A Node.js REST API for managing land records using Express and MongoDB with Mongoose.

## Features

- ✅ Complete CRUD operations for land records
- ✅ MongoDB integration with Mongoose ODM
- ✅ CORS enabled for cross-origin requests
- ✅ JSON body parsing middleware
- ✅ Input validation for MongoDB ObjectIds
- ✅ Field whitelisting for secure updates
- ✅ Comprehensive test coverage

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (optional):
```bash
export MONGODB_URI="mongodb://localhost:27017/land-registry"
export PORT=3001
```

## Running the Server

```bash
npm run server
```

The server will start on port 3001 (or the port specified in the PORT environment variable).

## API Endpoints

### 1. Add a New Land

**POST** `/api/lands`

Request body:
```json
{
  "ownerWallet": "0x123abc",
  "coordinatesCID": "QmCID123",
  "documentCID": "QmDoc456",
  "areaSqMeters": 1000,
  "status": "Provisional",
  "history": ["Created on 2024-11-01"]
}
```

Response (201 Created):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "ownerWallet": "0x123abc",
  "coordinatesCID": "QmCID123",
  "documentCID": "QmDoc456",
  "areaSqMeters": 1000,
  "status": "Provisional",
  "history": ["Created on 2024-11-01"],
  "createdAt": "2024-11-01T10:30:00.000Z"
}
```

### 2. List All Lands

**GET** `/api/lands`

Response (200 OK):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "ownerWallet": "0x123abc",
    "coordinatesCID": "QmCID123",
    "documentCID": "QmDoc456",
    "areaSqMeters": 1000,
    "status": "Provisional",
    "history": ["Created on 2024-11-01"],
    "createdAt": "2024-11-01T10:30:00.000Z"
  }
]
```

### 3. Get a Single Land by ID

**GET** `/api/lands/:id`

Response (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "ownerWallet": "0x123abc",
  "coordinatesCID": "QmCID123",
  "documentCID": "QmDoc456",
  "areaSqMeters": 1000,
  "status": "Approved",
  "history": ["Created on 2024-11-01", "Approved by Tehsildar"],
  "createdAt": "2024-11-01T10:30:00.000Z"
}
```

Error Response (404 Not Found):
```json
{
  "error": "Land not found"
}
```

Error Response (400 Bad Request):
```json
{
  "error": "Invalid land ID format"
}
```

### 4. Update a Land

**PUT** `/api/lands/:id`

Request body (all fields optional):
```json
{
  "status": "Approved",
  "history": ["Created on 2024-11-01", "Approved by Tehsildar"],
  "coordinatesCID": "QmNewCID",
  "documentCID": "QmNewDoc",
  "areaSqMeters": 1200
}
```

Response (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "ownerWallet": "0x123abc",
  "coordinatesCID": "QmNewCID",
  "documentCID": "QmNewDoc",
  "areaSqMeters": 1200,
  "status": "Approved",
  "history": ["Created on 2024-11-01", "Approved by Tehsildar"],
  "createdAt": "2024-11-01T10:30:00.000Z"
}
```

**Note:** The `ownerWallet` and `createdAt` fields cannot be updated for security reasons.

### 5. Delete a Land

**DELETE** `/api/lands/:id`

Response (200 OK):
```json
{
  "message": "Land deleted successfully",
  "land": {
    "_id": "507f1f77bcf86cd799439011",
    "ownerWallet": "0x123abc",
    "status": "Provisional",
    ...
  }
}
```

## Data Schema

### Land Record

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| ownerWallet | String | Yes | - | Wallet address of the land owner |
| coordinatesCID | String | No | - | IPFS CID for coordinates data |
| documentCID | String | No | - | IPFS CID for land documents |
| areaSqMeters | Number | No | - | Land area in square meters |
| status | String (Enum) | No | "Provisional" | Land status: Provisional, Approved, Finalized, or Disputed |
| history | Array of Strings | No | [] | History of land transactions/changes |
| createdAt | Date | No | Current date/time | Timestamp of record creation |

## Running Tests

```bash
npm test
```

This will run the comprehensive test suite covering all API endpoints.

## Security Features

- **Input Validation:** All MongoDB ObjectIds are validated before querying
- **Field Whitelisting:** Only specific fields can be updated via the PUT endpoint
- **Schema Validation:** Mongoose schema validation with required fields and enum constraints
- **Error Handling:** Proper error messages and HTTP status codes

## Security Considerations

### Known Limitations

1. **No Rate Limiting:** This basic implementation does not include rate limiting. For production use, consider adding middleware like `express-rate-limit` to prevent abuse.

2. **No Authentication:** There is no authentication or authorization. In production, implement:
   - JWT or session-based authentication
   - Role-based access control (RBAC)
   - API key validation

3. **Environment Variables:** Always use environment variables for sensitive data like database URIs and never commit them to version control.

### Recommended Production Enhancements

```bash
npm install express-rate-limit helmet express-validator
```

Example rate limiting setup:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/land-registry |
| PORT | Server port | 3001 |

## License

MIT
