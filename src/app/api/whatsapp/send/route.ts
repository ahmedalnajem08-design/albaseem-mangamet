import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30; // 30 seconds timeout

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, message } = body;

    if (!phone || !message) {
      return NextResponse.json({
        success: false,
        error: 'Phone and message are required'
      }, { status: 400 });
    }

    // Format phone number
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '964' + formattedPhone.substring(1);
    }

    const serverUrl = 'https://albaseem-whatsapp-production.up.railway.app';
    
    console.log(`[WhatsApp API] Sending to ${formattedPhone} via ${serverUrl}`);

    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch(`${serverUrl}/api/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone, message }),
        signal: controller.signal,
        cache: 'no-store'
      });

      clearTimeout(timeoutId);
      
      const result = await response.json();
      console.log('[WhatsApp API] Server response:', result);

      return NextResponse.json(result);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error('[WhatsApp API] Fetch error:', fetchError);
      return NextResponse.json({
        success: false,
        error: fetchError.name === 'AbortError' ? 'Request timeout' : 'Failed to connect to WhatsApp server'
      }, { status: 504 });
    }

  } catch (error: any) {
    console.error('[WhatsApp API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
