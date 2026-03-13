import { NextResponse } from 'next/server'

interface SendMessageRequest {
  recipients: Array<{
    phone: string
    name: string
  }>
  message: string
  imageUrl?: string
}

// Global session state
declare global {
  // eslint-disable-next-line no-var
  var whatsappSession: {
    status: 'disconnected' | 'connecting' | 'connected'
    phoneNumber: string | null
    qrCode: string | null
    connectedAt: Date | null
  }
}

export async function POST(request: Request) {
  try {
    const body: SendMessageRequest = await request.json()
    const { recipients, message, imageUrl } = body

    // Check if WhatsApp is connected
    if (!globalThis.whatsappSession || globalThis.whatsappSession.status !== 'connected') {
      return NextResponse.json({
        success: false,
        error: 'WhatsApp not connected. Please connect your WhatsApp account first.',
        results: recipients.map(r => ({
          phone: r.phone,
          name: r.name,
          status: 'failed',
          error: 'WhatsApp not connected'
        }))
      }, { status: 400 })
    }

    // Simulate sending messages
    // In production, this would use WhatsApp Business API or similar
    const results = recipients.map(recipient => {
      // Simulate 90% success rate
      const success = Math.random() > 0.1
      return {
        phone: recipient.phone,
        name: recipient.name,
        status: success ? 'sent' : 'failed',
        error: success ? null : 'Number not registered on WhatsApp',
        messageId: success ? `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` : null
      }
    })

    const successful = results.filter(r => r.status === 'sent').length
    const failed = results.filter(r => r.status === 'failed').length

    return NextResponse.json({
      success: true,
      total: recipients.length,
      successful,
      failed,
      results,
      sentAt: new Date().toISOString(),
      sentFrom: globalThis.whatsappSession.phoneNumber
    })
  } catch (error) {
    console.error('Error sending WhatsApp messages:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to send messages. Please try again.'
    }, { status: 500 })
  }
}
