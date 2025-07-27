const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);

const uri = process.env.MONGO_URI;
const port = process.env.PORT || 5000;

mongoose.connect(uri)
  .then(() => console.log('Testing - Connected to MongoDB'))
  .catch(err => console.error('Testing - MongoDB connection failed:', err));

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createRoom', ({ roomId, config }) => {
    if (rooms.has(roomId)) {
      socket.emit('roomError', 'Room already exists');
      return;
    }

    rooms.set(roomId, {
      hostSocket: socket,
      guestSocket: null,
      hostReady: false,
      guestReady: false,
      question: null,
      config
    });

    socket.join(roomId);
    socket.emit('roomCreated', roomId);
  });

  socket.on('joinRoom', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('roomError', 'Room not found');
      return;
    }

    if (room.guestSocket) {
      socket.emit('roomError', 'Room already full');
      return;
    }

    room.guestSocket = socket;
    room.guestReady = false;
    socket.join(roomId);

    io.to(roomId).emit('roomReady', {
      roomId,
      config: room.config
    });
  });

  socket.on('playerReady', ({ roomId, question }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('roomError', 'Room not found');
      return;
    }

    if (socket === room.hostSocket) {
      room.hostReady = true;
    } else if (socket === room.guestSocket) {
      room.guestReady = true;
    }

    if (!room.question && question) {
      room.question = question;
    }

    if (room.hostReady && room.guestReady && room.question) {
      io.to(roomId).emit('startMatch', room.question);
      room.hostReady = false;
      room.guestReady = false;
      room.question = null;
    }
  });

  socket.on('playerSolved', ({ roomId }) => {
    io.to(roomId).emit('matchOver', {
      winnerSocket: socket.id
    });
  });

  socket.on('disconnect', () => {
    for (const [roomId, room] of rooms.entries()) {
      if (room.hostSocket === socket || room.guestSocket === socket) {
        io.to(roomId).emit('roomClosed');
        rooms.delete(roomId);
        break;
      }
    }
  });
});

// Start server WITH socket.io
httpServer.listen(3000, () => {
  console.log('🚀 Server on http://localhost:3000');
});
