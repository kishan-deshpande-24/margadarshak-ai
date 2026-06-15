module.exports = (io) => {
  const sessions = {};

  io.on('connection', (socket) => {
    socket.on('interview-join', ({ interviewId, userId, role }) => {
      socket.join(interviewId);
      if (!sessions[interviewId]) sessions[interviewId] = { participants: [], startTime: Date.now() };
      sessions[interviewId].participants.push({ userId, role, socketId: socket.id });
      socket.to(interviewId).emit('participant-joined', { userId, role });
    });

    socket.on('interview-question', ({ interviewId, question, questionIndex }) => {
      socket.to(interviewId).emit('new-question', { question, questionIndex, timestamp: new Date() });
    });

    socket.on('interview-answer', ({ interviewId, answer, questionIndex }) => {
      socket.to(interviewId).emit('answer-received', { answer, questionIndex });
    });

    socket.on('interview-feedback', ({ interviewId, feedback, score }) => {
      io.to(interviewId).emit('ai-feedback', { feedback, score, timestamp: new Date() });
    });

    socket.on('analytics-update', ({ interviewId, analyticsData }) => {
      sessions[interviewId] = { ...sessions[interviewId], analytics: analyticsData };
      socket.to(interviewId).emit('analytics-updated', analyticsData);
    });

    socket.on('integrity-warning', ({ interviewId, type, message }) => {
      io.to(interviewId).emit('integrity-alert', { type, message, timestamp: new Date() });
    });

    socket.on('interview-end', ({ interviewId }) => {
      io.to(interviewId).emit('interview-ended', { timestamp: new Date() });
      delete sessions[interviewId];
    });

    socket.on('disconnect', () => {
      Object.keys(sessions).forEach(interviewId => {
        const session = sessions[interviewId];
        if (session?.participants) {
          const participant = session.participants.find(p => p.socketId === socket.id);
          if (participant) {
            session.participants = session.participants.filter(p => p.socketId !== socket.id);
            io.to(interviewId).emit('participant-left', { userId: participant.userId });
          }
        }
      });
    });
  });
};
