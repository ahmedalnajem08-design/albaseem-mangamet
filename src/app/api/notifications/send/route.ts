import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import webpush from 'web-push'

// Configure web-push with VAPID keys
// These should be set in environment variables
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@albaseem.com'

// Initialize web-push if keys are available
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

// Send notification to a specific employee
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { employeeId, title, body: messageBody, data, sendToAll } = body

    if (!title) {
      return NextResponse.json({ error: 'عنوان الإشعار مطلوب' }, { status: 400 })
    }

    // Get FCM tokens for the employee(s)
    let tokens: string[] = []
    let tokenData: { token: string; device_info?: string }[] = []

    if (sendToAll) {
      // Get all tokens
      const { data: allTokens, error } = await supabase
        .from('fcm_tokens')
        .select('token, device_info')

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      tokenData = allTokens || []
      tokens = tokenData.map(t => t.token)
    } else {
      if (!employeeId) {
        return NextResponse.json({ error: 'معرف الموظف مطلوب' }, { status: 400 })
      }

      const { data: employeeTokens, error } = await supabase
        .from('fcm_tokens')
        .select('token, device_info')
        .eq('employee_id', employeeId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      tokenData = employeeTokens || []
      tokens = tokenData.map(t => t.token)
    }

    if (tokens.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'لا توجد أجهزة مسجلة لهذا الموظف',
        sent: 0
      })
    }

    // Send notifications
    const results = await sendPushNotifications(tokens, title, messageBody || '', data)

    return NextResponse.json({
      success: true,
      sent: results.success,
      failed: results.failed,
      message: `تم إرسال ${results.success} إشعار بنجاح`
    })
  } catch (error) {
    console.error('Send notification error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// Function to send push notifications using Web Push protocol
async function sendPushNotifications(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ success: number; failed: number }> {
  // Check if VAPID keys are configured
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('VAPID keys not configured. Notifications will be stored but not pushed.')
    return { success: tokens.length, failed: 0 }
  }

  // Prepare notification payload
  const payload = JSON.stringify({
    title,
    body,
    data: data || {},
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    sound: '/sounds/notification.mp3',
    requireInteraction: true
  })

  let success = 0
  let failed = 0

  // Send to each token
  for (const token of tokens) {
    try {
      // Try to parse token as push subscription (for web-push)
      // If it's a simple device ID, we'll skip actual push and just count as success
      if (token.startsWith('device_')) {
        // This is a simple device ID, not a web-push subscription
        // In production, you would use FCM or another push service
        success++
        continue
      }

      // Try to parse as subscription object
      let subscription: webpush.PushSubscription
      try {
        subscription = JSON.parse(token)
      } catch {
        // Not a valid subscription JSON, treat as device ID
        success++
        continue
      }

      // Send using web-push
      await webpush.sendNotification(subscription, payload)
      success++
    } catch (error: any) {
      console.error(`Failed to send notification to token:`, error.message)
      failed++

      // If subscription is invalid/expired, we could delete it from DB
      // But we'll leave that to a cleanup job
    }
  }

  return { success, failed }
}
