const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/land-registry';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Land Schema
const landSchema = new mongoose.Schema({
  ownerWallet: {
    type: String,
    required: true,
  },
  coordinatesCID: {
    type: String,
  },
  documentCID: {
    type: String,
  },
  areaSqMeters: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['Provisional', 'Approved', 'Finalized', 'Disputed'],
    default: 'Provisional',
  },
  history: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Land Model
const Land = mongoose.model('Land', landSchema);

// REST API Endpoints

// POST /api/lands - Add a new land
app.post('/api/lands', async (req, res) => {
  try {
    const land = new Land(req.body);
    await land.save();
    res.status(201).json(land);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/lands - List all lands
app.get('/api/lands', async (req, res) => {
  try {
    const lands = await Land.find();
    res.json(lands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/lands/:id - Get a single land by ID
app.get('/api/lands/:id', async (req, res) => {
  try {
    // Validate that the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid land ID format' });
    }
    
    const land = await Land.findById(req.params.id);
    if (!land) {
      return res.status(404).json({ error: 'Land not found' });
    }
    res.json(land);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/lands/:id - Update a land
app.put('/api/lands/:id', async (req, res) => {
  try {
    // Validate that the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid land ID format' });
    }
    
    const land = await Land.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!land) {
      return res.status(404).json({ error: 'Land not found' });
    }
    res.json(land);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/lands/:id - Delete a land
app.delete('/api/lands/:id', async (req, res) => {
  try {
    // Validate that the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid land ID format' });
    }
    
    const land = await Land.findByIdAndDelete(req.params.id);
    if (!land) {
      return res.status(404).json({ error: 'Land not found' });
    }
    res.json({ message: 'Land deleted successfully', land });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
