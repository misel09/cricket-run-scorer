// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = 5000;

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.use(cors()); // Allow all origins by default
app.use('/uploads', express.static('uploads'));

// Middleware
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
   profilePic: {
    data: Buffer,
    contentType: String
  },
  name: String,
  email: { type: String, unique: true },
  password: String,
  mobile: String,
  gender: String,
  playingRole: String,
  battingStyle: String,
  bowlingStyle: String,
  dob: String,
  address: String,
  followers: { type: Number, default: 0 },
  following: { type: Number, default: 0 },
  followersList: { type: [String], default: [] }, // <-- add this
  followingList: { type: [String], default: [] }, // <-- add this
  matchesPlayed: { type: Number, default: 0 },
  notifications: [
    {
      followerEmail: String,
      followerName: String,
      followerProfilePic: String,
      date: { type: Date, default: Date.now }
    }
  ],
});

const matchRoutes = require('./routes/matchRoutes');
app.use('/api/matches', require('./routes/matchRoutes'));

const User = mongoose.model('User', userSchema);

app.post('/user/:email/profile-pic', upload.single('profilePic'), async (req, res) => {
  const { email } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profilePic = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };

    await user.save();

    res.status(200).json({ message: 'Profile picture uploaded successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/user/:email/profile-pic', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user || !user.profilePic || !user.profilePic.data) {
      return res.status(404).json({ message: 'Profile picture not found' });
    }

    res.set('Content-Type', user.profilePic.contentType);
    res.send(user.profilePic.data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Register Endpoint
app.post('/register', async (req, res) => {
  const { name, email, password, mobile } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, mobile });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login Endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: 'Invalid email or password' });

    res.status(200).json({ message: 'Login successful', user }); // Frontend will use user.email
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get User by Email Endpoint
app.get('/user/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    let userObj = user.toObject();
    if (user.profilePic && user.profilePic.data) {
      userObj.profilePic = `data:${user.profilePic.contentType};base64,${user.profilePic.data.toString('base64')}`;
    } else {
      userObj.profilePic = null;
    }

    res.json(userObj);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update User Endpoint
app.put('/user/:email', async (req, res) => {
  const { email } = req.params;
  const update = req.body;
  try {
    const user = await User.findOneAndUpdate({ email }, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.put('/user/:email/profile-pic', async (req, res) => {
  const { email } = req.params;
  const { profilePic } = req.body;

  if (!profilePic) {
    return res.status(400).json({ message: 'No profilePic provided' });
  }

  const matches = profilePic.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    return res.status(400).json({ message: 'Invalid image format' });
  }
  const contentType = matches[1];
  const base64Data = matches[2];

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profilePic = {
      data: Buffer.from(base64Data, 'base64'),
      contentType: contentType,
    };

    await user.save();
    res.status(200).json({ message: 'Profile picture uploaded successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

const LoginHistory = require('./models/LoginHistory');

app.get('/matches', async (req, res) => {
  const { playerName } = req.query;
  if (!playerName) {
    return res.status(400).json({ message: 'playerName query required' });
  }
  try {
    // Find matches where the playerName is in the players array (case-insensitive)
    const matches = await Match.find({ players: { $regex: new RegExp(playerName, 'i') } });
    res.json({ matches });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Search users by name (case-insensitive)
// Search users by name (case-insensitive)
app.get('/search/users', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ message: 'Name query is required' });

  try {
    const users = await User.find({
      name: { $regex: new RegExp(name, 'i') }
    }).select('-password');

    // Convert profilePic buffer to base64 string for each user
    const usersWithPic = users.map(user => {
      const userObj = user.toObject();
      if (userObj.profilePic && userObj.profilePic.data) {
        userObj.profilePic = `data:${userObj.profilePic.contentType};base64,${userObj.profilePic.data.toString('base64')}`;
      } else {
        userObj.profilePic = null;
      }
      return userObj;
    });

    res.json(usersWithPic);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Follow/Unfollow Endpoint
app.post('/user/:email/follow', async (req, res) => {
  const { email } = req.params; // The user who is following
  const { followEmail } = req.body; // The user to be followed

  if (!followEmail) {
    return res.status(400).json({ success: false, message: 'followEmail is required' });
  }
  if (email === followEmail) {
    return res.status(400).json({ success: false, message: 'You cannot follow yourself.' });
  }

  try {
    const user = await User.findOne({ email });
    const target = await User.findOne({ email: followEmail });

    if (!user || !target) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Already following? Unfollow
    if (user.followingList.includes(followEmail)) {
      user.followingList = user.followingList.filter(e => e !== followEmail);
      target.followersList = target.followersList.filter(e => e !== email);
      user.following = Math.max(0, user.following - 1);
      target.followers = Math.max(0, target.followers - 1);

      // Remove notification
      target.notifications = (target.notifications || []).filter(
        n => n.followerEmail !== email
      );

      await user.save();
      await target.save();
      return res.json({ success: true, message: `Unfollowed ${target.name || followEmail}`, unfollowed: true });
    }

    // Not following? Follow
    user.followingList.push(followEmail);
    target.followersList.push(email);
    user.following += 1;
    target.followers += 1;

    // Defensive: ensure notifications array exists
    if (!Array.isArray(target.notifications)) {
      target.notifications = [];
    }

    // Defensive: handle profilePic
    let followerProfilePic = null;
    if (user.profilePic && user.profilePic.data && user.profilePic.contentType) {
      followerProfilePic = `data:${user.profilePic.contentType};base64,${user.profilePic.data.toString('base64')}`;
    }

    // Add notification to the target user
    target.notifications.push({
      followerEmail: user.email,
      followerName: user.name,
      followerProfilePic,
      date: new Date(),
      read: false // <-- add this line
    });

    await user.save();
    await target.save();

    res.json({ success: true, message: `You are now following ${target.name || followEmail}`, unfollowed: false });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});



// Check if following endpoint (for frontend button state)
app.get('/user/:email/isFollowing/:followEmail', async (req, res) => {
  const { email, followEmail } = req.params;
  const user = await User.findOne({ email });
  if (!user) return res.json({ isFollowing: false });
  res.json({ isFollowing: user.followingList.includes(followEmail) });
});

app.get('/user/:email/notifications', async (req, res) => {
  const user = await User.findOne({ email: req.params.email }).select('notifications');
  if (!user) return res.json([]);
  res.json(user.notifications || []);
});

// Example: Express route for marking all notifications as read
app.post('/user/:email/notifications/markAllRead', async (req, res) => {
  const email = req.params.email;
  const user = await User.findOne({ email });
  if (!user) return res.json({ success: false, message: 'User not found' });

  // Mark all notifications as read
  if (Array.isArray(user.notifications)) {
    user.notifications.forEach(n => n.read = true);
  }
  await user.save();

  res.json({ success: true });
});

const Message = require('./models/Message');
// Fetch chat between two users
app.get('/chat', async (req, res) => {
  const { user1, user2 } = req.query;
  if (!user1 || !user2) return res.status(400).json([]);
  const messages = await Message.find({
    $or: [
      { from: user1, to: user2 },
      { from: user2, to: user1 }
    ],
    deletedFor: { $ne: user1 } // Only show messages not deleted for this user
  }).sort({ date: 1 });
  res.json(messages);
});

// Send a message
app.post('/chat', async (req, res) => {
  const { from, to, text } = req.body;
  if (!from || !to || !text) return res.status(400).json({ success: false });
  const msg = new Message({ from, to, text });
  await msg.save();
  res.json({ success: true, message: msg });
});

// Send a file message
app.post('/chat/file', upload.single('file'), async (req, res) => {
  const { from, to, type } = req.body;
  if (!from || !to || !req.file || !type) return res.status(400).json({ success: false });

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  const msg = new Message({
    from,
    to,
    type,
    fileUrl,
    fileName: req.file.originalname,
    date: new Date()
  });
  await msg.save();
  res.json({ success: true, message: msg });
});

// Get chat list for a user (sidebar preview)
app.get('/chat-list/:email', async (req, res) => {
  const email = req.params.email;
  // Find all messages where user is sender or receiver and not deleted for user
  const messages = await Message.find({
    $or: [{ from: email }, { to: email }],
    deletedFor: { $ne: email }
  }).sort({ date: -1 });

  // Group by chat partner
  const chatMap = {};
  for (const msg of messages) {
    const partner = msg.from === email ? msg.to : msg.from;
    if (!chatMap[partner]) {
      chatMap[partner] = {
        email: partner,
        lastMessage: msg.text || msg.fileName || msg.type,
        lastDate: msg.date,
      };
    }
  }

  // Fetch user info for each chat partner
  const partnerEmails = Object.keys(chatMap);
  const users = await User.find({ email: { $in: partnerEmails } }).select('email name profilePic');
  users.forEach(user => {
    chatMap[user.email].name = user.name;
    if (user.profilePic && user.profilePic.data) {
      chatMap[user.email].profilePic = `data:${user.profilePic.contentType};base64,${user.profilePic.data.toString('base64')}`;
    } else {
      chatMap[user.email].profilePic = null;
    }
  });

  res.json(Object.values(chatMap));
});

// DELETE /chat/message/:msgId
app.delete('/chat/message/:msgId', async (req, res) => {
  const { msgId } = req.params;
  const { userEmail } = req.body;

  const msg = await Message.findById(msgId);
  if (!msg) return res.status(404).json({ success: false });

  if (msg.from === userEmail) {
    // Sender deletes: remove for both
    await Message.deleteOne({ _id: msgId });
  } else {
    // Receiver deletes: remove only for this user (e.g., add to a "deletedFor" array)
    if (!msg.deletedFor) msg.deletedFor = [];
    if (!msg.deletedFor.includes(userEmail)) {
      msg.deletedFor.push(userEmail);
      await msg.save();
    }
  }
  res.json({ success: true });
});

// Tournament routes
app.use('/api/tournament', require('./routes/tournaments'));

app.get('/search/tournaments', async (req, res) => {
  const name = req.query.name?.toLowerCase() || '';
  // Replace with your DB query logic
  const tournaments = await Tournament.find({
    name: { $regex: name, $options: 'i' }
  }).select('name startDate'); // Only return name and startDate
  res.json(tournaments);
});

app.get('/search/tournamentsByGround', async (req, res) => {
  try {
    const { ground } = req.query;
    if (!ground) return res.json([]);
    const tournaments = await Tournament.find({
      ground: { $regex: ground, $options: 'i' }
    });
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Tournament Schema
const tournamentSchema = new mongoose.Schema({
  name: String,
  startDate: String, // or Date if you store as Date
  // add other fields as needed
});
const Tournament = mongoose.models.Tournament || mongoose.model('Tournament', tournamentSchema);

const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: '*' }
});

// Listen for connections
io.on('connection', (socket) => {
  // Join a room for each user (by email)
  socket.on('join', (userEmail) => {
    socket.join(userEmail);
  });

  // Relay message to recipient
  socket.on('send_message', (msg) => {
    // msg should include: { from, to, ... }
    io.to(msg.to).emit('receive_message', msg);
  });
});

// Add this route to fetch user by email
app.get('/api/user/by-email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear chat and remove from chat list for user
app.delete('/chat/clear/:userEmail/:otherEmail', async (req, res) => {
  const { userEmail, otherEmail } = req.params;
  try {
    // Mark all messages between the two users as deleted for userEmail
    await Message.updateMany(
      {
        $or: [
          { from: userEmail, to: otherEmail },
          { from: otherEmail, to: userEmail }
        ],
        deletedFor: { $ne: userEmail }
      },
      { $push: { deletedFor: userEmail } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

