export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Join the socket.io room
    socket.on('join-room', (roomId) => {
      socket.join(roomId)
      console.log(`User ${socket.id} joined room ${roomId}`)
    })

    // Client signals DB canvas is loaded — now ask a peer for live state
    socket.on('canvas:request-state', (roomId) => {
      const roomSockets = io.sockets.adapter.rooms.get(roomId)
      if (!roomSockets || roomSockets.size <= 1) return
      for (const existingSocketId of roomSockets) {
        if (existingSocketId !== socket.id) {
          io.to(existingSocketId).emit('send-canvas-to', socket.id)
          break
        }
      }
    })

    // Existing member sends full canvas to new joiner (targeted)
    socket.on('canvas:full:sync:to', ({ targetSocketId, data }) => {
      io.to(targetSocketId).emit('canvas:state-from-peer', data)
    })

    // ── Object-level sync (the main real-time events) ──────────────────────

    // Broadcast a single added/modified object to everyone else in the room
    socket.on('canvas:object:added', ({ roomId, data }) => {
      socket.to(roomId).emit('canvas:object:added', { data })
    })

    // Broadcast a single removal to everyone else in the room
    socket.on('canvas:object:removed', ({ roomId, id }) => {
      socket.to(roomId).emit('canvas:object:removed', { id })
    })

    // Clear entire canvas
    socket.on('canvas:clear', (roomId) => {
      socket.to(roomId).emit('canvas:clear')
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })
}