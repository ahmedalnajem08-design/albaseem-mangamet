import { NextRequest, NextResponse } from 'next/server';

// WhatsApp API proxy - يتجنب مشاكل CORS
const WHATSAPP_SERVER = 'https://albaseem-whatsapp-production.up.railway.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, message } = body;

    console.log('[WA API] Received request:', { phone, message: message?.substring(0, 50) });

    if (!phone || !message) {
      return NextResponse.json({
        success: false,
        error: 'رقم الهاتف والرسالة مطلوبان'
      }, { status: 400 });
    }

    // تنسيق رقم الهاتف للعراق
    let formattedPhone = phone.toString().replace(/\D/g, '');
    
    // تحويل الأرقام المحلية (07xxx) إلى صيغة دولية (9647xxx)
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '964' + formattedPhone.substring(1);
    }
    
    // إذا لم يكن يبدأ بـ 964 وكان 10 أرقام، أضف 964
    if (!formattedPhone.startsWith('964') && formattedPhone.length === 10) {
      formattedPhone = '964' + formattedPhone;
    }

    console.log('[WA API] Formatted phone:', formattedPhone);

    // إرسال إلى سيرفر Railway
    const response = await fetch(`${WHATSAPP_SERVER}/api/send-message`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        phone: formattedPhone, 
        message: message 
      })
    });

    const result = await response.json();
    console.log('[WA API] Railway response:', result);

    if (response.ok && result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        to: result.to
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message || result.error || 'فشل الإرسال من سيرفر الواتساب'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[WA API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'خطأ في الاتصال بسيرفر الواتساب'
    }, { status: 500 });
  }
}

// GET endpoint for status check
export async function GET() {
  try {
    const response = await fetch(`${WHATSAPP_SERVER}/api/status`);
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      whatsapp: data
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'فشل الاتصال بسيرفر الواتساب'
    }, { status: 500 });
  }
}
