export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('[SOCKET] User connected:', socket.id)

    socket.on('join-room', (rawRoomId) => {
      const roomId = typeof rawRoomId === 'object' ? (rawRoomId?.roomId || rawRoomId?.id) : String(rawRoomId)
      socket.join(roomId)
      console.log(`[SOCKET] User ${socket.id} joined room: "${roomId}"`)
      socket.emit('joined-room-success', { roomId, socketId: socket.id })

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
      if (targetSocketId && data) {
        io.to(targetSocketId).emit('canvas:draw', data)
      }
    })

    // Full canvas broadcast (join sync, delete, clear)
    socket.on('canvas:draw', (payload) => {
      const roomId = String(payload?.roomId || payload)
      const data = payload?.data !== undefined ? payload.data : payload
      console.log(`[SOCKET] canvas:draw broadcast for room "${roomId}"`)
      socket.to(roomId).emit('canvas:draw', data)
    })

    // Delta object sync (add / modify single object)
    socket.on('canvas:object', (payload) => {
      const roomId = String(payload?.roomId || payload)
      const data = payload?.data !== undefined ? payload.data : payload
      console.log(`[SOCKET] canvas:object broadcast for room "${roomId}"`)
      socket.to(roomId).emit('canvas:object', { data })
    })

    // Live pointer streaming — broadcast to everyone else in room instantly
    socket.on('canvas:pointer:start', (payload) => {
      const roomId = String(payload?.roomId || payload)
      socket.to(roomId).emit('canvas:pointer:start', payload)
    })

    socket.on('canvas:pointer:move', (payload) => {
      const roomId = String(payload?.roomId || payload)
      socket.to(roomId).emit('canvas:pointer:move', payload)
    })

    socket.on('canvas:pointer:end', (payload) => {
      const roomId = String(payload?.roomId || payload)
      socket.to(roomId).emit('canvas:pointer:end', payload)
    })

    socket.on('canvas:clear', (payload) => {
      const roomId = String(payload?.roomId || payload)
      console.log(`[SOCKET] canvas:clear broadcast for room "${roomId}"`)
      socket.to(roomId).emit('canvas:clear')
    })

    socket.on('disconnect', () => {
      console.log('[SOCKET] User disconnected:', socket.id)
    })
  })
}