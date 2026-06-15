module.exports = (io) => {
  const rooms = {};

  io.on('connection', (socket) => {
    socket.on('join-room', ({ roomId, userId, userName }) => {
      socket.join(roomId);
      if (!rooms[roomId]) rooms[roomId] = [];
      rooms[roomId] = rooms[roomId].filter(u => u.userId !== userId);
      rooms[roomId].push({ userId, userName, socketId: socket.id });
      socket.to(roomId).emit('user-joined', { userId, userName });
      io.to(roomId).emit('room-users', rooms[roomId]);
    });

    socket.on('chat-message', ({ roomId, userId, userName, message }) => {
      io.to(roomId).emit('chat-message', { userId, userName, message, timestamp: new Date() });
    });

    socket.on('raise-hand', ({ roomId, userId, userName }) => {
      socket.to(roomId).emit('hand-raised', { userId, userName });
    });

    socket.on('leave-room', ({ roomId, userId }) => {
      socket.leave(roomId);
      if (rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter(u => u.userId !== userId);
        io.to(roomId).emit('user-left', { userId });
        io.to(roomId).emit('room-users', rooms[roomId]);
      }
    });

    socket.on('disconnect', () => {
      Object.keys(rooms).forEach(roomId => {
        const user = rooms[roomId]?.find(u => u.socketId === socket.id);
        if (user) {
          rooms[roomId] = rooms[roomId].filter(u => u.socketId !== socket.id);
          io.to(roomId).emit('user-left', { userId: user.userId });
          io.to(roomId).emit('room-users', rooms[roomId]);
        }
      });
    });
  });
};
