// ==================================================
// SUPABASE EDGE FUNCTION: send-sms
// ==================================================
// Envia SMS e WhatsApp usando Twilio (já configurado)
// Usa credenciais do Supabase Auth Phone
// ==================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Tipos
interface SmsRequest {
  to: string; // Número no formato +5511999999999
  message: string;
  type?: "sms" | "whatsapp"; // Default: sms
  notification_id?: string;
  mockMode?: boolean;
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logNotificationEntry = async (supabaseClient: any, payload: Record<string, any>) => {
  const { notification_id, provider_response } = payload
  const { error } = await supabaseClient.from("notification_logs").insert(payload)

  if (error) {
    console.warn("[send-sms] Failed to log notification, retrying without FK:", error.message)
    const fallbackPayload = {
      ...payload,
      notification_id: null,
      provider_response: {
        ...(provider_response ?? {}),
        reference_id: notification_id,
        note: "Logged without notification_id due to FK constraint"
      }
    }
    await supabaseClient.from("notification_logs").insert(fallbackPayload)
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let parsedBody: SmsRequest | null = null;

  try {
    // Parse request
    parsedBody = await req.json();
    const {
      to,
      message,
      type = "sms",
      notification_id,
      mockMode = false
    }: SmsRequest = parsedBody;

    // Validações
    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar formato do número (deve começar com +)
    if (!to.startsWith("+")) {
      return new Response(
        JSON.stringify({ error: "Phone number must be in E.164 format (+5511999999999)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Twilio credentials (configuradas no Supabase Auth)
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (mockMode || !twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.warn('[send-sms] Mock mode enabled or Twilio credentials missing. Returning mocked success.');

      if (notification_id) {
        await logNotificationEntry(supabase, {
          notification_id,
          channel: type === "whatsapp" ? "whatsapp" : "sms",
          status: "sent",
          provider: "mock",
          provider_response: { message: "Mocked send due to missing Twilio credentials" },
          sent_at: new Date().toISOString(),
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Mocked SMS/WhatsApp (Twilio creds missing)",
          provider: "mock",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Preparar mensagem baseado no tipo
    const fromNumber = type === "whatsapp"
      ? `whatsapp:${twilioPhoneNumber}`
      : twilioPhoneNumber;

    const toNumber = type === "whatsapp"
      ? `whatsapp:${to}`
      : to;

    // Enviar via Twilio API
    const twilioResponse = await sendViaTwilio({
      accountSid: twilioAccountSid,
      authToken: twilioAuthToken,
      from: fromNumber,
      to: toNumber,
      body: message,
    });

    if (!twilioResponse.success) {
      throw new Error(twilioResponse.error || "Failed to send message");
    }

    // Log no banco de dados
    if (notification_id) {
      await logNotificationEntry(supabase, {
        notification_id: notification_id,
        channel: type === "whatsapp" ? "whatsapp" : "sms",
        status: "sent",
        provider: "twilio",
        provider_id: twilioResponse.messageSid,
        provider_response: twilioResponse.response,
        sent_at: new Date().toISOString(),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${type.toUpperCase()} sent successfully`,
        provider: "twilio",
        message_sid: twilioResponse.messageSid,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending message:", error);

    // Log erro no banco se temos notification_id
    if (parsedBody?.notification_id) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        await logNotificationEntry(supabase, {
          notification_id: parsedBody.notification_id,
          channel: parsedBody.type === "whatsapp" ? "whatsapp" : "sms",
          status: "failed",
          provider: "twilio",
          error_message: error.message,
          failed_at: new Date().toISOString(),
        });
      } catch (logError) {
        console.error("Failed to log error:", logError);
      }
    }

    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function para enviar via Twilio API
async function sendViaTwilio(params: {
  accountSid: string;
  authToken: string;
  from: string;
  to: string;
  body: string;
}): Promise<{
  success: boolean;
  messageSid?: string;
  response?: any;
  error?: string;
}> {
  try {
    // Twilio API endpoint
    const url = `https://api.twilio.com/2010-04-01/Accounts/${params.accountSid}/Messages.json`;

    // Basic Auth header
    const auth = btoa(`${params.accountSid}:${params.authToken}`);

    // Body parameters
    const formData = new URLSearchParams();
    formData.append("From", params.from);
    formData.append("To", params.to);
    formData.append("Body", params.body);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: responseData.message || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      messageSid: responseData.sid,
      response: responseData,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
