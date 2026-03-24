import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

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
  try {
    // Generate session ID and QR code
    const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    const timestamp = Date.now()
    
    // Create QR data (simulating WhatsApp Web format)
    const qrData = JSON.stringify({
      sessionId,
      timestamp,
      ref: `${sessionId}@${timestamp}`,
      version: '2.2412.54',
      browser: 'AL-BASEEM-System',
      platform: 'web'
    })
    
    // Generate QR code as base64 image
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
    
    // Update session
    globalThis.whatsappSession = {
      status: 'connecting',
      phoneNumber: null,
      qrCode: qrCodeDataUrl,
      connectedAt: null,
      sessionId
    }
    
    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataUrl,
      sessionId,
      expiresIn: 20
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate QR code'
    }, { status: 500 })
  }
}
