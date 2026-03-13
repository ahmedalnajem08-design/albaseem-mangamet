import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET - Get tasks
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')
    const date = searchParams.get('date')

    let query = supabase
      .from('tasks')
      .select('*')
      .order('date', { ascending: false })

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (date) {
      query = query.eq('date', date)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform to frontend format
    const transformedData = data?.map(t => ({
      id: t.id,
      employeeId: t.employee_id,
      title: t.title,
      details: t.details,
      date: t.date,
      isFullDay: t.is_full_day,
      startTime: t.start_time,
      endTime: t.end_time,
      status: t.status,
      completionDetails: t.completion_details,
      delayReason: t.delay_reason,
      cancelReason: t.cancel_reason,
      canceledBy: t.canceled_by
    })) || []

    return NextResponse.json({ success: true, data: transformedData })
  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// POST - Create new task
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { employeeId, title, details, date, isFullDay, startTime, endTime } = body

    if (!employeeId || !title || !date) {
      return NextResponse.json({ error: 'الموظف والعنوان والتاريخ مطلوبون' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        employee_id: employeeId,
        title,
        details: details || '',
        date,
        is_full_day: isFullDay ?? true,
        start_time: startTime || null,
        end_time: endTime || null,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// PUT - Update task
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID مطلوب' }, { status: 400 })
    }

    // Map frontend fields to database fields
    const dbUpdates: Record<string, unknown> = {}
    if (updates.status) dbUpdates.status = updates.status
    if (updates.completionDetails) dbUpdates.completion_details = updates.completionDetails
    if (updates.delayReason) dbUpdates.delay_reason = updates.delayReason
    if (updates.cancelReason) dbUpdates.cancel_reason = updates.cancelReason
    if (updates.canceledBy) dbUpdates.canceled_by = updates.canceledBy
    if (updates.date) dbUpdates.date = updates.date
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime
    if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime
    if (updates.isFullDay !== undefined) dbUpdates.is_full_day = updates.isFullDay

    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// DELETE - Delete task
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID مطلوب' }, { status: 400 })
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
