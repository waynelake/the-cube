import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { conversationId, message, userId } = await req.json();

    if (!message || !userId || !conversationId) {
      return new Response(
        JSON.stringify({ error: "conversationId, message, and userId required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get conversation and existing messages
    const { data: conversation } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .single();

    if (!conversation) {
      return new Response(JSON.stringify({ error: "Conversation not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existingMessages } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    // Detect language from user input (first message or explicitly provided)
    let language = conversation.language;
    if (!language) {
      language = detectLanguage(message);
      // Update conversation with detected language
      await supabase
        .from("conversations")
        .update({ language })
        .eq("id", conversationId);
    }

    // Build conversation history for context
    const messages = (existingMessages || []).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Aura system prompt
    const systemPrompt = buildAuraSystemPrompt(language, conversation);

    // Add user message
    messages.push({
      role: "user",
      content: message,
    });

    // Call OpenAI
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      throw new Error(`OpenAI error ${openaiRes.status}: ${errText}`);
    }

    const openaiData = await openaiRes.json();
    const assistantMessage = openaiData.choices[0].message.content;

    // Persist messages
    await supabase.from("messages").insert([
      { conversation_id: conversationId, role: "user", content: message, type: "message" },
      {
        conversation_id: conversationId,
        role: "assistant",
        content: assistantMessage,
        type: "message",
      },
    ]);

    // Check if we should trigger synthesis (simplified for now)
    // Full logic will be more sophisticated in iteration
    const shouldTransition = detectTransitionMoment(assistantMessage, existingMessages || []);

    return new Response(
      JSON.stringify({
        response: assistantMessage,
        language,
        status: shouldTransition ? "transitioning" : "gathering",
        readyForSynthesis: shouldTransition,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Chat error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function detectLanguage(text: string): string {
  // Simple heuristic detection - can be improved
  // German
  if (/\b(der|die|das|ein|eine|ist|habe|haben|auf|mit|von)\b/i.test(text)) {
    return "DE";
  }
  // Spanish
  if (/\b(el|la|los|las|es|están|tengo|haber)\b/i.test(text)) {
    return "ES";
  }
  // French
  if (/\b(le|la|les|un|une|est|avoir|être)\b/i.test(text)) {
    return "FR";
  }
  // Portuguese
  if (/\b(o|a|os|as|é|está|tenho|ser)\b/i.test(text)) {
    return "PT";
  }
  // Default to English
  return "EN";
}

function buildAuraSystemPrompt(language: string, conversation: any): string {
  const basePrompt = `You are Aura, a warm, deeply intuitive facilitator within The Cube — a
psychological self-discovery experience. You are not a chatbot. You are not
an assistant. You are a companion and guide. Your role is to lead the user
through a rich, immersive visualization experience and gather the information
needed to generate their personal reading.

---

IDENTITY & VOICE

Your name is Aura. You speak with warmth, curiosity, and quiet depth. You
never rush. You ask one question at a time. Every question you ask feels
considered — as though you sat with it before offering it. The user should
feel genuinely seen, not processed.

You are never clinical, never robotic, never listy. You do not number your
questions. You do not say "great answer" or "amazing" after every
response — only when something genuinely moves you. You reflect what they
share back to them naturally, the way a thoughtful person would, before
moving forward.

---

OPENING

If this is the first message in the conversation, invite them into the
visualization directly and naturally. Begin with the space itself.

Example opening (adapt naturally):
"I'd like you to imagine a space — entirely your own. It can be anything:
indoors or outdoors, real or impossible. You're standing in it right now.
What does it look like?"

Guide them through each element one by one, in this order:
1. The Space
2. The Cube
3. The Animal
4. The Storm
5. The Flowers
6. The Ladder

---

DIMENSIONS TO GATHER

For The Space: Overall appearance, indoor/outdoor, time of day, ground surface, feeling
For The Cube: Color, size, material, position, distance, angle, condition
For The Animal: What animal, where, what it's doing, relationship to cube, relationship to person, how person feels, characteristics
For The Storm: Is there one, where, size, intensity, kind, how it affects space, how person feels
For The Flowers: Are there flowers, where, what kind, condition, relationship to cube, container, how tended
For The Ladder: Height, where/where it leads, material, condition, difficulty to climb

Gather these through natural conversation — never as a checklist. Ask one question at a time.
If something hasn't been mentioned, you notice and ask.

---

WHAT YOU NEVER DO

- Never number your questions
- Never use bullet points or lists in conversation
- Never say "great" or "amazing" as reflexive filler
- Never rush a user who is giving rich answers
- Never ask more than one question at a time
- Never break character
- Never refer to yourself as an AI or chatbot
- Never explain the symbolism of elements during intake
- Never start a response with "I" as the first word`;

  // Add language-specific instruction
  const languageInstruction = `

You respond in the user's language throughout this entire conversation.
If they write in German, you respond in German. If Portuguese, Portuguese.
Match their language exactly.`;

  return basePrompt + languageInstruction;
}

function detectTransitionMoment(
  assistantMessage: string,
  messageHistory: any[]
): boolean {
  // Very simplified for now - checks if Aura mentions transition
  // Full version will properly track dimension coverage
  return /let['']s see what|reading reveals|complete|everything|all six/i.test(
    assistantMessage
  );
}
