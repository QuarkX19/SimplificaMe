import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejar el preflight request de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { plan_id, email } = await req.json();

    // TU SECRETO DE MERCADO PAGO
    // En producción, carga esto usando Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') o guardándolo en el Dashbord de Supabase
    const ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

    if (!ACCESS_TOKEN) {
      throw new Error('ACCESS_TOKEN de Mercado Pago no configurado en el servidor.');
    }

    // Definir precios según el plan (Mock simple, puedes ajustarlo)
    let amount = 79;
    if (plan_id === 'estrategico') amount = 179;
    if (plan_id === 'empresarial') amount = 499;

    // Crear la Preferencia en Mercado Pago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [
          {
            title: `Suscripción Arquitectura ME - Plan ${plan_id.toUpperCase()}`,
            description: "Plataforma Integral de Gestión y Aceleración Empresarial.",
            category_id: "services",
            quantity: 1,
            currency_id: "USD",
            unit_price: amount
          }
        ],
        payer: {
          email: email
        },
        auto_return: "approved",
        back_urls: {
          success: "https://tudominio.com/hub", // O la URL de producción
          failure: "https://tudominio.com/error-pago",
          pending: "https://tudominio.com/pendiente"
        },
        statement_descriptor: "ARQUITECTURAME"
      })
    });

    const preference = await response.json();

    if (!response.ok) {
      throw new Error(preference.message || 'Error al generar la preferencia de pago.');
    }

    // Devuelve el init_point al frontend (La URL azul larga de Mercado Pago)
    return new Response(
      JSON.stringify({ init_point: preference.init_point }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
