import { NextResponse } from 'next/server';

const WHATSAPP_SERVER = 'https://albaseem-whatsapp-production.up.railway.app';

export async function GET() {
  try {
    const response = await fetch(`${WHATSAPP_SERVER}/api/qr`);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
