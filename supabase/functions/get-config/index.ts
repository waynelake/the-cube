import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const data = {
    supabase_url: Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") || Deno.env.get("SUPABASE_URL") || "",
    anon_key: Deno.env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "",
  };

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
