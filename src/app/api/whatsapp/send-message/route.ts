import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, message, serverUrl } = body;

    if (!phone || !message) {
      return NextResponse.json({
        success: false,
        error: 'Phone and message are required'
      }, { status: 400 });
    }

    // Format phone number for WhatsApp
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '964' + formattedPhone.substring(1);
    }
    if (!formattedPhone.startsWith('964') && formattedPhone.length === 10) {
      formattedPhone = '964' + formattedPhone;
    }

    const waServerUrl = serverUrl || 'https://albaseem-whatsapp-production.up.railway.app';
    
    console.log(`Sending WhatsApp message to ${formattedPhone} via ${waServerUrl}`);

    const response = await fetch(`${waServerUrl}/api/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: formattedPhone, message })
    });

    const result = await response.json();
    console.log('WhatsApp server response:', result);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || result.message || 'Failed to send message'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      to: result.to
    });

  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
