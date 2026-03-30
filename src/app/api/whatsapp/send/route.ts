import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, message } = body;

    console.log('[WA API v2] Received:', { phone, message });

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
    
    console.log('[WA API v2] Sending to:', formattedPhone);

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
    console.log('[WA API v2] Railway response:', result);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });

  } catch (error: any) {
    console.error('[WA API v2] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Server error'
    }, { status: 500 });
  }
}
