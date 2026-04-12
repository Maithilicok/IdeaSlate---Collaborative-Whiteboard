export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('join-room', (roomId) => {
      socket.join(roomId)
      console.log(`User ${socket.id} joined room ${roomId}`)

      // Ask one existing member to push full canvas state to the new joiner
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

    // Full canvas broadcast
    // Board.jsx emits: canvas:draw  { roomId, data: JSON.stringify(canvas.toJSON()) }
    // Broadcast the raw JSON string to everyone else in the room
    socket.on('canvas:draw', ({ roomId, data }) => {
      socket.to(roomId).emit('canvas:draw', data)
    })

    // Targeted full-state sync to a newly joined socket 
    // An existing member received 'send-canvas-to' and responds with this
    // Board.jsx emits: canvas:full:sync:to  { targetSocketId, data }
    socket.on('canvas:full:sync:to', ({ targetSocketId, data }) => {
      io.to(targetSocketId).emit('canvas:draw', data)
    })

    //Clear canvas 
    socket.on('canvas:clear', (roomId) => {
      socket.to(roomId).emit('canvas:clear')
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })
}