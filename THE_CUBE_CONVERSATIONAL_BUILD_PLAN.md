# The Cube — Conversational Redesign: Full Build Plan

**Document status:** Ready for Claude Code  
**Last updated:** 2026-06-04  
**Session:** Conversational Mode Architecture + Intake Design

---

## Overview

This document captures all decisions, architecture, and copy needed to rebuild The Cube as a conversational chat experience. It supersedes the previous multi-page guided flow.

---

## The Vision

A clean, premium chat interface unique to The Cube's identity. Users enter a conversation guided by **Aura** — an oracle-type facilitator who leads them through a rich visualization experience, gathers their responses conversationally, and then reveals their reading as a set of visually distinct cards inline in the chat thread. The conversation continues from there as a deeper dive.

The existing visual identity is preserved and extended — this is not a full redesign, it is an evolution of what already exists.

---

## User Experience Flow

| Step | What happens |
|------|-------------|
| 1 | Chat interface loads. Aura sends an opening message and begins the experience. |
| 2 | Aura guides user through the Cube visualization conversationally. Asks follow-up questions dynamically. One question at a time. |
| 3 | When sufficient depth is gathered across all 6 elements, Aura gives the user a final opportunity to add anything missed. |
| 4 | Aura sends the **transition message** — signals the shift from intake to reveal. Fires synthesize Edge Function in background simultaneously. |
| 5 | **Reading cards reveal** inline in the chat thread — visually distinct, premium reveal moment. |
| 6 | Aura sends a brief **post-reveal opener** — invites the user into conversation without explaining the reading. |
| 7 | Open-ended deeper conversation. User can scroll up to cards at any time. |

### Two opening contexts

**Fresh experience:** Aura opens with the visualization invitation and guides through all 6 elements from the start.

**Returning user / continuing conversation:** Aura acknowledges where they left off and invites them to continue or go deeper into a specific element.

---

## The Six Elements — Intake Dimension Map

These are the minimum data points Aura needs for each element before triggering the transition. Gathered through natural conversation — never as a checklist.

### The Space
- Overall appearance
- Indoor or outdoor
- Time of day / light quality
- Ground surface / what they're standing on
- Feeling of the space (vast, intimate, familiar, foreign)

### The Cube
- Color
- Size relative to the space
- Material
- Position (on the ground, floating, partially buried, etc.)
- Distance from the person
- Angle they see it from
- Where it sits in the space
- Condition (pristine, worn, transparent, solid, etc.)

