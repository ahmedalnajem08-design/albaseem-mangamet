import { NextRequest, NextResponse } from 'next/server'

// WhatsApp Business API Configuration
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0'
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID

// Send a text message
async function sendTextMessage(to: string, text: string) {
  const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'text',
      text: {
        preview_url: false,
        body: text
      }
    })
  })

  return response.json()
}

// Send a template message (for initial verification)
async function sendTemplateMessage(to: string, templateName: string, languageCode: string = 'ar') {
  const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode
        }
      }
    })
  })

  return response.json()
}

// Send an image message
async function sendImageMessage(to: string, imageUrl: string, caption?: string) {
  const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'image',
      image: {
        link: imageUrl,
        caption: caption || ''
      }
    })
  })

  return response.json()
}

// GET - Check WhatsApp configuration status
export async function GET() {
  try {
    if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
      return NextResponse.json({
        success: false,
        configured: false,
        message: 'WhatsApp Business API غير مُعد. يرجى إضافة المفاتيح في الإعدادات.'
      })
    }

    // Test the API by getting phone number info
    const url = `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}`
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      }
    })

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({
        success: false,
        configured: true,
        error: data.error.message,
        message: 'خطأ في الاتصال بـ WhatsApp API'
      })
    }

    return NextResponse.json({
      success: true,
      configured: true,
      phoneNumber: data.display_phone_number || 'Unknown',
      qualityRating: data.quality_rating || 'Unknown'
    })
  } catch (error) {
    console.error('WhatsApp status check error:', error)
    return NextResponse.json({
      success: false,
      configured: false,
      message: 'حدث خطأ أثناء التحقق من الإعدادات'
    })
  }
}

// POST - Send message(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, to, message, imageUrl, templateName, recipients } = body

    // Check configuration
    if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
      return NextResponse.json({
        success: false,
        error: 'WhatsApp Business API غير مُعد'
      }, { status: 400 })
    }

    // Format phone number (remove non-digits, add country code if needed)
    const formatPhone = (phone: string) => {
      let formatted = phone.replace(/[^0-9]/g, '')
      // Add Iraq country code if not present
      if (!formatted.startsWith('964') && formatted.startsWith('0')) {
        formatted = '964' + formatted.substring(1)
      }
      return formatted
    }

    // Send single message
    if (action === 'send' && to && message) {
      const formattedPhone = formatPhone(to)
      let result

      if (imageUrl) {
        result = await sendImageMessage(formattedPhone, imageUrl, message)
      } else {
        result = await sendTextMessage(formattedPhone, message)
      }

      if (result.error) {
        return NextResponse.json({
          success: false,
          error: result.error.message || 'فشل إرسال الرسالة'
        })
      }

      return NextResponse.json({
        success: true,
        messageId: result.messages?.[0]?.id,
        to: formattedPhone
      })
    }

    // Send template message
    if (action === 'template' && to && templateName) {
      const formattedPhone = formatPhone(to)
      const result = await sendTemplateMessage(formattedPhone, templateName)

      if (result.error) {
        return NextResponse.json({
          success: false,
          error: result.error.message || 'فشل إرسال القالب'
        })
      }

      return NextResponse.json({
        success: true,
        messageId: result.messages?.[0]?.id
      })
    }

    // Bulk send
    if (action === 'bulk' && recipients && message) {
      const results = []
      
      for (const recipient of recipients) {
        const formattedPhone = formatPhone(recipient.phone)
        
        try {
          let result
          if (imageUrl) {
            result = await sendImageMessage(formattedPhone, imageUrl, message)
          } else {
            result = await sendTextMessage(formattedPhone, message)
          }

          results.push({
            phone: recipient.phone,
            name: recipient.name,
            status: result.error ? 'failed' : 'sent',
            error: result.error?.message || null,
            messageId: result.messages?.[0]?.id || null
          })

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (err) {
          results.push({
            phone: recipient.phone,
            name: recipient.name,
            status: 'failed',
            error: 'خطأ في الاتصال'
          })
        }
      }

      return NextResponse.json({
        success: true,
        total: recipients.length,
        sent: results.filter(r => r.status === 'sent').length,
        failed: results.filter(r => r.status === 'failed').length,
        results
      })
    }

    return NextResponse.json({
      success: false,
      error: 'طلب غير صالح'
    }, { status: 400 })
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ أثناء الإرسال'
    }, { status: 500 })
  }
}
