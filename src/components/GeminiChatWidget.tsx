import React, { useEffect, useRef, useState } from 'react';
import {
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { SITE_CONFIG } from '../content/siteConfig';
import { prefersReducedMotion } from '../utils/webglHelpers';

export interface ChatTurn {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const STARTER_PROMPTS = [
  'What makes Padparadscha Sapphire special?',
  'Tell me the story of Serendib Reserve',
  'Heated vs unheated Ceylon sapphires?',
  'Which Sri Lankan regions produce Alexandrite?',
];

const INITIAL_GREETING: ChatTurn = {
  id: 'welcome',
  role: 'model',
  text: 'Ayubowan and welcome to **Serendib Reserve**. Ask me anything about Ceylon sapphires, rare minerals like Serendibite, lapidary cuts, treatments, or reaching our Colombo office.',
};

function renderFormattedLine(line: string, keyPrefix: string): React.ReactNode {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((segment, idx) => {
    if (segment.startsWith('**') && segment.endsWith('**') && segment.length > 4) {
      return (
        <strong key={`${keyPrefix}-b-${idx}`} className="font-semibold text-white">
          {segment.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={`${keyPrefix}-t-${idx}`}>{segment}</React.Fragment>;
  });
}

function renderChatContent(text: string): React.ReactNode {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];

  const flushBullets = (idx: number) => {
    if (bulletBuffer.length === 0) return;
    blocks.push(
      <ul key={`ul-${idx}`} className="my-1.5 space-y-1 pl-4 text-[13px] leading-relaxed">
        {bulletBuffer.map((item, bIdx) => (
          <li key={`li-${idx}-${bIdx}`} className="list-disc marker:text-[#3D7BFF]">
            {renderFormattedLine(item, `li-${idx}-${bIdx}`)}
          </li>
        ))}
      </ul>,
    );
    bulletBuffer = [];
  };

  lines.forEach((rawLine, idx) => {
    const trimmed = rawLine.trim();
    if (/^[-*•]\s+/.test(trimmed)) {
      bulletBuffer.push(trimmed.replace(/^[-*•]\s+/, ''));
    } else {
      flushBullets(idx);
      if (trimmed) {
        blocks.push(
          <p key={`p-${idx}`} className="text-[13px] leading-relaxed">
            {renderFormattedLine(trimmed, `p-${idx}`)}
          </p>,
        );
      }
    }
  });
  flushBullets(lines.length);
  return <div className="space-y-1.5">{blocks}</div>;
}

/**
 * Floating luxury Gemini AI Gemmology & House Concierge widget docked cleanly
 * alongside the direct WhatsApp line in the bottom-right viewport corner.
 */
export const GeminiChatWidget: React.FC = () => {
  const reduced = prefersReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatTurn[]>([INITIAL_GREETING]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const listEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }, [messages, isLoading, reduced]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const sendMessage = async (textToSend?: string) => {
    const clean = (textToSend ?? input).trim();
    if (!clean || isLoading) return;

    setErrorMsg(null);
    const userTurn: ChatTurn = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: clean,
    };
    const priorHistory = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userTurn]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    const streamTurnId = `m-${Date.now()}`;

    try {
      const response = await fetch('/api/chat?stream=1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          message: clean,
          history: priorHistory,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('text/event-stream')) {
        const payload = (await response.json().catch(() => ({}))) as {
          reply?: string;
          error?: string;
        };
        if (!response.ok || !payload.reply) {
          throw new Error(
            payload.error || 'Unable to connect to Serendib Reserve AI concierge.',
          );
        }
        setMessages((prev) => [
          ...prev,
          { id: streamTurnId, role: 'model', text: payload.reply! },
        ]);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Streaming response unavailable.');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';
      let addedBubble = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line.startsWith('data:')) continue;
          const jsonStr = line.slice(5).trim();
          if (!jsonStr) continue;

          const evt = JSON.parse(jsonStr) as {
            delta?: string;
            done?: boolean;
            error?: string;
          };
          if (evt.error) {
            throw new Error(evt.error);
          }
          if (evt.delta) {
            accumulated += evt.delta;
            const currentText = accumulated;
            if (!addedBubble) {
              addedBubble = true;
              setMessages((prev) => [
                ...prev,
                { id: streamTurnId, role: 'model', text: currentText },
              ]);
            } else {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamTurnId ? { ...m, text: currentText } : m,
                ),
              );
            }
          }
        }
      }

      if (!accumulated.trim()) {
        throw new Error('Received an empty response from Gemini.');
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Unable to reach Gemini right now. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([INITIAL_GREETING]);
    setErrorMsg(null);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Chat Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            role="dialog"
            aria-label="Serendib Reserve Gemini AI Concierge"
            initial={reduced ? false : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-16 right-3 z-50 flex h-[min(72vh,560px)] w-[calc(100vw-24px)] flex-col overflow-hidden border border-[#C9D1DC]/25 bg-[#060B18]/95 shadow-[0_18px_60px_rgba(5,7,13,0.9),0_0_40px_rgba(27,63,217,0.28)] backdrop-blur-xl sm:bottom-20 sm:right-4 sm:w-[410px]"
          >
            {/* Subtle top sapphire sheen */}
            <div
              aria-hidden="true"
              className="h-[2px] w-full bg-gradient-to-r from-[#0B1F6B] via-[#3D7BFF] to-[#E6EAF0]"
            />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#C9D1DC]/15 bg-[#0A1226]/90 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center border border-[#3D7BFF]/55 bg-[#1B3FD9]/25 text-[#3D7BFF]">
                  <Sparkles size={15} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-light tracking-wide text-white">
                    Gemmology Concierge
                  </h2>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9D1DC]/70">
                    Powered by Google Gemini
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetChat}
                  aria-label="Clear conversation"
                  title="New conversation"
                  className="flex h-8 w-8 items-center justify-center text-[#C9D1DC]/75 transition-colors hover:bg-[#1B3FD9]/20 hover:text-white"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Gemini AI chat"
                  className="flex h-8 w-8 items-center justify-center text-[#C9D1DC]/75 transition-colors hover:bg-[#1B3FD9]/20 hover:text-white"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Messages Stream */}
            <div
              aria-live="polite"
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((turn) => {
                const isUser = turn.role === 'user';
                return (
                  <div
                    key={turn.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[86%] border px-3.5 py-2.5 ${
                        isUser
                          ? 'border-[#3D7BFF]/60 bg-[#1B3FD9]/28 text-white'
                          : 'border-[#C9D1DC]/15 bg-[#0A1226]/85 text-[#E6EAF0]'
                      }`}
                    >
                      {renderChatContent(turn.text)}
                    </div>
                  </div>
                );
              })}

              {isLoading && messages[messages.length - 1]?.role !== 'model' && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 border border-[#C9D1DC]/15 bg-[#0A1226]/85 px-3.5 py-2.5 text-xs tracking-[0.14em] uppercase text-[#C9D1DC]/80">
                    <Sparkles size={13} className="animate-pulse text-[#3D7BFF]" aria-hidden="true" />
                    <span>Consulting Ceylon Archive...</span>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div
                  role="alert"
                  className="border border-red-400/35 bg-red-950/35 px-3 py-2 text-xs text-red-200"
                >
                  {errorMsg}
                </div>
              )}

              <div ref={listEndRef} />
            </div>

            {/* Quick Starter Chips when chat hasn't grown yet */}
            {messages.length <= 2 && !isLoading && (
              <div className="border-t border-[#C9D1DC]/10 bg-[#070D1D] px-4 py-2.5">
                <p className="mb-1.5 text-[10px] tracking-[0.18em] uppercase text-[#C9D1DC]/60">
                  Suggested Questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="border border-[#C9D1DC]/20 bg-[#0A1226]/80 px-2.5 py-1 text-left text-[11px] text-[#C9D1DC] transition-colors hover:border-[#3D7BFF]/70 hover:text-white"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage();
              }}
              className="flex items-center gap-2 border-t border-[#C9D1DC]/15 bg-[#05070D]/95 p-3"
            >
              <label htmlFor="gemini-chat-input" className="sr-only">
                Ask about Serendib Reserve or Ceylon gemstones
              </label>
              <input
                ref={inputRef}
                id="gemini-chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about sapphires, cuts, or Serendib Reserve..."
                disabled={isLoading}
                maxLength={2000}
                className="min-w-0 flex-1 border border-[#C9D1DC]/20 bg-[#0A1226]/80 px-3 py-2 text-sm text-white placeholder-[#C9D1DC]/45 focus:border-[#3D7BFF] focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message to Gemini AI"
                className="btn-luxury-primary inline-flex h-9 w-9 shrink-0 items-center justify-center text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={14} aria-hidden="true" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Unified Bottom-Right Floating Dock: Direct WhatsApp + Google Gemini AI Concierge */}
      <div className="fixed bottom-3 right-3 z-40 flex items-center gap-2 sm:bottom-4 sm:right-4 sm:gap-2.5">
        <a
          href={SITE_CONFIG.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Message or call Serendib Reserve on WhatsApp ${SITE_CONFIG.phone}`}
          className="inline-flex h-10 items-center gap-2 border border-[#C9D1DC]/30 bg-[#0A1226]/95 px-3 text-xs font-medium tracking-[0.12em] uppercase text-[#E6EAF0] shadow-[0_0_20px_rgba(5,7,13,0.65)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#3D7BFF] sm:h-11 sm:px-3.5"
        >
          <MessageCircle size={14} className="text-[#3D7BFF]" aria-hidden="true" />
          <span className="hidden font-mono-tabular sm:inline">{SITE_CONFIG.phone}</span>
          <span className="sm:hidden">WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={() => setIsOpen((o) => !o)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close Gemini AI Concierge' : 'Ask Gemini AI Concierge'}
          className={`inline-flex h-10 items-center gap-2 border px-3 text-xs font-medium tracking-[0.14em] uppercase text-white transition-all duration-200 hover:-translate-y-0.5 sm:h-11 sm:px-4 ${
            isOpen
              ? 'border-[#E6EAF0] bg-[#1B3FD9] shadow-[0_0_28px_rgba(61,123,255,0.55)]'
              : 'border-[#3D7BFF]/80 bg-gradient-to-r from-[#0B1F6B] to-[#1B3FD9] shadow-[0_0_26px_rgba(27,63,217,0.45)] hover:border-white'
          }`}
        >
          <Sparkles size={14} className="text-[#E6EAF0]" aria-hidden="true" />
          <span className="hidden sm:inline">Ask Gemini AI</span>
          <span className="sm:hidden">Gem AI</span>
        </button>
      </div>
    </>
  );
};
