import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET - Get reminders
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')

    let query = supabase
      .from('reminders')
      .select(`
        *,
        reminder_employees (
          employee_id,
          employees (id, name)
        )
      `)
      .order('date', { ascending: true })

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Try to get completions separately (may not exist)
    let completions: any[] = []
    try {
      const { data: compData } = await supabase
        .from('reminder_completions')
        .select('*')
      completions = compData || []
    } catch {
      // Table doesn't exist, continue without completions
    }

    // Filter by employee if provided
    let filteredData = data || []
    if (employeeId) {
      filteredData = filteredData.filter(r => 
        r.reminder_employees?.some((re: { employee_id: string }) => re.employee_id === employeeId)
      )
    }

    // Transform to frontend format
    const transformedData = filteredData.map(r => {
      const reminderCompletions = completions.filter(c => c.reminder_id === r.id)
      return {
        id: r.id,
        title: r.title,
        details: r.details,
        date: r.date,
        isFullDay: r.is_full_day,
        startTime: r.start_time,
        endTime: r.end_time,
        completionType: r.completion_type,
        employeeIds: r.reminder_employees?.map((re: { employee_id: string }) => re.employee_id) || [],
        employees: r.reminder_employees?.map((re: { employees: { id: string; name: string } }) => re.employees) || [],
        completions: reminderCompletions.map((rc: { id: string; employee_id: string; details: string; date: string }) => ({
          id: rc.id,
          employeeId: rc.employee_id,
          details: rc.details,
          date: rc.date
        })) || []
      }
    })

    return NextResponse.json({ success: true, data: transformedData })
  } catch (error) {
    console.error('Get reminders error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// POST - Create new reminder
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { title, details, date, isFullDay, startTime, endTime, completionType, employeeIds } = body

    if (!title || !date || !employeeIds?.length) {
      return NextResponse.json({ error: 'العنوان والتاريخ والموظفين مطلوبون' }, { status: 400 })
    }

    // Create reminder
    const { data: reminder, error: reminderError } = await supabase
      .from('reminders')
      .insert({
        title,
        details: details || '',
        date,
        is_full_day: isFullDay ?? true,
        start_time: startTime || null,
        end_time: endTime || null,
        completion_type: completionType || 'single'
      })
      .select()
      .single()

    if (reminderError) {
      return NextResponse.json({ error: reminderError.message }, { status: 500 })
    }

    // Link employees
    const employeeLinks = employeeIds.map((empId: string) => ({
      reminder_id: reminder.id,
      employee_id: empId
    }))

    const { error: linkError } = await supabase
      .from('reminder_employees')
      .insert(employeeLinks)

    if (linkError) {
      await supabase.from('reminders').delete().eq('id', reminder.id)
      return NextResponse.json({ error: linkError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: reminder })
  } catch (error) {
    console.error('Create reminder error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// PUT - Complete reminder
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { reminderId, employeeId, details } = body

    if (!reminderId || !employeeId) {
      return NextResponse.json({ error: 'معرف التذكير والموظف مطلوبان' }, { status: 400 })
    }

    // Add completion
    const { error } = await supabase
      .from('reminder_completions')
      .insert({
        reminder_id: reminderId,
        employee_id: employeeId,
        details: details || '',
        date: new Date().toISOString().split('T')[0]
      })

    if (error) {
      // If table doesn't exist, just return success (graceful fallback)
      if (error.code === '42P01') {
        console.warn('reminder_completions table does not exist, skipping completion')
        return NextResponse.json({ success: true, warning: 'جدول الإكمال غير موجود' })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Complete reminder error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// DELETE - Delete reminder
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID مطلوب' }, { status: 400 })
    }

    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete reminder error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
