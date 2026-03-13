import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET - Get all notes
export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform to frontend format
    const transformedData = data?.map(n => ({
      id: n.id,
      content: n.content,
      author: n.author,
      date: n.date
    })) || []

    return NextResponse.json({ success: true, data: transformedData })
  } catch (error) {
    console.error('Get notes error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// POST - Create new note
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { content, author } = await request.json()

    if (!content || !author) {
      return NextResponse.json({ error: 'المحتوى والمؤلف مطلوبان' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('notes')
      .insert({
        content,
        author,
        date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Create note error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// DELETE - Delete note
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID مطلوب' }, { status: 400 })
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete note error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
