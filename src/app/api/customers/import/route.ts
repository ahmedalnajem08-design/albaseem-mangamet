import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import * as XLSX from 'xlsx'

// POST - Import customers from Excel/CSV file
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const formData = await request.formData()
    
    const file = formData.get('file') as File
    const cityId = formData.get('cityId') as string

    if (!file) {
      return NextResponse.json({ error: 'الملف مطلوب' }, { status: 400 })
    }

    if (!cityId) {
      return NextResponse.json({ error: 'المدينة مطلوبة' }, { status: 400 })
    }

    // Check if city exists
    const { data: city, error: cityError } = await supabase
      .from('cities')
      .select('id')
      .eq('id', cityId)
      .single()

    if (cityError || !city) {
      return NextResponse.json({ error: 'المدينة غير موجودة' }, { status: 400 })
    }

    // Read file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Get file extension
    const fileName = file.name.toLowerCase()
    const isCSV = fileName.endsWith('.csv')
    
    let workbook: XLSX.WorkBook
    
    if (isCSV) {
      // For CSV files, try different encodings
      let textContent: string | null = null
      
      // Try UTF-8 first
      try {
        textContent = new TextDecoder('utf-8').decode(buffer)
        // Check for BOM or valid UTF-8
        if (textContent.includes('�') || textContent.includes('ï»¿')) {
          textContent = null
        }
      } catch {
        textContent = null
      }
      
      // Try Windows-1256 (Arabic)
      if (!textContent) {
        try {
          textContent = new TextDecoder('windows-1256').decode(buffer)
        } catch {
          textContent = null
        }
      }
      
      // Try ISO-8859-6 (Arabic)
      if (!textContent) {
        try {
          textContent = new TextDecoder('iso-8859-6').decode(buffer)
        } catch {
          textContent = null
        }
      }
      
      // Fallback to UTF-8
      if (!textContent) {
        textContent = new TextDecoder('utf-8').decode(buffer)
      }
      
      // Remove BOM if present
      if (textContent.charCodeAt(0) === 0xFEFF) {
        textContent = textContent.slice(1)
      }
      
      // Parse CSV text
      workbook = XLSX.read(textContent, { type: 'string' })
    } else {
      // For Excel files
      workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true, cellText: true })
    }

    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to JSON with header row detection
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      raw: false // Get formatted strings instead of raw values
    }) as any[][]
    
    if (jsonData.length < 2) {
      return NextResponse.json({ error: 'الملف فارغ أو يحتوي على العناوين فقط' }, { status: 400 })
    }

    // Get header row and find column indices
    const headers = jsonData[0] as string[]
    const headerMap: Record<string, number> = {}
    
    headers.forEach((header, index) => {
      const h = String(header || '').trim().toLowerCase()
      // Name columns
      if (h.includes('اسم') || h.includes('name') || h === 'الاسم' || h === 'اسم الزبون' || h === 'اسم العميل') {
        headerMap['name'] = index
      }
      // Phone columns
      else if (h.includes('رقم') || h.includes('phone') || h.includes('هاتف') || h.includes('موبايل') || h.includes('جوال') || h === 'الرقم' || h === 'رقم الهاتف') {
        headerMap['phone'] = index
      }
      // Address columns
      else if (h.includes('عنوان') || h.includes('address') || h.includes('منطقة') || h === 'العنوان') {
        headerMap['address'] = index
      }
      // Location columns
      else if (h.includes('موقع') || h.includes('location') || h.includes('رابط') || h.includes('خريطة') || h.includes('maps')) {
        headerMap['location'] = index
      }
    })

    // If columns not found by header names, try by position
    if (headerMap['name'] === undefined && headers.length >= 1) {
      headerMap['name'] = 0 // First column
    }
    if (headerMap['phone'] === undefined && headers.length >= 2) {
      headerMap['phone'] = 1 // Second column
    }
    if (headerMap['address'] === undefined && headers.length >= 3) {
      headerMap['address'] = 2 // Third column
    }
    if (headerMap['location'] === undefined && headers.length >= 4) {
      headerMap['location'] = 3 // Fourth column
    }

    // Check required columns
    if (headerMap['name'] === undefined || headerMap['phone'] === undefined) {
      return NextResponse.json({ 
        error: 'الملف يجب أن يحتوي على عمود الاسم وعمود الرقم',
        hint: 'تأكد من وجود أعمدة: الاسم، الرقم، العنوان (اختياري)، الموقع (اختياري)',
        detectedHeaders: headers
      }, { status: 400 })
    }

    // Process rows (skip header)
    const results = {
      total: 0,
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i]
      
      if (!row || row.length === 0) continue
      
      // Check if row is empty
      const rowValues = row.filter((cell: any) => cell !== null && cell !== undefined && String(cell).trim() !== '')
      if (rowValues.length === 0) continue
      
      results.total++

      const name = String(row[headerMap['name']] || '').trim()
      const phone = String(row[headerMap['phone']] || '').trim()
      const address = headerMap['address'] !== undefined 
        ? String(row[headerMap['address']] || '').trim() 
        : ''
      const locationLink = headerMap['location'] !== undefined 
        ? String(row[headerMap['location']] || '').trim() 
        : ''

      // Validate
      if (!name || name === 'undefined' || name === 'null') {
        results.failed++
        results.errors.push(`السطر ${i + 1}: اسم فارغ`)
        continue
      }

      if (!phone || phone === 'undefined' || phone === 'null') {
        results.failed++
        results.errors.push(`السطر ${i + 1}: رقم فارغ - ${name}`)
        continue
      }

      // Clean phone number
      const cleanPhone = phone.replace(/[^0-9+]/g, '')

      try {
        // Insert customer
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .insert({
            name,
            phone: cleanPhone,
            address: address || 'غير محدد',
            location_link: locationLink || null
          })
          .select()
          .single()

        if (customerError) {
          results.failed++
          const errorMsg = customerError.code === '23505' 
            ? 'رقم الهاتف مسجل مسبقاً' 
            : customerError.message
          results.errors.push(`السطر ${i + 1}: ${errorMsg} - ${name}`)
          continue
        }

        // Link to city
        const { error: linkError } = await supabase
          .from('customer_cities')
          .insert({
            customer_id: customer.id,
            city_id: cityId
          })

        if (linkError) {
          // Rollback customer
          await supabase.from('customers').delete().eq('id', customer.id)
          results.failed++
          results.errors.push(`السطر ${i + 1}: فشل ربط المدينة - ${name}`)
          continue
        }

        results.success++
      } catch (err) {
        results.failed++
        results.errors.push(`السطر ${i + 1}: خطأ غير متوقع - ${name}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم استيراد ${results.success} من ${results.total} زبون`,
      details: results
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ 
      error: 'حدث خطأ أثناء الاستيراد',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
