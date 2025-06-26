const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  team1: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  team2: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  team1Score: { type: Number, default: 0 },
  team2Score: { type: Number, default: 0 },
  overs: { type: Number, required: true },
  status: { type: String, default: 'ongoing' },  // 'ongoing', 'completed'
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
