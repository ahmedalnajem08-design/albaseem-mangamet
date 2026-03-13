import { NextRequest, NextResponse } from 'next/server'

const WHATSAPP_SERVER = 'https://albaseem-whatsapp-production.up.railway.app';

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
    // Get real status from Railway
    const res = await fetch(`${WHATSAPP_SERVER}/api/status`);
    const data = await res.json();
    
    return NextResponse.json({
      status: data.ready ? 'connected' : data.status,
      phoneNumber: globalThis.whatsappSession.phoneNumber,
      qrCode: globalThis.whatsappSession.qrCode,
      connectedAt: globalThis.whatsappSession.connectedAt,
      ready: data.ready
    });
  } catch (error) {
    return NextResponse.json({
      status: globalThis.whatsappSession.status,
      phoneNumber: globalThis.whatsappSession.phoneNumber,
      qrCode: globalThis.whatsappSession.qrCode,
      connectedAt: globalThis.whatsappSession.connectedAt,
      ready: false
    });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, phoneNumber, phone, message } = body

  // إرسال رسالة واتساب
  if (action === 'send' || (phone && message)) {
    const targetPhone = phone || phoneNumber;
    
    if (!targetPhone || !message) {
      return NextResponse.json({
        success: false,
        error: 'رقم الهاتف والرسالة مطلوبان'
      }, { status: 400 });
    }

    // تنسيق الرقم
    let formattedPhone = targetPhone.toString().replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '964' + formattedPhone.substring(1);
    }

    try {
      const res = await fetch(`${WHATSAPP_SERVER}/api/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone, message })
      });

      const result = await res.json();

      if (result.success) {
        return NextResponse.json({
          success: true,
          messageId: result.messageId,
          to: result.to
        });
      } else {
        return NextResponse.json({
          success: false,
          error: result.message || result.error || 'فشل الإرسال'
        }, { status: 500 });
      }
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: error.message || 'خطأ في الاتصال'
      }, { status: 500 });
    }
  }

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
