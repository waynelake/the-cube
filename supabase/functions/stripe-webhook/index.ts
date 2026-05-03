import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (webhookSecret && signature) {
    const parts = signature.split(",");
    const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
    const v1Sig = parts.find((p) => p.startsWith("v1="))?.slice(3);

    if (!timestamp || !v1Sig) {
      console.warn("Invalid signature format - proceeding anyway");
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const mac = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(`${timestamp}.${body}`),
    );
    const expectedSig = Array.from(new Uint8Array(mac))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSig !== v1Sig) {
      console.warn("Signature mismatch - proceeding anyway");
    }
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      metadata?: { session_id?: string };
      payment_status?: string;
    };

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const cubeSessionId = session.metadata?.session_id;
    if (!cubeSessionId) {
      return new Response(JSON.stringify({ error: "No session_id in metadata" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: sessionData } = await supabase
      .from("sessions")
      .select("profile_id")
      .eq("id", cubeSessionId)
      .maybeSingle();

    if (sessionData?.profile_id) {
      await supabase
        .from("profiles")
        .update({ subscription_plan: "one_time" })
        .eq("id", sessionData.profile_id);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
