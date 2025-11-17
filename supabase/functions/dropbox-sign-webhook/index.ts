import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the webhook event
    const body = await req.json();
    console.log('Webhook recibido de Dropbox Sign:', JSON.stringify(body, null, 2));

    const event = body.event;
    
    if (!event) {
      console.error('No se encontró evento en el webhook');
      return new Response('OK', { status: 200 }); // Always return 200 to Dropbox Sign
    }

    const eventType = event.event_type;
    const signatureRequest = event.signature_request;

    if (!signatureRequest) {
      console.error('No se encontró signature_request en el evento');
      return new Response('OK', { status: 200 });
    }

    const signatureRequestId = signatureRequest.signature_request_id;
    const orderId = signatureRequest.metadata?.order_id;

    console.log('Evento tipo:', eventType);
    console.log('Signature Request ID:', signatureRequestId);
    console.log('Order ID:', orderId);

    if (!orderId) {
      console.error('No se encontró order_id en metadata');
      return new Response('OK', { status: 200 });
    }

    // Handle different event types
    switch (eventType) {
      case 'signature_request_signed':
      case 'signature_request_all_signed': {
        console.log('Todos los firmantes han firmado');
        
        // Get the signed document URL
        const filesUrl = signatureRequest.files_url;
        
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            signature_status: 'signed',
            signed_document_url: filesUrl,
            signature_completed_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        if (updateError) {
          console.error('Error actualizando orden:', updateError);
        } else {
          console.log('Orden actualizada exitosamente como firmada');
        }
        break;
      }

      case 'signature_request_declined': {
        console.log('El firmante rechazó la solicitud');
        
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            signature_status: 'declined',
          })
          .eq('id', orderId);

        if (updateError) {
          console.error('Error actualizando orden:', updateError);
        } else {
          console.log('Orden actualizada como rechazada');
        }
        break;
      }

      case 'signature_request_sent': {
        console.log('Solicitud de firma enviada');
        // Already handled in send-to-sign function
        break;
      }

      default:
        console.log('Evento no manejado:', eventType);
    }

    // Always return 200 OK to Dropbox Sign
    return new Response('OK', { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
    });

  } catch (error) {
    console.error('Error en webhook:', error);
    // Still return 200 to avoid retries from Dropbox Sign
    return new Response('OK', { status: 200 });
  }
});
