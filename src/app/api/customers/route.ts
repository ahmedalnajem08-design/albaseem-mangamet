import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const WHATSAPP_SERVER = 'https://albaseem-whatsapp-production.up.railway.app';

// GET - Get all customers with their cities and reports
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')
    const search = searchParams.get('search')

    // Get customers
    let query = supabase
      .from('customers')
      .select(`
        *,
        customer_cities (
          city_id,
          cities (id, name)
        ),
        reports (*)
      `)
      .order('created_at', { ascending: false })

    // Search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,address.ilike.%${search}%`)
    }

    const { data: customers, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter by city if provided
    let filteredCustomers = customers || []
    if (cityId) {
      filteredCustomers = filteredCustomers.filter(c => 
        c.customer_cities?.some((cc: { city_id: string }) => cc.city_id === cityId)
      )
    }

    // Transform data to match frontend format
    const transformedData = filteredCustomers.map(customer => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      locationLink: customer.location_link,
      cityIds: customer.customer_cities?.map((cc: { city_id: string }) => cc.city_id) || [],
      cities: customer.customer_cities?.map((cc: { cities: { id: string; name: string } }) => cc.cities) || [],
      reports: customer.reports?.map((r: { id: string; title: string; content: string; author: string; date: string }) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        author: r.author,
        date: r.date
      })) || []
    }))

    return NextResponse.json({ success: true, data: transformedData })
  } catch (error) {
    console.error('Get customers error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// POST - Create new customer OR Send WhatsApp message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // ===== WHATSAPP SEND MESSAGE =====
    if (body.action === 'send-whatsapp') {
      const { phone, message } = body
      
      if (!phone || !message) {
        return NextResponse.json({
          success: false,
          error: 'رقم الهاتف والرسالة مطلوبان'
        }, { status: 400 })
      }

      // تنسيق الرقم للعراق
      let formattedPhone = phone.toString().replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '964' + formattedPhone.substring(1);
      }

      console.log('[WhatsApp] Sending to:', formattedPhone);

      try {
        const res = await fetch(`${WHATSAPP_SERVER}/api/send-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formattedPhone, message })
        });

        const result = await res.json();
        console.log('[WhatsApp] Result:', result);

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
      } catch (err: any) {
        console.error('[WhatsApp] Error:', err);
        return NextResponse.json({
          success: false,
          error: 'خطأ في الاتصال بسيرفر الواتساب: ' + err.message
        }, { status: 500 });
      }
    }

    // ===== WHATSAPP STATUS =====
    if (body.action === 'whatsapp-status') {
      try {
        const res = await fetch(`${WHATSAPP_SERVER}/api/status`);
        const data = await res.json();
        return NextResponse.json(data);
      } catch (err: any) {
        return NextResponse.json({
          ready: false,
          status: 'error',
          error: err.message
        }, { status: 500 });
      }
    }

    // ===== CREATE CUSTOMER =====
    const supabase = await createClient()
    const { name, phone, address, locationLink, cityIds } = body

    if (!name || !phone || !address || !cityIds?.length) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة مع مدينة واحدة على الأقل' },
        { status: 400 }
      )
    }

    // Create customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        name,
        phone,
        address,
        location_link: locationLink || null
      })
      .select()
      .single()

    if (customerError) {
      return NextResponse.json({ error: customerError.message }, { status: 500 })
    }

    // Link cities
    const cityLinks = cityIds.map((cityId: string) => ({
      customer_id: customer.id,
      city_id: cityId
    }))

    const { error: linkError } = await supabase
      .from('customer_cities')
      .insert(cityLinks)

    if (linkError) {
      // Rollback customer creation
      await supabase.from('customers').delete().eq('id', customer.id)
      return NextResponse.json({ error: linkError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: customer })
  } catch (error) {
    console.error('Create customer error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// PUT - Update customer
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, name, phone, address, locationLink, cityIds } = body

    if (!id) {
      return NextResponse.json({ error: 'ID مطلوب' }, { status: 400 })
    }

    // Update customer
    const { error: updateError } = await supabase
      .from('customers')
      .update({
        name,
        phone,
        address,
        location_link: locationLink || null
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Update city links - delete existing and insert new
    if (cityIds) {
      await supabase.from('customer_cities').delete().eq('customer_id', id)
      
      const cityLinks = cityIds.map((cityId: string) => ({
        customer_id: id,
        city_id: cityId
      }))

      await supabase.from('customer_cities').insert(cityLinks)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update customer error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// DELETE - Delete customer
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID مطلوب' }, { status: 400 })
    }

    // Delete customer (cascade will delete related records)
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete customer error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
