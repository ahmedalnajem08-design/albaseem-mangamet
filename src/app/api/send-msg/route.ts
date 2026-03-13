import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  console.log('=== SEND MSG API v3 ===');
  
  try {
    const body = await request.json();
    const { phone, message } = body;
    
    console.log('Input:', { phone, message });

    if (!phone || !message) {
      return NextResponse.json({ success: false, error: 'Phone and message required' });
    }

    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '964' + formattedPhone.substring(1);
    }
    
    console.log('Calling Railway with phone:', formattedPhone);

    const res = await fetch(
      'https://albaseem-whatsapp-production.up.railway.app/api/send-message',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone, message }),
      }
    );

    const data = await res.json();
    console.log('Railway response:', data);

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (e: any) {
    console.error('Error:', e);
    return NextResponse.json({ success: false, error: e.message });
  }
}
