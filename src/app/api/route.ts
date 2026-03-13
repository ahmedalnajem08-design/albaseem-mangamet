import { NextRequest, NextResponse } from "next/server";

const WHATSAPP_SERVER = 'https://albaseem-whatsapp-production.up.railway.app';

export async function GET() {
  return NextResponse.json({ message: "AL-BASEEM API", status: "ok" });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, phone, message } = body;

    // WhatsApp send message
    if (action === 'send-whatsapp' || (phone && message)) {
      if (!phone || !message) {
        return NextResponse.json({
          success: false,
          error: 'رقم الهاتف والرسالة مطلوبان'
        }, { status: 400 });
      }

      // تنسيق رقم الهاتف للعراق
      let formattedPhone = phone.toString().replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '964' + formattedPhone.substring(1);
      }
      if (!formattedPhone.startsWith('964') && formattedPhone.length === 10) {
        formattedPhone = '964' + formattedPhone;
      }

      console.log('Sending WhatsApp to:', formattedPhone);

      const response = await fetch(`${WHATSAPP_SERVER}/api/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone, message })
      });

      const result = await response.json();
      console.log('WhatsApp result:', result);

      if (response.ok && result.success) {
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
    }

    // Get WhatsApp status
    if (action === 'status') {
      const response = await fetch(`${WHATSAPP_SERVER}/api/status`);
      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({
      success: false,
      error: 'إجراء غير معروف'
    }, { status: 400 });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'خطأ داخلي'
    }, { status: 500 });
  }
}
