export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Step 1: join the socket.io room immediately so the client can receive events
    socket.on('join-room', (roomId) => {
      socket.join(roomId)
      console.log(`User ${socket.id} joined room ${roomId}`)
      // Don't push state yet — wait for the client to signal it's ready
    })

    // Step 2: client emits this AFTER it has finished loading the DB canvas.
    // Only then do we ask an existing peer to send their live canvas state.
    socket.on('canvas:request-state', (roomId) => {
      const roomSockets = io.sockets.adapter.rooms.get(roomId)
      if (!roomSockets || roomSockets.size <= 1) return // no peers, nothing to sync

      for (const existingSocketId of roomSockets) {
        if (existingSocketId !== socket.id) {
          io.to(existingSocketId).emit('send-canvas-to', socket.id)
          break
        }
      }
    })

    // Step 3: existing member received 'send-canvas-to' and responds with full state.
    // Uses a SEPARATE event name 'canvas:state-from-peer' so it never collides
    // with regular 'canvas:draw' broadcast events on the receiving client.
    socket.on('canvas:full:sync:to', ({ targetSocketId, data }) => {
      io.to(targetSocketId).emit('canvas:state-from-peer', data)
    })

    // Regular draw broadcast — sent to everyone else in the room
    socket.on('canvas:draw', ({ roomId, data }) => {
      socket.to(roomId).emit('canvas:draw', data)
    })

    // Clear canvas broadcast
    socket.on('canvas:clear', (roomId) => {
      socket.to(roomId).emit('canvas:clear')
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })
}