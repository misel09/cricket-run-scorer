// server/controllers/matchController.js
const Match = require('../models/Match');

// Controller function to get all matches
const getAllMatches = async (req, res) => {
  try {
    const matches = await Match.find();  // Fetch all matches from the database
    res.status(200).json(matches);  // Send matches as the response
  } catch (err) {
    res.status(500).json({ message: 'Error fetching matches', error: err });
  }
};

// Controller function to create a match
const createMatch = async (req, res) => {
  const { team1, team2 } = req.body;  // Extract teams from the request body

  try {
    const newMatch = new Match({
      team1,
      team2,
      score: { team1: 0, team2: 0 },  // Initialize scores to 0
      status: 'ongoing',  // Match is ongoing by default
    });
    await newMatch.save();  // Save the new match to the database
    res.status(201).json(newMatch);  // Respond with the created match
  } catch (err) {
    res.status(500).json({ message: 'Error creating match', error: err });
  }
};

// Controller function to get a specific match by ID
const getMatch = async (req, res) => {
  const matchId = req.params.matchId;

  try {
    const match = await Match.findById(matchId);  // Find match by ID
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.status(200).json(match);  // Respond with the found match
  } catch (err) {
    res.status(500).json({ message: 'Error fetching match', error: err });
  }
};

// Controller function to update score of a match
const updateScore = async (req, res) => {
  const matchId = req.params.matchId;
  const { team1, team2 } = req.body;

  try {
    const match = await Match.findByIdAndUpdate(matchId, {
      $set: { score: { team1, team2 } }
    }, { new: true });  // Update the match score

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.status(200).json(match);  // Respond with the updated match
  } catch (err) {
    res.status(500).json({ message: 'Error updating score', error: err });
  }
};

// Controller function to end the match
const endMatch = async (req, res) => {
  const matchId = req.params.matchId;

  try {
    const match = await Match.findByIdAndUpdate(matchId, {
      $set: { status: 'ended' }
    }, { new: true });  // Update match status to ended

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.status(200).json(match);  // Respond with the ended match
  } catch (err) {
    res.status(500).json({ message: 'Error ending match', error: err });
  }
};

// Controller function to search matches based on criteria
const searchMatches = async (req, res) => {
  const { teamName } = req.query;  // Get team name from query string

  try {
    const matches = await Match.find({
      $or: [{ 'team1.name': teamName }, { 'team2.name': teamName }]  // Find matches with either team1 or team2 matching the search query
    });

    res.status(200).json(matches);  // Respond with the matches found
  } catch (err) {
    res.status(500).json({ message: 'Error searching matches', error: err });
  }
};

module.exports = {
  getAllMatches,
  createMatch,
  getMatch,
  updateScore,
  endMatch,
  searchMatches
};
