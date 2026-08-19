export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('join-room', (roomId) => {
      socket.join(roomId)
      console.log(`User ${socket.id} joined room ${roomId}`)

      // Ask an existing member to push full canvas to the new joiner
      const roomSockets = io.sockets.adapter.rooms.get(roomId)
      if (roomSockets && roomSockets.size > 1) {
        for (const existingSocketId of roomSockets) {
          if (existingSocketId !== socket.id) {
            io.to(existingSocketId).emit('send-canvas-to', socket.id)
            break
          }
        }
      }
    })

    // Existing member sends full canvas directly to new joiner
    socket.on('canvas:full:sync:to', ({ targetSocketId, data }) => {
      io.to(targetSocketId).emit('canvas:draw', data)
    })

    // Full canvas broadcast (join sync, delete, clear)
    socket.on('canvas:draw', ({ roomId, data }) => {
      socket.to(roomId).emit('canvas:draw', data)
    })

    // Delta object sync (add / modify single object)
    socket.on('canvas:object', ({ roomId, data }) => {
      socket.to(roomId).emit('canvas:object', { data })
    })

    // Live pointer streaming — broadcast to everyone else in room instantly
    socket.on('canvas:pointer:start', ({ roomId, id, color, width, x, y }) => {
      socket.to(roomId).emit('canvas:pointer:start', { id, color, width, x, y })
    })

    socket.on('canvas:pointer:move', ({ roomId, id, x, y }) => {
      socket.to(roomId).emit('canvas:pointer:move', { id, x, y })
    })

    socket.on('canvas:pointer:end', ({ roomId, id }) => {
      socket.to(roomId).emit('canvas:pointer:end', { id })
    })

    socket.on('canvas:clear', (roomId) => {
      socket.to(roomId).emit('canvas:clear')
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })
}