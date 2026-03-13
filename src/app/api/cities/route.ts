import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const WHATSAPP_SERVER = 'https://albaseem-whatsapp-production.up.railway.app';

// GET - Get all cities
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get cities error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// POST - Create new city OR WhatsApp operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // ===== WHATSAPP STATUS =====
    if (body.wa_action === 'status') {
      try {
        const res = await fetch(`${WHATSAPP_SERVER}/api/status`);
        const data = await res.json();
        return NextResponse.json(data);
      } catch (err: any) {
        return NextResponse.json({ ready: false, status: 'error', error: err.message }, { status: 500 });
      }
    }
    
    // ===== WHATSAPP SEND =====
    if (body.wa_action === 'send') {
      const { phone, message } = body;
      
      if (!phone || !message) {
        return NextResponse.json({ success: false, error: 'Phone and message required' }, { status: 400 });
      }
      
      // Format phone for Iraq
      let formattedPhone = phone.toString().replace(/\D/g, '');
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
          return NextResponse.json({ success: true, messageId: result.messageId, to: result.to });
        } else {
          return NextResponse.json({ success: false, error: result.message || result.error || 'Failed' }, { status: 500 });
        }
      } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
      }
    }
    
    // ===== CREATE CITY =====
    const supabase = await createClient()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: 'اسم المدينة مطلوب' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('cities')
      .insert({ name })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Create city error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// DELETE - Delete city
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID مطلوب' }, { status: 400 })
    }

    // Check if city has customers
    const { data: customerCities } = await supabase
      .from('customer_cities')
      .select('id')
      .eq('city_id', id)
      .limit(1)

    if (customerCities && customerCities.length > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف المدينة لأنها تحتوي على زبائن' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('cities')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete city error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
