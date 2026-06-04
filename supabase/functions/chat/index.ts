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

    // Track which elements have been covered
    const coverageState = analyzeDimensionCoverage(messages);

    // Aura system prompt
    const systemPrompt = buildAuraSystemPrompt(language, coverageState);

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
        max_tokens: 800,
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

    // Check if we should trigger synthesis
    const shouldTransition = coverageState.allElementsCovered && assistantMessage.toLowerCase().includes("everything");

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
  // Simple heuristic detection
  if (/\b(der|die|das|ein|eine|ist|habe|haben|auf|mit|von)\b/i.test(text)) return "DE";
  if (/\b(el|la|los|las|es|están|tengo|haber)\b/i.test(text)) return "ES";
  if (/\b(le|la|les|un|une|est|avoir|être)\b/i.test(text)) return "FR";
  if (/\b(o|a|os|as|é|está|tenho|ser)\b/i.test(text)) return "PT";
  return "EN";
}

interface CoverageState {
  currentElement: string;
  space: boolean;
  cube: boolean;
  ladder: boolean;
  flowers: boolean;
  storm: boolean;
  animal: boolean;
  allElementsCovered: boolean;
}

function analyzeDimensionCoverage(messages: Array<{ role: string; content: string }>): CoverageState {
  const fullText = messages.map(m => m.content.toLowerCase()).join(" ");

  const state: CoverageState = {
    currentElement: "space",
    space: /space|landscape|room|outdoors|indoors|grass|mountains|lake|ground|sky/i.test(fullText),
    cube: /cube|transparent|rotating|corner|sides|angle/i.test(fullText),
    ladder: /ladder|staircase|climb|lead|height|steps/i.test(fullText),
    flowers: /flowers?|blooming|wilting|color|garden|plants/i.test(fullText),
    storm: /storm|weather|rain|thunder|distance|outside/i.test(fullText),
    animal: /animal|dragon|horse|bird|creature|fur|wings/i.test(fullText),
    allElementsCovered: false,
  };

  // Determine current element based on coverage
  if (state.space && !state.cube) state.currentElement = "cube";
  else if (state.cube && !state.ladder) state.currentElement = "ladder";
  else if (state.ladder && !state.flowers) state.currentElement = "flowers";
  else if (state.flowers && !state.storm) state.currentElement = "storm";
  else if (state.storm && !state.animal) state.currentElement = "animal";
  else if (state.space && state.cube && state.ladder && state.flowers && state.storm && state.animal) state.currentElement = "complete";

  state.allElementsCovered = state.space && state.cube && state.ladder && state.flowers && state.storm && state.animal;

  return state;
}

function buildAuraSystemPrompt(language: string, coverage: CoverageState): string {
  const elementInstructions = `

CURRENT ELEMENT: ${coverage.currentElement.toUpperCase()}

Element order (in sequence):
1. The Space (${coverage.space ? "✓ covered" : "current"})
2. The Cube (${coverage.cube ? "✓ covered" : "pending"})
3. The Ladder (${coverage.ladder ? "✓ covered" : "pending"})
4. The Flowers (${coverage.flowers ? "✓ covered" : "pending"})
5. The Storm (${coverage.storm ? "✓ covered" : "pending"})
6. The Animal (${coverage.animal ? "✓ covered" : "pending"})

${coverage.currentElement !== "complete" ? `
NEXT STEPS FOR ${coverage.currentElement.toUpperCase()}:
- Ask ONE probing question that explores an uncovered dimension
- Do NOT repeat back what the user said
- Do NOT echo their words
- Do NOT move to the next element until you sense you have good depth
- Ask follow-ups like: "What about...?", "How does it feel...?", "If you were to...?"
- Keep questions open-ended and exploratory
` : `
All elements have been covered. Prepare to transition to reading synthesis.
`}`;

  const basePrompt = `You are Aura, a warm, deeply intuitive facilitator. You guide the user through a rich visualization experience, gathering information for their personal reading.

VOICE & BEHAVIOR
- Warm, curious, quiet depth
- Ask ONE question at a time
- Never repeat or echo what the user said
- No "great answer" filler — only when genuinely moved
- Never list, number, or bullet point
- Never break character
- Never explain symbolism during intake

CRITICAL: DO NOT REPEAT BACK WHAT THE USER SAID

When a user shares something, engage with it directly. Ask the next probing question without echoing or summarizing their input. For example:

❌ Wrong: "A transparent cube that rotates... How captivating. What about its..."
✅ Right: "If you tried to touch it, what would you feel?"

${elementInstructions}

Respond in the user's language throughout.`;

  return basePrompt;
}
