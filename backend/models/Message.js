const mongoose = require('mongoose');

// models/Message.js
const messageSchema = new mongoose.Schema({
  from: String,
  to: String,
  text: String,
  type: String,
  fileUrl: String,
  fileName: String,
  date: { type: Date, default: Date.now },
  deletedFor: { type: [String], default: [] } // <-- add this
});

module.exports = mongoose.model('Message', messageSchema);