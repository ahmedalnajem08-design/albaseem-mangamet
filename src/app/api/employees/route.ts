import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET - Get all employees
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('employees')
      .select('id, name, phone, role, permissions, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get employees error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// POST - Create new employee
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { name, phone, password, role, permissions } = body

    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: 'الاسم ورقم الهاتف وكلمة المرور مطلوبون' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('employees')
      .insert({
        name,
        phone,
        password,
        role: role || 'employee',
        permissions: permissions || []
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'رقم الهاتف مسجل مسبقاً' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Create employee error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// PUT - Update employee
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, name, phone, password, role, permissions, currentUserId } = body

    if (!id) {
      return NextResponse.json({ error: 'ID مطلوب' }, { status: 400 })
    }

    // التحقق من أن المستخدم الذي يتم تعديله
    const { data: targetUser, error: fetchError } = await supabase
      .from('employees')
      .select('id, role')
      .eq('id', id)
      .single()

    if (fetchError || !targetUser) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // حماية المدير العام - لا يمكن لأحد تعديل صلاحياته أو كلمة مروره إلا هو نفسه
    if (targetUser.role === 'manager' && currentUserId !== id) {
      return NextResponse.json(
        { error: 'لا يمكنك تعديل بيانات المدير العام. فقط المدير العام يستطيع تعديل بياناته بنفسه.' },
        { status: 403 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (password) updateData.password = password
    if (role) updateData.role = role
    if (permissions) updateData.permissions = permissions

    const { data, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Update employee error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// DELETE - Delete employee
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID مطلوب' }, { status: 400 })
    }

    // التحقق من أن المستخدم الذي يتم حذفه
    const { data: targetUser, error: fetchError } = await supabase
      .from('employees')
      .select('id, role')
      .eq('id', id)
      .single()

    if (fetchError || !targetUser) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // منع حذف المدير العام نهائياً
    if (targetUser.role === 'manager') {
      return NextResponse.json(
        { error: 'لا يمكن حذف حساب المدير العام' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete employee error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
