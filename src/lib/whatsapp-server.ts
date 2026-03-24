import { createServer } from 'http'
import { Server } from 'socket.io'
import QRCode from 'qrcode'

// WhatsApp Session Manager
interface WhatsAppSession {
  id: string
  status: 'disconnected' | 'connecting' | 'connected'
  qrCode: string | null
  phoneNumber: string | null
  connectedAt: Date | null
  messageQueue: QueuedMessage[]
}

interface QueuedMessage {
  id: string
  to: string
  message: string
  imageUrl?: string
  status: 'pending' | 'sent' | 'failed'
  timestamp: Date
}

// Global session state
let session: WhatsAppSession = {
  id: 'default',
  status: 'disconnected',
  qrCode: null,
  phoneNumber: null,
  connectedAt: null,
  messageQueue: []
}

// Generate a unique session ID for QR
const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

// Generate QR Code data (simulating WhatsApp Web protocol)
const generateQRData = async () => {
  const sessionId = generateSessionId()
  const timestamp = Date.now()
  // This simulates WhatsApp Web QR data format
  // In production, this would be replaced with actual WhatsApp protocol data
  const qrData = JSON.stringify({
    sessionId,
    timestamp,
    ref: `${sessionId}@${timestamp}`,
    version: '2.2412.54',
    browser: 'AL-BASEEM-System'
  })
  
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
    return qrCodeDataUrl
  } catch (err) {
    console.error('Error generating QR code:', err)
    return null
  }
}

// Create HTTP server and Socket.IO
const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log(`WhatsApp client connected: ${socket.id}`)

  // Send current session status
  socket.emit('session-status', {
    status: session.status,
    phoneNumber: session.phoneNumber,
    qrCode: session.qrCode,
    connectedAt: session.connectedAt
  })

  // Handle QR code request
  socket.on('get-qr', async () => {
    console.log('QR code requested')
    
    if (session.status === 'connected') {
      socket.emit('session-status', {
        status: 'connected',
        phoneNumber: session.phoneNumber,
        connectedAt: session.connectedAt
      })
      return
    }

    session.status = 'connecting'
    const qrCode = await generateQRData()
    session.qrCode = qrCode

    // Broadcast QR code to all clients
    io.emit('qr-code', { qrCode, timestamp: Date.now() })
    io.emit('session-status', {
      status: 'connecting',
      qrCode: session.qrCode
    })
  })

  // Handle manual scan simulation (for testing)
  socket.on('simulate-scan', async (data: { phoneNumber: string }) => {
    console.log('Simulating scan:', data.phoneNumber)
    
    session.status = 'connected'
    session.phoneNumber = data.phoneNumber
    session.connectedAt = new Date()
    session.qrCode = null

    io.emit('session-status', {
      status: 'connected',
      phoneNumber: session.phoneNumber,
      connectedAt: session.connectedAt
    })

    // Process any queued messages
    processMessageQueue()
  })

  // Handle disconnect request
  socket.on('disconnect-session', () => {
    console.log('Disconnecting WhatsApp session')
    
    session = {
      id: 'default',
      status: 'disconnected',
      qrCode: null,
      phoneNumber: null,
      connectedAt: null,
      messageQueue: []
    }

    io.emit('session-status', {
      status: 'disconnected',
      phoneNumber: null
    })
  })

  // Handle send message request
  socket.on('send-message', async (data: {
    to: string
    message: string
    imageUrl?: string
  }) => {
    console.log('Send message request:', data)

    if (session.status !== 'connected') {
      socket.emit('message-status', {
        id: `msg_${Date.now()}`,
        to: data.to,
        status: 'failed',
        error: 'WhatsApp not connected'
      })
      return
    }

    // In production, this would send via WhatsApp API
    // For simulation, we'll return success after a delay
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    setTimeout(() => {
      const success = Math.random() > 0.1 // 90% success rate simulation
      
      io.emit('message-status', {
        id: messageId,
        to: data.to,
        status: success ? 'sent' : 'failed',
        error: success ? null : 'Number not registered on WhatsApp',
        timestamp: new Date()
      })
    }, 500 + Math.random() * 1000) // Random delay between 0.5-1.5 seconds
  })

  // Handle bulk send messages
  socket.on('send-bulk-messages', async (data: {
    recipients: Array<{ phone: string, name: string }>
    message: string
    imageUrl?: string
  }) => {
    console.log(`Bulk send request to ${data.recipients.length} recipients`)

    if (session.status !== 'connected') {
      socket.emit('bulk-send-status', {
        status: 'failed',
        error: 'WhatsApp not connected'
      })
      return
    }

    // Process each recipient with delay
    const results: Array<{
      phone: string
      name: string
      status: 'sent' | 'failed'
      error?: string
    }> = []

    for (let i = 0; i < data.recipients.length; i++) {
      const recipient = data.recipients[i]
      
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500))
      
      const success = Math.random() > 0.1 // 90% success rate
      results.push({
        phone: recipient.phone,
        name: recipient.name,
        status: success ? 'sent' : 'failed',
        error: success ? undefined : 'Number not registered on WhatsApp'
      })

      // Emit progress update
      io.emit('bulk-send-progress', {
        current: i + 1,
        total: data.recipients.length,
        recipient: recipient,
        status: success ? 'sent' : 'failed'
      })
    }

    io.emit('bulk-send-complete', {
      total: data.recipients.length,
      successful: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length,
      results
    })
  })

  socket.on('disconnect', () => {
    console.log(`WhatsApp client disconnected: ${socket.id}`)
  })

  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error)
  })
})

// Process queued messages (for when connection is established)
async function processMessageQueue() {
  if (session.messageQueue.length === 0) return

  console.log(`Processing ${session.messageQueue.length} queued messages`)

  for (const msg of session.messageQueue) {
    if (msg.status === 'pending') {
      io.emit('send-message', {
        to: msg.to,
        message: msg.message,
        imageUrl: msg.imageUrl
      })
    }
  }
}

// Start server
const PORT = 3004
httpServer.listen(PORT, () => {
  console.log(`WhatsApp WebSocket server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down WhatsApp server...')
  httpServer.close(() => {
    console.log('WhatsApp WebSocket server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down WhatsApp server...')
  httpServer.close(() => {
    console.log('WhatsApp WebSocket server closed')
    process.exit(0)
  })
})

export { io, session }
