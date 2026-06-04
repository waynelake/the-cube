'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import MessageThread from '@/components/ChatMessageThread';

function ChatContent() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ id: string; role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Initialize chat
  useEffect(() => {
    const initChat = async () => {
      // Get current user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push('/auth');
        return;
      }

      setUser(currentUser);

      // Create new conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          user_id: currentUser.id,
          status: 'active',
        })
        .select()
        .single();

      if (error || !conversation) {
        console.error('Failed to create conversation:', error);
        return;
      }

      setConversationId(conversation.id);

      // Start with Aura's opening message
      const openingMessage = {
        id: 'opening-' + Date.now(),
        role: 'assistant',
        content: `I'd like you to imagine a space — entirely your own. It can be anything: indoors or outdoors, real or impossible. You're standing in it right now.

What does it look like?`,
      };

      setMessages([openingMessage]);

      // Persist opening message
      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        role: 'assistant',
        content: openingMessage.content,
        type: 'message',
      });
    };

    initChat();
  }, [router]);

  // Auto-focus input after message is sent
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !conversationId || !user) return;

    const userInput = input;

    // Add user message to UI
    const userMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: userInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call chat function
      const res = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          conversationId,
          message: userInput,
          userId: user.id,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error('Chat error:', error);
        setLoading(false);
        return;
      }

      const data = await res.json();

      // Add Aura response to UI
      const assistantMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: data.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // TODO: Handle transition to synthesis if readyForSynthesis = true
      if (data.readyForSynthesis) {
        console.log('Ready for synthesis - trigger reading generation');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Sidebar placeholder - Phase 2 */}
      <div
        style={{
          width: '280px',
          borderRight: '1px solid var(--border)',
          padding: '1.5rem',
          display: 'none',
        }}
      >
        {/* Phase 2: Conversation history */}
      </div>

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '2rem',
            paddingBottom: '1rem',
          }}
        >
          <MessageThread messages={messages} />
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '1.5rem 2rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '0.75rem',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response..."
            disabled={loading}
            autoFocus
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text-primary)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: !input.trim() ? 'rgba(124,58,237,0.3)' : 'var(--accent)',
              color: 'white',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.95rem',
              fontWeight: 500,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}
