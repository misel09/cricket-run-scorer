// server/models/Player.js
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  runs: {
    type: Number,
    default: 0
  },
  wickets: {
    type: Number,
    default: 0
  },
  overs: {
    type: Number,
    default: 0
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team', // Reference to the Team model
    required: true
  }
});

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;
