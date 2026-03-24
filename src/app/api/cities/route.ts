import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

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

// POST - Create new city
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
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
