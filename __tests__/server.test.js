// Test file for server.js API endpoints
const request = require('supertest');
const mongoose = require('mongoose');

// Mock mongoose to avoid actual DB connection
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue({}),
  };
});

describe('Land Management API', () => {
  let app;
  let Land;

  beforeAll(() => {
    // Suppress console logs during tests
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Load the app after mocking mongoose
    app = require('../server.js');
    Land = mongoose.model('Land');
  });

  afterAll(async () => {
    // Close any open handles
    if (mongoose.connection && mongoose.connection.close) {
      await mongoose.connection.close();
    }
  });

  describe('POST /api/lands', () => {
    it('should create a new land with all fields', async () => {
      const mockLand = {
        _id: '507f1f77bcf86cd799439011',
        ownerWallet: '0x123abc',
        coordinatesCID: 'QmCID123',
        documentCID: 'QmDoc456',
        areaSqMeters: 1000,
        status: 'Provisional',
        history: ['Created'],
        createdAt: new Date(),
      };

      // Mock the save method
      Land.prototype.save = jest.fn().mockResolvedValue(mockLand);

      const response = await request(app)
        .post('/api/lands')
        .send({
          ownerWallet: '0x123abc',
          coordinatesCID: 'QmCID123',
          documentCID: 'QmDoc456',
          areaSqMeters: 1000,
          history: ['Created'],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('ownerWallet', '0x123abc');
    });

    it('should return 400 if ownerWallet is missing', async () => {
      Land.prototype.save = jest.fn().mockRejectedValue(
        new Error('Land validation failed: ownerWallet: Path `ownerWallet` is required.')
      );

      const response = await request(app)
        .post('/api/lands')
        .send({
          coordinatesCID: 'QmCID123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/lands', () => {
    it('should return all lands', async () => {
      const mockLands = [
        {
          _id: '507f1f77bcf86cd799439011',
          ownerWallet: '0x123abc',
          status: 'Provisional',
          createdAt: new Date(),
        },
        {
          _id: '507f1f77bcf86cd799439012',
          ownerWallet: '0x456def',
          status: 'Approved',
          createdAt: new Date(),
        },
      ];

      Land.find = jest.fn().mockResolvedValue(mockLands);

      const response = await request(app).get('/api/lands');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /api/lands/:id', () => {
    it('should return a single land by ID', async () => {
      const mockLand = {
        _id: '507f1f77bcf86cd799439011',
        ownerWallet: '0x123abc',
        status: 'Finalized',
        createdAt: new Date(),
      };

      Land.findById = jest.fn().mockResolvedValue(mockLand);

      const response = await request(app).get('/api/lands/507f1f77bcf86cd799439011');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ownerWallet', '0x123abc');
    });

    it('should return 404 if land not found', async () => {
      Land.findById = jest.fn().mockResolvedValue(null);

      const response = await request(app).get('/api/lands/507f1f77bcf86cd799439011');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Land not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app).get('/api/lands/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid land ID format');
    });
  });

  describe('PUT /api/lands/:id', () => {
    it('should update a land', async () => {
      const mockUpdatedLand = {
        _id: '507f1f77bcf86cd799439011',
        ownerWallet: '0x123abc',
        status: 'Approved',
        createdAt: new Date(),
      };

      Land.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedLand);

      const response = await request(app)
        .put('/api/lands/507f1f77bcf86cd799439011')
        .send({ status: 'Approved' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'Approved');
    });

    it('should return 404 if land not found', async () => {
      Land.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .put('/api/lands/507f1f77bcf86cd799439011')
        .send({ status: 'Approved' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Land not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .put('/api/lands/invalid-id')
        .send({ status: 'Approved' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid land ID format');
    });
  });

  describe('DELETE /api/lands/:id', () => {
    it('should delete a land', async () => {
      const mockDeletedLand = {
        _id: '507f1f77bcf86cd799439011',
        ownerWallet: '0x123abc',
        status: 'Provisional',
      };

      Land.findByIdAndDelete = jest.fn().mockResolvedValue(mockDeletedLand);

      const response = await request(app).delete('/api/lands/507f1f77bcf86cd799439011');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Land deleted successfully');
    });

    it('should return 404 if land not found', async () => {
      Land.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      const response = await request(app).delete('/api/lands/507f1f77bcf86cd799439011');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Land not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app).delete('/api/lands/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid land ID format');
    });
  });
});
