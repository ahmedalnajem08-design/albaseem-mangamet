import { NextResponse } from 'next/server'

// Global session state
declare global {
  // eslint-disable-next-line no-var
  var whatsappSession: {
    status: 'disconnected' | 'connecting' | 'connected'
    phoneNumber: string | null
    qrCode: string | null
    connectedAt: Date | null
    sessionId: string | null
  }
}

// Initialize session if not exists
if (!globalThis.whatsappSession) {
  globalThis.whatsappSession = {
    status: 'disconnected',
    phoneNumber: null,
    qrCode: null,
    connectedAt: null,
    sessionId: null
  }
}

export async function GET() {
  return NextResponse.json({
    status: globalThis.whatsappSession.status,
    phoneNumber: globalThis.whatsappSession.phoneNumber,
    qrCode: globalThis.whatsappSession.qrCode,
    connectedAt: globalThis.whatsappSession.connectedAt
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action, phoneNumber } = body

  if (action === 'connect') {
    globalThis.whatsappSession.status = 'connecting'
    return NextResponse.json({ 
      status: 'connecting',
      message: 'QR Code generation initiated.'
    })
  }

  if (action === 'disconnect') {
    globalThis.whatsappSession = {
      status: 'disconnected',
      phoneNumber: null,
      qrCode: null,
      connectedAt: null,
      sessionId: null
    }
    return NextResponse.json({ 
      status: 'disconnected',
      message: 'WhatsApp session disconnected successfully.'
    })
  }

  if (action === 'simulate-connect' && phoneNumber) {
    // Simulate a successful connection
    globalThis.whatsappSession = {
      status: 'connected',
      phoneNumber: phoneNumber,
      qrCode: null,
      connectedAt: new Date(),
      sessionId: globalThis.whatsappSession.sessionId
    }
    return NextResponse.json({ 
      status: 'connected',
      phoneNumber: phoneNumber,
      message: 'WhatsApp connected successfully!'
    })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
