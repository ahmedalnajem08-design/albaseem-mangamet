import { NextResponse } from 'next/server'
import { io, Socket } from 'socket.io-client'

// Singleton socket connection
let socket: Socket | null = null
let lastStatus: {
  status: 'disconnected' | 'connecting' | 'connected'
  phoneNumber: string | null
  qrCode: string | null
} = {
  status: 'disconnected',
  phoneNumber: null,
  qrCode: null
}

function getSocket(): Promise<Socket | null> {
  return new Promise((resolve) => {
    if (socket && socket.connected) {
      resolve(socket)
      return
    }

    // Connect to the real WhatsApp server on port 3005
    socket = io('http://localhost:3005', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    })

    socket.on('connect', () => {
      console.log('Connected to WhatsApp real server')
    })

    socket.on('session-status', (data: {
      status: 'disconnected' | 'connecting' | 'connected'
      phoneNumber?: string | null
      qrCode?: string | null
    }) => {
      console.log('Received session status:', data.status)
      lastStatus = {
        status: data.status,
        phoneNumber: data.phoneNumber || null,
        qrCode: data.qrCode || null
      }
    })

    socket.on('qr-code', (data: { qrCode: string; timestamp: number }) => {
      console.log('Received QR code from server')
      lastStatus.qrCode = data.qrCode
      lastStatus.status = 'connecting'
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from WhatsApp real server')
    })

    // Wait for connection
    const checkConnection = setInterval(() => {
      if (socket?.connected) {
        clearInterval(checkConnection)
        resolve(socket)
      }
    }, 100)

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkConnection)
      resolve(socket)
    }, 5000)
  })
}

export async function GET() {
  try {
    const sock = await getSocket()
    
    // Request current status
    if (sock && sock.connected) {
      sock.emit('get-qr')
      
      // Wait a bit for response
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    return NextResponse.json({
      success: true,
      ...lastStatus,
      serverConnected: sock?.connected || false
    })
  } catch (error) {
    console.error('Error getting WhatsApp status:', error)
    return NextResponse.json({
      success: false,
      status: 'disconnected',
      error: 'Failed to connect to WhatsApp server',
      serverConnected: false
    })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body
    const sock = await getSocket()

    if (action === 'disconnect' && sock?.connected) {
      sock.emit('disconnect-session')
      lastStatus = {
        status: 'disconnected',
        phoneNumber: null,
        qrCode: null
      }
      return NextResponse.json({
        success: true,
        status: 'disconnected',
        message: 'WhatsApp session disconnected'
      })
    }

    if (action === 'simulate-connect' && sock?.connected) {
      const { phoneNumber } = body
      sock.emit('simulate-connect', { phoneNumber })
      return NextResponse.json({
        success: true,
        message: 'Simulating connection...'
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action or server not connected'
    })
  } catch (error) {
    console.error('Error in WhatsApp POST:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process request'
    }, { status: 500 })
  }
}
