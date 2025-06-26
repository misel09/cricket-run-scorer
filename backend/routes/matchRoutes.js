const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Player Schema
const playerSchema = new mongoose.Schema({
  name: String,
  profilePic: String,
  email: String
}, { _id: false });

// Match Schema
const matchSchema = new mongoose.Schema({
  teamA: { type: String, required: true },
  teamB: { type: String, required: true },
  ground: { type: String, required: true },
  date: { type: String, required: true },
  overs: { type: Number, required: true },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  teamAPlayers: { type: [playerSchema], default: [] }, // <-- update here
  teamBPlayers: { type: [playerSchema], default: [] }, // <-- update here
  playingSquadA: [{ email: String, name: String }],
  playingSquadB: [{ email: String, name: String }],
  joinCode: { type: String, required: true },
  teamAIcon: {
    data: Buffer,
    contentType: String
  },
  teamBIcon: {
    data: Buffer,
    contentType: String
  }
});

const Match = mongoose.model('Match', matchSchema);

// Create Match (no auth for simplicity, add if needed)
router.post('/', async (req, res) => {
  try {
    const { teamA, teamB, ground, date, overs, createdBy, teamAIcon, teamBIcon } = req.body;
    if (!teamA || !teamB || !ground || !date || !overs) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Helper to parse base64 image
    function parseBase64Image(base64) {
      if (!base64) return undefined;
      const matches = base64.match(/^data:(.+);base64,(.+)$/);
      if (!matches) return undefined;
      return {
        data: Buffer.from(matches[2], 'base64'),
        contentType: matches[1]
      };
    }

    const newMatch = new Match({
      teamA,
      teamB,
      ground,
      date,
      overs,
      createdBy,
      joinCode: generateJoinCode(),
      teamAIcon: parseBase64Image(teamAIcon),
      teamBIcon: parseBase64Image(teamBIcon)
    });

    await newMatch.save();

    // Send back base64 for frontend preview
    const matchObj = newMatch.toObject();
    matchObj.teamAIcon = newMatch.teamAIcon?.data
      ? `data:${newMatch.teamAIcon.contentType};base64,${newMatch.teamAIcon.data.toString('base64')}`
      : null;
    matchObj.teamBIcon = newMatch.teamBIcon?.data
      ? `data:${newMatch.teamBIcon.contentType};base64,${newMatch.teamBIcon.data.toString('base64')}`
      : null;

    res.json(matchObj);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all matches
router.get('/', async (req, res) => {
  try {
    const matches = await Match.find().sort({ createdAt: -1 }).lean();
    // Convert icons for each match
    matches.forEach(match => {
      match.teamAIcon = match.teamAIcon?.data
        ? `data:${match.teamAIcon.contentType};base64,${match.teamAIcon.data.toString('base64')}`
        : null;
      match.teamBIcon = match.teamBIcon?.data
        ? `data:${match.teamBIcon.contentType};base64,${match.teamBIcon.data.toString('base64')}`
        : null;
    });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get latest match
router.get('/latest', async (req, res) => {
  try {
    const match = await Match.findOne().sort({ createdAt: -1 });
    if (!match) return res.status(404).json({ message: 'No match found' });
    res.json({ match });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add player to a team
router.post('/:matchId/join', async (req, res) => {
  const { team, playerName } = req.body;
  const { matchId } = req.params;
  if (!team || !playerName) {
    return res.status(400).json({ message: 'Team and playerName are required' });
  }
  try {
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    if (match.isFinished) {
      return res.status(400).json({ message: 'This match is finished. Joining is closed.' });
    }

    // Ensure players array exists for each team
    if (!match[team + 'Players']) match[team + 'Players'] = [];
    // Prevent duplicate
    if (!match[team + 'Players'].includes(playerName)) {
      match[team + 'Players'].push(playerName);
      await match.save();
    }
    res.json({ success: true, message: `${playerName} joined ${team}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/join-by-code', async (req, res) => {
  try {
    const { joinCode, playerName, email, team } = req.body;
    if (!joinCode || !playerName || !email || !team) return res.status(400).json({ message: 'All fields required' });

    const match = await Match.findOne({ joinCode });
    if (!match) return res.status(404).json({ message: 'Invalid join code' });

    // Prevent joining both teams
    const alreadyInA = (match.teamAPlayers || []).some(p => p.email === email);
    const alreadyInB = (match.teamBPlayers || []).some(p => p.email === email);
    if (alreadyInA || alreadyInB) {
      return res.status(400).json({ message: 'You have already joined a team in this match.' });
    }

    // Fetch user's profilePic as base64
    let profilePic = '';
    try {
      const user = await User.findOne({ email });
      if (user && user.profilePic && user.profilePic.data) {
        profilePic = `data:${user.profilePic.contentType};base64,${user.profilePic.data.toString('base64')}`;
      }
    } catch (e) {
      // Error fetching user profilePic, ignore for now
    }

    if (team === 'teamA') {
      match.teamAPlayers.push({ email, name: playerName });
    } else if (team === 'teamB') {
      match.teamBPlayers.push({ email, name: playerName });
    } else {
      return res.status(400).json({ message: 'Invalid team selected.' });
    }

    await match.save();
    return res.json({ success: true, message: `Joined team ${match[team]}`, teamName: match[team] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update team names for existing matches
router.post('/update-team-names', async (req, res) => {
  try {
    await Match.updateMany({ teamA: "team a" }, { $set: { teamA: "Mumbai Indians" } });
    await Match.updateMany({ teamB: "team b" }, { $set: { teamB: "Chennai Super Kings" } });
    res.json({ message: 'Team names updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/created-by/:email', async (req, res) => {
  try {
    const matches = await Match.find({ createdBy: req.params.email }).lean();
    matches.forEach(match => {
      match.teamAIcon = match.teamAIcon?.data
        ? `data:${match.teamAIcon.contentType};base64,${match.teamAIcon.data.toString('base64')}`
        : null;
      match.teamBIcon = match.teamBIcon?.data
        ? `data:${match.teamBIcon.contentType};base64,${match.teamBIcon.data.toString('base64')}`
        : null;
    });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 1. Place this FIRST (before /:id)
router.get('/by-code/:joinCode', async (req, res) => {
  const { joinCode } = req.params;
  const match = await Match.findOne({ joinCode }).lean();
  if (!match) return res.status(404).json({ message: 'Match not found' });
  // Convert icons to base64 if needed
  match.teamAIcon = match.teamAIcon?.data
    ? `data:${match.teamAIcon.contentType};base64,${match.teamAIcon.data.toString('base64')}`
    : null;
  match.teamBIcon = match.teamBIcon?.data
    ? `data:${match.teamBIcon.contentType};base64,${match.teamBIcon.data.toString('base64')}`
    : null;
  res.json(match);
});

// 2. Then your /:id route
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).lean();
    if (!match) return res.status(404).json({ error: 'Match not found' });

    match.teamAIcon = match.teamAIcon?.data
      ? `data:${match.teamAIcon.contentType};base64,${match.teamAIcon.data.toString('base64')}`
      : null;
    match.teamBIcon = match.teamBIcon?.data
      ? `data:${match.teamBIcon.contentType};base64,${match.teamBIcon.data.toString('base64')}`
      : null;

    res.json(match);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a match
router.delete('/:matchId', async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.matchId);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json({ message: 'Match deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Remove player from a team
router.post('/:matchId/remove-player', async (req, res) => {
  const { team, email } = req.body;
  if (!team || !email) return res.status(400).json({ message: 'Team and email required' });
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (!['teamA', 'teamB'].includes(team)) return res.status(400).json({ message: 'Invalid team' });

    match[team + 'Players'] = (match[team + 'Players'] || []).filter(p => p.email !== email);
    await match.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get matches by player email
router.get('/my-matches/:email', async (req, res) => {
  try {
    const matches = await Match.find({
      $or: [
        { 'teamAPlayers.email': req.params.email },
        { 'teamBPlayers.email': req.params.email }
      ]
    }).lean();

    // Convert icons to base64 for each match
    matches.forEach(match => {
      match.teamAIcon = match.teamAIcon?.data
        ? `data:${match.teamAIcon.contentType};base64,${match.teamAIcon.data.toString('base64')}`
        : null;
      match.teamBIcon = match.teamBIcon?.data
        ? `data:${match.teamBIcon.contentType};base64,${match.teamBIcon.data.toString('base64')}`
        : null;
    });

    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Example join code generator
function generateJoinCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Example in your userRoutes.js or similar
router.get('/user/by-email/:email', async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// Example for Express.js
router.get('/api/matches/:id', async (req, res) => {
  const match = await Match.findById(req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found' });
  res.json(match);
});

router.post('/:matchId/set-squad', async (req, res) => {
  const { matchId } = req.params;
  const { teamA, teamB } = req.body; // teamA and teamB are arrays of emails

  try {
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    // Find player objects for selected emails
    match.playingSquadA = match.teamAPlayers.filter(p => teamA.includes(p.email));
    match.playingSquadB = match.teamBPlayers.filter(p => teamB.includes(p.email));

    await match.save();
    res.json({ success: true, match });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
