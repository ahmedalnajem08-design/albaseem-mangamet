import { createServer } from 'http'
import { Server } from 'socket.io'
import { Client, LocalAuth } from 'whatsapp-web.js'
import QRCode from 'qrcode'

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

// WhatsApp Client
let client: Client | null = null
let connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected'
let currentQrCode: string | null = null
let connectedPhoneNumber: string | null = null

// Initialize WhatsApp Client
function initWhatsApp() {
  if (client) return

  console.log('Initializing WhatsApp client...')
  connectionStatus = 'connecting'
  
  client = new Client({
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--single-process',
        '--disable-extensions'
      ]
    },
    authStrategy: new LocalAuth({
      dataPath: '/home/z/my-project/whatsapp-session'
    })
  })

  client.on('qr', async (qr) => {
    console.log('QR Code received, generating image...')
    try {
      // Generate QR code as base64 image
      const qrImage = await QRCode.toDataURL(qr, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      currentQrCode = qrImage
      connectionStatus = 'connecting'
      
      // Broadcast to all connected clients
      io.emit('qr-code', { 
        qrCode: qrImage,
        timestamp: Date.now()
      })
      io.emit('session-status', {
        status: 'connecting',
        qrCode: qrImage
      })
    } catch (err) {
      console.error('Error generating QR code:', err)
    }
  })

  client.on('ready', () => {
    console.log('WhatsApp client is ready!')
    connectionStatus = 'connected'
    currentQrCode = null
    
    // Get phone number from client info
    client?.info?.getMe().then((me: any) => {
      connectedPhoneNumber = me?.id?.user || 'Unknown'
      
      io.emit('session-status', {
        status: 'connected',
        phoneNumber: connectedPhoneNumber,
        connectedAt: new Date()
      })
    }).catch(() => {
      io.emit('session-status', {
        status: 'connected',
        phoneNumber: null,
        connectedAt: new Date()
      })
    })
  })

  client.on('authenticated', () => {
    console.log('WhatsApp authenticated!')
  })

  client.on('auth_failure', (msg) => {
    console.error('Authentication failed:', msg)
    connectionStatus = 'disconnected'
    io.emit('session-status', {
      status: 'disconnected',
      error: 'Authentication failed'
    })
  })

  client.on('disconnected', (reason) => {
    console.log('WhatsApp disconnected:', reason)
    connectionStatus = 'disconnected'
    connectedPhoneNumber = null
    client = null
    
    io.emit('session-status', {
      status: 'disconnected',
      reason
    })
  })

  client.on('message', async (msg) => {
    console.log('Message received:', msg.body)
    io.emit('message-received', {
      from: msg.from,
      body: msg.body,
      timestamp: msg.timestamp
    })
  })

  client.initialize().catch(err => {
    console.error('Failed to initialize client:', err)
    connectionStatus = 'disconnected'
  })
}

// Socket.IO handlers
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // Send current status
  socket.emit('session-status', {
    status: connectionStatus,
    phoneNumber: connectedPhoneNumber,
    qrCode: currentQrCode
  })

  // Initialize WhatsApp on first connection
  if (!client || connectionStatus === 'disconnected') {
    initWhatsApp()
  }

  // Handle get QR code request
  socket.on('get-qr', () => {
    console.log('QR requested')
    if (currentQrCode) {
      socket.emit('qr-code', { 
        qrCode: currentQrCode,
        timestamp: Date.now()
      })
    } else if (connectionStatus === 'connected') {
      socket.emit('session-status', {
        status: 'connected',
        phoneNumber: connectedPhoneNumber
      })
    } else {
      // Reinitialize if needed
      if (!client) {
        initWhatsApp()
      }
    }
  })

  // Handle disconnect session
  socket.on('disconnect-session', async () => {
    console.log('Disconnecting session...')
    if (client) {
      try {
        await client.logout()
        await client.destroy()
      } catch (err) {
        console.error('Error disconnecting:', err)
      }
      client = null
      connectionStatus = 'disconnected'
      connectedPhoneNumber = null
      currentQrCode = null
      
      io.emit('session-status', {
        status: 'disconnected'
      })
    }
  })

  // Handle send message
  socket.on('send-message', async (data: {
    to: string
    message: string
    imageUrl?: string
  }) => {
    if (!client || connectionStatus !== 'connected') {
      socket.emit('message-status', {
        status: 'failed',
        error: 'WhatsApp not connected'
      })
      return
    }

    try {
      // Format phone number for WhatsApp
      let chatId = data.to.replace(/[^0-9]/g, '')
      if (!chatId.includes('@')) {
        chatId = `${chatId}@c.us`
      }

      await client.sendMessage(chatId, data.message)
      
      socket.emit('message-status', {
        status: 'sent',
        to: data.to,
        timestamp: new Date()
      })
    } catch (err: any) {
      socket.emit('message-status', {
        status: 'failed',
        error: err.message
      })
    }
  })

  // Handle bulk send messages
  socket.on('send-bulk-messages', async (data: {
    recipients: Array<{ phone: string; name: string }>
    message: string
    imageUrl?: string
  }) => {
    if (!client || connectionStatus !== 'connected') {
      socket.emit('bulk-send-status', {
        status: 'failed',
        error: 'WhatsApp not connected'
      })
      return
    }

    const results: Array<{
      phone: string
      name: string
      status: 'sent' | 'failed'
      error?: string
    }> = []

    for (let i = 0; i < data.recipients.length; i++) {
      const recipient = data.recipients[i]
      
      try {
        let chatId = recipient.phone.replace(/[^0-9]/g, '')
        if (!chatId.includes('@')) {
          chatId = `${chatId}@c.us`
        }

        await client.sendMessage(chatId, data.message)
        results.push({
          phone: recipient.phone,
          name: recipient.name,
          status: 'sent'
        })
      } catch (err: any) {
        results.push({
          phone: recipient.phone,
          name: recipient.name,
          status: 'failed',
          error: err.message
        })
      }

      // Emit progress
      io.emit('bulk-send-progress', {
        current: i + 1,
        total: data.recipients.length,
        recipient,
        status: results[results.length - 1].status
      })

      // Delay between messages to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    io.emit('bulk-send-complete', {
      total: data.recipients.length,
      successful: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length,
      results
    })
  })

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

// Start server
const PORT = 3005
httpServer.listen(PORT, () => {
  console.log(`WhatsApp server running on port ${PORT}`)
  
  // Initialize WhatsApp on startup
  setTimeout(() => {
    initWhatsApp()
  }, 2000)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...')
  if (client) {
    client.destroy().catch(() => {})
  }
  httpServer.close(() => {
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Shutting down...')
  if (client) {
    client.destroy().catch(() => {})
  }
  httpServer.close(() => {
    process.exit(0)
  })
})
