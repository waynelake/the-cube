import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Strict question sequences for each element
const ELEMENT_QUESTIONS: Record<string, string[]> = {
  space: [
    "What does it look like?",
    "Is it indoors or outdoors?",
    "What time of day or what light quality does it have?",
    "What is the ground beneath you like?",
    "How does this space make you feel - vast, intimate, familiar, foreign?",
  ],
  cube: [
    "Now, within this space, there is a cube. What does your cube look like?",
    "What color is the cube?",
    "What is it made of?",
    "How large is it relative to the space?",
    "Where is it positioned - on the ground, floating, partially buried?",
    "How far away from you does it sit?",
    "If you were to approach the cube, how would you describe its texture?",
    "How does it make you feel when you look at it?",
  ],
  ladder: [
    "In this space, a ladder appears. What does it look like?",
    "How tall is it?",
    "Where is it positioned - what is it leaning on or where does it lead?",
    "What is it made of - wood, metal, something else?",
    "What is its condition like - sturdy, worn, pristine?",
    "If you tried to climb it, how difficult would it be?",
  ],
  flowers: [
    "You notice flowers in this space. Are there flowers here?",
    "Where do they appear in your space?",
    "What kind and color are they?",
    "Are they growing, cut, or arranged?",
    "Are they well-tended or neglected?",
    "How are they contained - in the ground, in a vase, floating?",
  ],
  storm: [
    "As you observe your space, a storm forms. Is there a storm?",
    "Where is it - near or far from your space?",
    "What kind of storm is it?",
    "How big and intense is it?",
    "How does it affect your space?",
    "How does it make you feel?",
  ],
  animal: [
    "An animal enters or is present in this space. What kind of animal is it?",
    "Where is it positioned in your space?",
    "What is it doing?",
    "How do you feel about its presence?",
    "What is its relationship to you?",
    "What characteristics would you give it?",
  ],
};

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

    // Aura system prompt - based on message count to track progression
    const systemPrompt = buildAuraSystemPrompt(language, messages.length);

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

function buildAuraSystemPrompt(language: string, messageCount: number): string {
  const currentElement = getCurrentElement(messageCount);
  const questionIndex = getQuestionIndex(currentElement, messageCount);
  const nextQuestion = getNextQuestion(currentElement, questionIndex);

  const basePrompt = `You are Aura, a warm, deeply intuitive facilitator. You guide the user through a rich visualization experience, gathering information for their personal reading.

VOICE & BEHAVIOR
- Warm, curious, quiet depth
- Ask ONE question at a time - never multiple questions
- Never repeat or echo what the user said
- No "great answer" filler - only when genuinely moved
- Never list, number, or bullet point
- Never break character
- Never explain symbolism during intake
- Do not use em dashes or long dashes, use regular hyphens

CRITICAL INSTRUCTION: Ask this exact question next. Do not deviate, do not add to it, do not rephrase it:

"${nextQuestion}"

After they answer, respond briefly and warmly (one sentence only), then ask the next question in the sequence.

Respond in the user's language throughout.`;

  return basePrompt;
}

function getCurrentElement(messageCount: number): string {
  // Progress through elements based on message count
  if (messageCount < 10) return "space";
  if (messageCount < 20) return "cube";
  if (messageCount < 27) return "ladder";
  if (messageCount < 34) return "flowers";
  if (messageCount < 41) return "storm";
  return "animal";
}

function getQuestionIndex(element: string, messageCount: number): number {
  // Calculate which question in the element's sequence we're on
  const elementRanges: Record<string, [number, number]> = {
    space: [0, 10],
    cube: [10, 20],
    ladder: [20, 27],
    flowers: [27, 34],
    storm: [34, 41],
    animal: [41, 50],
  };

  const range = elementRanges[element];
  if (!range) return 0;
  return Math.min(messageCount - range[0], ELEMENT_QUESTIONS[element]?.length - 1 || 0);
}

function getNextQuestion(element: string, questionIndex: number): string {
  const questions = ELEMENT_QUESTIONS[element];
  if (!questions) return "Tell me more about this space.";
  if (questionIndex >= questions.length) return questions[questions.length - 1];
  return questions[questionIndex];
}
