const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Tournament Schema
const tournamentSchema = new mongoose.Schema({
  name: String,
  ground: String,
  teams: Number,
  matches: Number,
  startDate: String,
  endDate: String,
  createdByEmail: String,
  icon: {
    data: Buffer,
    contentType: String
  }
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

// GET all tournaments or by creator email
router.get('/', async (req, res) => {
  try {
    const { createdByEmail } = req.query;
    let query = {};
    if (createdByEmail) {
      query.createdByEmail = createdByEmail;
    }
    const tournaments = await Tournament.find(query);
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /tournaments/create (no auth required, as original)
router.post('/create', upload.single('icon'), async (req, res) => {
  try {
    const { name, ground, teams, matches, startDate, endDate, createdByEmail } = req.body;
    const tournament = new Tournament({
      name,
      ground,
      teams: Number(teams),
      matches: Number(matches),
      startDate,
      endDate,
      createdByEmail,
      icon: req.file
        ? {
            data: req.file.buffer,
            contentType: req.file.mimetype
          }
        : undefined
    });
    await tournament.save();
    res.json({ success: true, tournament });
  } catch (err) {
    console.error('Error creating tournament:', err);
    res.status(500).json({ error: 'Error creating tournament' });
  }
});

// Get tournament by ID
router.get('/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    res.json(tournament);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tournament/:id/icon
router.post('/:id/icon', upload.single('icon'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    tournament.icon = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };
    await tournament.save();
    res.status(200).json({ message: 'Icon uploaded successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/tournament/:id/icon
router.get('/:id/icon', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament || !tournament.icon || !tournament.icon.data) {
      return res.status(404).json({ message: 'Icon not found' });
    }
    res.set('Content-Type', tournament.icon.contentType);
    res.send(tournament.icon.data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/tournament/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Tournament.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    res.json({ message: 'Tournament deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Example search endpoint
router.get('/search', async (req, res) => {
  const { name } = req.query;
  const tournaments = await Tournament.find({
    name: { $regex: name || '', $options: 'i' }
  });
  res.json(tournaments);
});

module.exports = router;
