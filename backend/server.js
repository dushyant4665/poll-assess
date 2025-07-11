import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import Poll from './models/Poll.js';

// New: Vote model
const VoteSchema = new mongoose.Schema({
  pollId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true },
  optionIdx: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Vote = mongoose.model('Vote', VoteSchema);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/realtime-voting', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create poll
app.post('/api/polls', async (req, res) => {
  const { question, options } = req.body;
  if (!question || !options || options.length < 2) {
    return res.status(400).json({ error: 'Invalid poll data' });
  }
  const poll = new Poll({ question, options: options.map(text => ({ text })) });
  await poll.save();
  res.json({ id: poll._id });
});

// Get poll (with live vote counts)
app.get('/api/polls/:id', async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) return res.status(404).json({ error: 'Poll not found' });
  // Aggregate votes for each option
  const votes = await Vote.find({ pollId: poll._id });
  const optionCounts = Array(poll.options.length).fill(0);
  votes.forEach(v => { optionCounts[v.optionIdx]++; });
  const options = poll.options.map((opt, idx) => ({ text: opt.text, votes: optionCounts[idx] }));
  res.json({ _id: poll._id, question: poll.question, options, createdAt: poll.createdAt });
});

// Vote (store only the selected option)
app.post('/api/polls/:id/vote', async (req, res) => {
  const { optionIdx } = req.body;
  const poll = await Poll.findById(req.params.id);
  if (!poll || optionIdx == null || optionIdx < 0 || optionIdx >= poll.options.length) {
    return res.status(400).json({ error: 'Invalid vote' });
  }
  await Vote.create({ pollId: poll._id, optionIdx });
  // Aggregate votes for real-time update
  const votes = await Vote.find({ pollId: poll._id });
  const optionCounts = Array(poll.options.length).fill(0);
  votes.forEach(v => { optionCounts[v.optionIdx]++; });
  const options = poll.options.map((opt, idx) => ({ text: opt.text, votes: optionCounts[idx] }));
  const pollData = { _id: poll._id, question: poll.question, options, createdAt: poll.createdAt };
  io.to(poll._id.toString()).emit('voteUpdate', pollData);
  res.json({ success: true });
});

// Real-time updates
io.on('connection', (socket) => {
  socket.on('joinPoll', (pollId) => {
    socket.join(pollId);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log('Server running on port', PORT);
}); 