import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

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

    const railwayUrl = 'https://albaseem-whatsapp-production.up.railway.app/api/send-message';
    
    console.log('[WA Send] Sending to:', formattedPhone);

    const response = await fetch(railwayUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        phone: formattedPhone, 
        message 
      }),
    });

    const result = await response.json();
    console.log('[WA Send] Result:', result);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[WA Send] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Server error'
    }, { status: 500 });
  }
}
