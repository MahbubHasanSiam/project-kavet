require('dotenv').config();
console.log('MONGO_URI:', process.env.MONGO_URI);
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// --- MongoDB Models ---
const messageSchema = new mongoose.Schema({
  username: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// --- Routes ---
app.get('/', (req, res) => res.send('Kavet API is running.'));
app.get('/messages', async (req, res) => {
  const msgs = await Message.find().sort({createdAt: 1}).limit(100);
  res.json(msgs);
});

// --- Socket.io ---
io.on('connection', (socket) => {
  socket.on('send_message', async (data) => {
    const msg = new Message({ username: data.username, text: data.text });
    await msg.save();
    io.emit('receive_message', msg);
  });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => server.listen(PORT, () => console.log(`Server running on ${PORT}`)))
  .catch(err => console.error('MongoDB connection error:', err));