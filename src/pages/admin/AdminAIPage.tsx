import React, { useState, useEffect, useRef } from 'react';
import { AdminLayout } from './AdminLayout';
import { streamChatAdminAI } from '../../lib/api';
import { Sparkles, Send, Bot, User, Copy, Check, RotateCcw, AlertCircle, Lightbulb, FileText, Compass } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export const AdminAIPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content:
        "Hello Johanna! I am your dedicated Portfolio & Content AI Assistant. I can help you draft compelling case studies, structure project descriptions, refine your services, generate SEO metadata, or draft client proposals based on your verified skills and portfolio work.\n\nWhat would you like to work on today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [waitingFirstToken, setWaitingFirstToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    {
      icon: FileText,
      label: 'Draft a Case Study Outline',
      prompt: 'Help me draft a structured case study outline for a recent project. Include Challenge, Solution Engineered, Workflow Process, and Deliverable Results.',
    },
    {
      icon: Sparkles,
      label: 'Improve Project Descriptions',
      prompt: 'How can I make my project descriptions more concise and impactful for corporate decision makers without exaggerating results?',
    },
    {
      icon: Compass,
      label: 'Suggest Service Package',
      prompt: 'Suggest 3 structured service tiers for "Executive AI & Virtual Operations" that highlight prompt engineering, workflow automation, and digital organization.',
    },
    {
      icon: Lightbulb,
      label: 'SEO Metadata Ideas',
      prompt: 'Give me 5 search-optimized title tags and meta descriptions for a modern Virtual Assistant & AI Digital Specialist portfolio.',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, waitingFirstToken]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const aiMsgId = 'ai_' + (Date.now() + 1);
    const history = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput('');
    setLoading(true);
    setWaitingFirstToken(true);

    let hasInsertedAiBubble = false;

    try {
      const fullReply = await streamChatAdminAI(userMsg.content, history, (delta) => {
        if (!hasInsertedAiBubble) {
          hasInsertedAiBubble = true;
          setWaitingFirstToken(false);
          setMessages((prev) => [
            ...prev,
            {
              id: aiMsgId,
              role: 'model',
              content: delta,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        } else {
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsgId ? { ...m, content: m.content + delta } : m))
          );
        }
      });

      if (!hasInsertedAiBubble) {
        setMessages((prev) => [
          ...prev,
          {
            id: aiMsgId,
            role: 'model',
            content: fullReply || "I'm ready to assist with your portfolio content.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      if (hasInsertedAiBubble) {
        setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));
      }
      setError(err.message || 'Failed to get a response from AI Assistant.');
    } finally {
      setLoading(false);
      setWaitingFirstToken(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content:
          "Chat reset. I am ready to help you manage your portfolio content, brainstorm case studies, or craft service copy. How can I help you?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setError(null);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Admin AI Assistant
              </h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Your private assistant powered by Gemini for drafting case studies, refining copy, and optimizing metadata.
            </p>
          </div>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Clear Chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Chat</span>
          </button>
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.prompt)}
                className="p-3 text-left rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#12141a] hover:border-purple-500/50 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-all text-xs group shadow-sm"
              >
                <div className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200 mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  <qp.icon className="w-3.5 h-3.5 text-purple-600" />
                  <span>{qp.label}</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {qp.prompt}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
          {messages.map((msg) => {
            const isAI = msg.role === 'model';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isAI
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                  }`}
                >
                  {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`relative group p-4 rounded-2xl text-sm leading-relaxed ${
                    isAI
                      ? 'bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-800 dark:text-zinc-200 shadow-sm'
                      : 'bg-purple-600 text-white rounded-tr-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                  <div
                    className={`flex items-center justify-between mt-2 pt-2 border-t text-[10px] ${
                      isAI
                        ? 'border-zinc-100 dark:border-zinc-800/60 text-zinc-400'
                        : 'border-purple-500 text-purple-200'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {isAI && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors ml-4"
                        title="Copy content"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {waitingFirstToken && (
            <div className="flex gap-3 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200/80 dark:border-zinc-800/80 text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-zinc-400 ml-1">Generating fast response...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-white dark:bg-[#12141a] p-1.5 rounded-2xl border border-zinc-300 dark:border-zinc-800 focus-within:border-purple-500 shadow-sm"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI to draft a project description, improve case study copy, or generate tags..."
              disabled={loading}
              className="flex-1 px-4 py-2 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 px-2 pt-2">
            <span>AI drafts do not auto-publish. Always review copy before saving to your public projects.</span>
            <span>Gemini 4 Hydrogen • Fast Stream</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
