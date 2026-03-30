import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// POST - Register FCM token for an employee
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { employeeId, token, deviceInfo } = body

    if (!employeeId || !token) {
      return NextResponse.json({ error: 'معرف الموظف والـ Token مطلوبان' }, { status: 400 })
    }

    // Check if token already exists
    const { data: existingToken } = await supabase
      .from('fcm_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (existingToken) {
      // Update the employee_id if token exists but belongs to different employee
      if (existingToken.employee_id !== employeeId) {
        const { error } = await supabase
          .from('fcm_tokens')
          .update({
            employee_id: employeeId,
            device_info: deviceInfo || existingToken.device_info,
            updated_at: new Date().toISOString()
          })
          .eq('token', token)

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
      }
      return NextResponse.json({ success: true, message: 'تم تحديث الـ Token' })
    }

    // Insert new token
    const { error } = await supabase
      .from('fcm_tokens')
      .insert({
        employee_id: employeeId,
        token,
        device_info: deviceInfo || 'Unknown device'
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'تم تسجيل الـ Token بنجاح' })
  } catch (error) {
    console.error('Register FCM token error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// DELETE - Remove FCM token (when user logs out)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'الـ Token مطلوب' }, { status: 400 })
    }

    const { error } = await supabase
      .from('fcm_tokens')
      .delete()
      .eq('token', token)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete FCM token error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// GET - Get all tokens for an employee
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')

    if (!employeeId) {
      return NextResponse.json({ error: 'معرف الموظف مطلوب' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('fcm_tokens')
      .select('*')
      .eq('employee_id', employeeId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get FCM tokens error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
