/**
 * WhatsApp Webhook - Vercel Edge Function
 * Optimized for low latency and cost efficiency
 * 
 * Edge Runtime provides:
 * - 0ms cold starts (~50ms faster than Node.js)
 * - Lower costs (50% cheaper than Node.js runtime)
 * - Global distribution (executes closer to users)
 * - Better scalability (auto-scales instantly)
 * 
 * @see https://vercel.com/docs/functions/runtimes/edge
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks
 * 
 * Migration completed: 06/11/2025
 * Previous: api/webhooks/whatsapp.ts (Node.js serverless - deprecated)
 */

export const runtime = 'edge'; // Vercel Edge Runtime
export const preferredRegion = ['gru1', 'iad1']; // São Paulo + N. Virginia (closest to Brazil)

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'dudufisio_webhook_verify_token_2025';

interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location';
  text?: { body: string };
}

interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: WhatsAppMessage[];
        statuses?: Array<{
          id: string;
          status: 'sent' | 'delivered' | 'read' | 'failed';
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

/**
 * Verify webhook endpoint (GET request from Meta)
 */
function handleVerification(request: Request): Response {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  console.log('[WhatsApp Webhook] Verification request received');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WhatsApp Webhook] Verification successful');
    return new Response(challenge, { status: 200 });
  }

  console.error('[WhatsApp Webhook] Verification failed');
  return new Response(JSON.stringify({ error: 'Verification failed' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Process incoming webhook events (POST request from Meta)
 */
async function handleWebhookEvent(request: Request): Promise<Response> {
  try {
    const payload = await request.json() as WhatsAppWebhookPayload;

    console.log('[WhatsApp Webhook] Event received', {
      object: payload.object,
      entryCount: payload.entry?.length || 0,
    });

    if (payload.object !== 'whatsapp_business_account') {
      return new Response(JSON.stringify({ error: 'Invalid object type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Process each entry asynchronously (non-blocking)
    // Don't await - respond immediately to Meta
    processEntriesAsync(payload.entry);

    // Return 200 immediately to Meta (required within 20 seconds)
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[WhatsApp Webhook] Error processing event:', error);
    
    // Always return 200 to prevent infinite retries from Meta
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Process webhook entries asynchronously
 * This runs in the background without blocking the response to Meta
 */
async function processEntriesAsync(entries: WhatsAppWebhookPayload['entry']) {
  try {
    for (const entry of entries || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'messages') {
          await processMessages(change.value);
        }
      }
    }
  } catch (error) {
    console.error('[WhatsApp Webhook] Background processing error:', error);
  }
}

/**
 * Process incoming messages
 */
async function processMessages(value: any) {
  const messages = value.messages || [];
  const contacts = value.contacts || [];
  const metadata = value.metadata;

  for (const message of messages) {
    try {
      const contact = contacts.find((c: any) => c.wa_id === message.from);
      
      console.log('[WhatsApp Message] Processing', {
        messageId: message.id,
        type: message.type,
        from: message.from,
        hasContact: !!contact,
      });

      // Store message in queue for processing
      await queueMessageForProcessing(message, contact, metadata);

      // Mark as read (optional - sends read receipt)
      // await markMessageAsRead(message.id, metadata.phone_number_id);
    } catch (error) {
      console.error('[WhatsApp Message] Processing error:', error);
    }
  }
}

/**
 * Queue message for asynchronous processing
 * Can integrate with:
 * - Supabase (database)
 * - Vercel KV (Redis)
 * - Queue service (Inngest, Trigger.dev, etc.)
 */
async function queueMessageForProcessing(
  message: WhatsAppMessage,
  contact: any,
  metadata: any
) {
  // TODO: Implement message queuing
  // Options:
  // 1. Store in Supabase table
  // 2. Send to Vercel KV queue
  // 3. Trigger background job
  
  console.log('[WhatsApp Queue] Message queued for processing', {
    messageId: message.id,
    type: message.type,
  });

  // Example: Store in Supabase
  /*
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (supabaseUrl && supabaseKey) {
    const response = await fetch(`${supabaseUrl}/rest/v1/whatsapp_messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        message_id: message.id,
        from_number: message.from,
        message_type: message.type,
        message_body: message.text?.body,
        contact_name: contact?.profile?.name,
        phone_number_id: metadata.phone_number_id,
        received_at: new Date(parseInt(message.timestamp) * 1000).toISOString(),
        status: 'pending',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to store message: ${response.statusText}`);
    }
  }
  */
}

/**
 * Mark message as read (sends read receipt to sender)
 */
async function markMessageAsRead(messageId: string, phoneNumberId: string) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.warn('[WhatsApp] No access token configured');
    return;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark as read: ${response.statusText}`);
    }

    console.log('[WhatsApp] Message marked as read:', messageId);
  } catch (error) {
    console.error('[WhatsApp] Error marking message as read:', error);
  }
}

/**
 * Main Edge Function handler
 */
export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  console.log(`[WhatsApp Webhook] ${request.method} ${url.pathname}`);

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Set CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle webhook verification (GET)
  if (request.method === 'GET') {
    const response = handleVerification(request);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Handle webhook events (POST)
  if (request.method === 'POST') {
    const response = await handleWebhookEvent(request);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Method not allowed
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Allow': 'GET, POST, OPTIONS',
      ...corsHeaders,
    },
  });
}
