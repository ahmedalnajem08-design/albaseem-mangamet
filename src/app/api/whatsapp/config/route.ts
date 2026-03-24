import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET - Get WhatsApp configuration
export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Don't return the access token for security
    const safeData = data ? {
      id: data.id,
      phoneNumberId: data.phone_number_id,
      businessAccountId: data.business_account_id,
      isActive: data.is_active,
      hasToken: !!data.access_token
    } : null

    return NextResponse.json({
      success: true,
      data: safeData
    })
  } catch (error) {
    console.error('Get WhatsApp config error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// POST - Save WhatsApp configuration
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { phoneNumberId, accessToken, businessAccountId } = body

    if (!phoneNumberId || !accessToken || !businessAccountId) {
      return NextResponse.json({
        error: 'جميع الحقول مطلوبة'
      }, { status: 400 })
    }

    // Deactivate existing configs
    await supabase
      .from('whatsapp_config')
      .update({ is_active: false })

    // Insert new config
    const { data, error } = await supabase
      .from('whatsapp_config')
      .insert({
        phone_number_id: phoneNumberId,
        access_token: accessToken,
        business_account_id: businessAccountId,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'تم حفظ الإعدادات بنجاح'
    })
  } catch (error) {
    console.error('Save WhatsApp config error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// DELETE - Remove WhatsApp configuration
export async function DELETE() {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('whatsapp_config')
      .update({ is_active: false })
      .eq('is_active', true)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'تم إلغاء ربط واتساب'
    })
  } catch (error) {
    console.error('Delete WhatsApp config error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