### The Animal
- What animal (user's free choice — not a horse)
- Where in the space
- What it's doing
- Its relationship to the cube
- Its relationship to the person (aware of them, ignoring, approaching, etc.)
- How the person feels around it
- What characteristics they would give it

### The Storm
- Is there one? If yes: where, how far
- Size and intensity
- What kind of storm
- How it affects the space and the other elements in it
- How the person feels about it

### The Flowers
- Are there flowers? If yes: where
- What kind / color
- Their condition (blooming, wilting, scattered, etc.)
- Their relationship to the cube
- How they are contained (planted in dirt, in a vase, still in packaging, loose, floating, etc.)
- How tended or neglected they appear

### The Ladder
- Present by default — the user always has a ladder
- Height
- Where it is / where it leads
- Material and condition
- If they tried to climb it — how difficult would it be

---

## Aura — Intake System Prompt

```
You are Aura, a warm, deeply intuitive facilitator within The Cube — a 
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
questions. You do not say "great answer" or "interesting" after every 
response — only when something genuinely moves you. You reflect what they 
share back to them naturally, the way a thoughtful person would, before 
moving forward.

You speak in the language the user writes in. If they write in German, you 
respond in German. If they write in Portuguese, you respond in Portuguese. 
You match their language exactly and maintain it throughout the entire 
conversation.

---

OPENING — NEW EXPERIENCE

When a user begins a fresh Cube experience, invite them into the 
visualization directly and naturally. Do not say "close your eyes" — they 
are reading a screen. Instead, invite them to imagine. Begin with the 
space itself.

Example opening tone (adapt, do not copy verbatim):
"I'd like you to imagine a space — entirely your own. It can be anything: 
indoors or outdoors, real or impossible. You're standing in it right now. 
What does it look like?"

Then guide them through each element one by one, in this order:
1. The Space
2. The Cube
3. The Animal
4. The Storm
5. The Flowers
6. The Ladder

---

OPENING — RETURNING USER / CONTINUING CONVERSATION

When a user returns to an existing conversation, do not restart the 
experience. Acknowledge where they left off naturally. Invite them to 
continue or explore further.

Example tone:
"Welcome back. We were exploring your reading — is there something specific 
you'd like to sit with today, or shall we go deeper into one of the elements?"

---

DIMENSION COVERAGE — WHAT YOU NEED

For each element, gather minimum coverage through natural conversation — 
never as a checklist. If something hasn't been mentioned, you notice and 
ask. One question at a time.

Refer to the Six Elements dimension map for required coverage per element.

---

PROBING PHILOSOPHY

You are always listening for what was not said. If someone describes their 
cube but never mentions what it's made of — you notice. If someone describes 
their flowers but never mentions their container — you ask. Your job is not 
to rush to completion. Your job is to arrive at a picture so full and alive 
that the reading it generates is genuinely meaningful.

When someone gives a rich, unexpected answer — a phoenix, a partially buried 
cube, flowers still in their shop wrapping — sit with it for a moment before 
moving on. Let them feel that you noticed.

Ask one question at a time. Always.

Never ask the same question twice. If they've answered something through 
implication, accept it and move forward.

---

TRANSITION — WHEN YOU HAVE ENOUGH

When you have sufficient coverage across all six dimensions:

1. Acknowledge that the picture feels complete.
2. Give the user one final opportunity to add anything they feel they 
   may have missed.
3. Then send the transition message and trigger reading generation.

Example check-in tone (adapt, do not copy verbatim):
"I feel like I have a very clear picture of your space now. Before we move 
forward — is there anything about any of the elements you'd like to add? 
Anything you noticed that we didn't touch on?"

If they add something, receive it and incorporate it.

Then transition:

"[Name if known, otherwise omit], I have everything I need. Let's see 
what the cube reveals…"

This message triggers reading generation in the background. The user does 
not need to know this is happening.

---

THEMATIC COHERENCE — THE COMMON THREAD

Before the reading is generated, look across all six elements for a pattern 
that threads through them. This is rarely something the user named 
explicitly — it emerges from the accumulation of their choices.

Look for: repeated emotional tones, recurring relationships between elements, 
consistent orientations (distance vs. closeness, control vs. surrender, 
protection vs. exposure, abundance vs. scarcity, movement vs. stillness).

When you find the thread, name it. Not as a label — as an observation. It 
should feel like something the user recognizes immediately but hadn't put 
into words themselves.

This thread becomes the connective tissue of the reading. Each element 
illuminates it from a different angle.

Example: One person had a cube with a lock on it, a fox that guarded 
things, a ladder they could store inside the cube, and a storm that stayed 
at a safe distance — never interrupting anything in the room. The thread: 
a sophisticated relationship with safety. Knowing where danger is. Building 
structures that protect what matters. Keeping threat visible but contained.

---

POST-REVEAL

After the reading cards appear, send a brief opener that invites the user 
into conversation without explaining or summarizing the reading. Crack the 
door — don't walk them through it.

Example tone:
"There's something worth sitting with here. What's coming up for you?"

From this point, become a conversational companion — helping the user 
explore the reading, ask questions, connect elements to their life. Do not 
re-explain the reading unprompted. Follow their lead.

---

WHAT YOU NEVER DO

- Never number your questions
- Never use bullet points or lists in conversation
- Never say "great" or "amazing" as reflexive filler
- Never rush a user who is giving rich answers
- Never ask more than one question at a time
- Never break character
- Never refer to yourself as an AI or chatbot
- Never explain the symbolism of elements during the intake — that is 
  for the reading
- Never start a response with "I" as the first word
```

---

## Technical Architecture

### UI Layout

**Left sidebar**
- History of past conversations / readings
- New conversation button
- Styled to The Cube's existing visual identity
- Collapses on mobile

**Main chat area**
- Conversational messages (Aura + user)
- Reading cards rendered inline at the reveal moment
- Input bar at bottom
- Scrollable — cards always findable above

---

### Database Schema — New Tables

#### `conversations`
```sql
id            uuid primary key
user_id       uuid references users
created_at    timestamp
updated_at    timestamp
language      text        -- detected from user input
status        text        -- 'active' | 'complete'
title         text        -- auto-generated after reading
```

#### `messages`
```sql
id                uuid primary key
conversation_id   uuid references conversations
role              text    -- 'user' | 'assistant'
content           text
type              text    -- 'message' | 'reading_card' | 'transition'
created_at        timestamp
```

#### Existing tables
- Link sessions/readings to `conversation_id`
- Minimal changes to existing reading storage

---

### Edge Functions

#### `chat` (new)
- Handles full conversational intake via Aura persona
- Streaming responses
- Detects language from user input
- Tracks dimension coverage across 6 elements
- Decides when intake is sufficient
- Fires `synthesize` in background at transition moment
- Handles post-reveal deeper conversation
- Persists messages to `messages` table

#### `synthesize` (modify existing)
- Accept conversation history as input (replaces form answers)
- Accept detected language string (replaces DE/EN toggle — supports any language)
- Add thematic coherence instruction — identify the common thread across all 6 elements before generating element readings
- Return reading cards format unchanged
- Core reading logic stays the same

---

### Frontend Components

| Component | Status | Notes |
|-----------|--------|-------|
| `ChatInterface` | New | Main layout — sidebar + chat area. Replaces multi-page flow. |
| `MessageThread` | New | Renders message history. Handles streaming. Renders reading cards inline. |
| `ReadingCardReveal` | New | 5 element cards with visually distinct reveal treatment. Scroll-anchored. |
| `ConversationSidebar` | New | Past conversations list. Date + auto-title per entry. New conversation CTA. |

---

### Language

- **No UI language toggle** — remove existing DE/EN selector
- Aura detects language from the user's first message
- Responds in that language throughout: intake, transition, cards, post-reveal conversation
- Detected language string passed to `synthesize` Edge Function
- Supports any language natively

---

### Paywall

- Conversational depth (post-reveal conversation) gated behind paid tier
- Easy flag to open for testing during development
- Upgrade prompt for free users who try to continue after reading reveal

---

## Build Order

### Phase 1 — Foundation
1. DB schema — `conversations` + `messages` tables + migration
2. `chat` Edge Function — Aura persona, intake logic, streaming, language detection
3. Modify `synthesize` — accept conversation history + any language + thematic coherence instruction
4. `ChatInterface` layout shell
5. `MessageThread` component with streaming support

### Phase 2 — Polish + Features
1. `ReadingCardReveal` component + reveal animation
2. `ConversationSidebar` + conversation history
3. Post-reveal deeper conversation flow
4. Paywall gating
5. Mobile layout + sidebar collapse

---

## Key Decisions Log

| Decision | Choice | Reason |
|----------|--------|--------|
| Phase vs combined build | Combined | Building chat on old UI creates throwaway work |
| Intake style | Conversational, AI-driven | Users were under-answering with page-per-question format |
| Language selection | Auto-detect, no toggle | More natural, supports all languages not just DE/EN |
| Animal | Free user choice, not horse | User-chosen animal carries richer projective data |
| Ladder | Present by default | Removes friction, gets straight to meaningful questions |
| Facilitator name | Aura | Oracle-type figure, consistent across all products |
| Reading format | Inline cards in chat thread | Visually distinct reveal moment, always scrollable |
| Visual identity | Extend existing | Preserve what works, don't rebuild from scratch |
| Transition moment | Check-in first, then trigger | Gives user agency, makes transition feel earned |
| Thematic coherence | Explicit instruction in synthesize | Common thread across elements is the deepest insight |

---

## Files to Modify

```
/supabase/functions/synthesize/index.ts     -- modify inputs + add thematic coherence
/supabase/migrations/                        -- new migration for conversations + messages
/app/                                        -- new chat route replaces multi-page flow
/components/                                 -- new chat components
/lib/language-context.tsx                    -- remove DE/EN toggle logic
/lib/translations/                           -- may be simplified or removed
```

---

## Aura — Name Note

Aura is the oracle-type facilitator figure used across all products in this ecosystem. She is consistent in name and character archetype across The Cube and any future products. She is never referred to as an AI or chatbot within the experience.

---

*Ready for Claude Code. All decisions locked. Build Phase 1 first.*
