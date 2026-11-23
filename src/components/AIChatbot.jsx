import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Sparkles, Bot, User, Trash2, ArrowRight, ShieldCheck, MapPin, Compass, Info, MessageSquare } from 'lucide-react';
import { sendChatMessage } from '../services/chatService';
import { DESTINATIONS } from '../data/destinations';

export default function AIChatbot({ onSelectDestination, onBackToExplore }) {
  const initialMessages = [
    {
      id: 1,
      sender: 'assistant',
      text: `Hello! I am **GoaSmart AI**, your intelligent travel companion and crowd balancer.\n\nI can help you discover serene beaches, sacred heritage monuments, and village homestays while steering you away from tourist gridlocks and peak congestion.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendedDestinations: ['galgibaga-beach', 'cola-beach', 'divar-island']
    }
  ];

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('goasmart_chat_history');
      return saved ? JSON.parse(saved) : initialMessages;
    } catch {
      return initialMessages;
    }
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      sessionStorage.setItem('goasmart_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat to sessionStorage', e);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const suggestedQuestions = [
    'What are the best beaches in Goa?',
    'Suggest a 2-day itinerary.',
    'What are some hidden places in Goa?',
    'Where can I experience Goan culture?',
    'Suggest family-friendly destinations.',
    'I want a peaceful beach day with good seafood and a budget of ₹1500.'
  ];

  const handleSend = async (messageText) => {
    const query = (messageText || inputMessage).trim();
    if (!query || isTyping) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await sendChatMessage(query, messages);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedDestinations: response.recommendedDestinations || []
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: err.message || 'Sorry, I encountered a temporary issue. Please try asking again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    setMessages(initialMessages);
    sessionStorage.removeItem('goasmart_chat_history');
    inputRef.current?.focus();
  };

  // Render rich, safe Markdown responses for the AI companion
  const renderMarkdown = (rawText) => {
    if (!rawText) return null;
    // Strip trailing [RECOMMENDED: ...] machine tag if present in raw text
    const cleanedText = rawText.replace(/\[RECOMMENDED:\s*[^\]]+\]/gi, '').trim();

    return (
      <div className="prose-chat text-xs sm:text-sm text-slate-800 leading-relaxed break-words overflow-hidden">
        <ReactMarkdown
          components={{
            h1: ({ node, ...props }) => (
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base mt-3 mb-1.5 tracking-tight border-b border-slate-100 pb-1" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h4 className="font-bold text-cyan-900 text-xs sm:text-sm mt-3 mb-1 tracking-tight" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h5 className="font-bold text-slate-900 text-xs sm:text-sm mt-2.5 mb-1" {...props} />
            ),
            h4: ({ node, ...props }) => (
              <h6 className="font-bold text-slate-800 text-[11px] sm:text-xs mt-2 mb-0.5" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed my-1.5 break-words" {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-extrabold text-slate-900" {...props} />
            ),
            em: ({ node, ...props }) => (
              <em className="italic text-slate-600 font-medium" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="my-2 space-y-1 pl-4 list-disc marker:text-cyan-600 text-xs sm:text-sm text-slate-700" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="my-2 space-y-1.5 pl-4 list-decimal marker:text-cyan-700 marker:font-bold text-xs sm:text-sm text-slate-700" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="leading-relaxed pl-1" {...props} />
            ),
            code: ({ inline, className, children, ...props }) => (
              <code className="px-1.5 py-0.5 bg-slate-100 text-cyan-800 rounded font-mono text-[11px] sm:text-xs font-semibold border border-slate-200/80" {...props}>
                {children}
              </code>
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-3 border-cyan-500 pl-3 my-2 text-xs sm:text-sm italic text-slate-600 bg-cyan-50/50 py-1.5 rounded-r-lg" {...props} />
            ),
            hr: ({ node, ...props }) => (
              <hr className="my-3 border-slate-200" {...props} />
            )
          }}
        >
          {cleanedText}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="py-6 sm:py-10 bg-slate-100 min-h-[calc(100vh-80px)] flex flex-col justify-between">
      <div className="max-w-4xl mx-auto px-4 w-full flex-1 flex flex-col">
        
        {/* Chat Window Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col flex-1 min-h-[620px] max-h-[82vh]">
          
          {/* Header Bar */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-white shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight">Goa Tourism AI Assistant</h3>
                  <span className="text-[10px] px-2 py-0.5 font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    Smart Crowd Balancer
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Ready with crowd estimates, alternative routes & local tips
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearHistory}
                className="p-2 text-slate-300 hover:text-red-400 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                title="Start New Conversation"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-50/70">
            
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              const attachedDestinations = (msg.recommendedDestinations || [])
                .map((id) => DESTINATIONS.find((d) => d.id === id))
                .filter(Boolean);

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${
                    isAssistant ? 'self-start mr-auto' : 'self-end ml-auto flex-row-reverse'
                  }`}
                >
                  {/* Sender Avatar */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white ${
                      isAssistant
                        ? 'bg-gradient-to-tr from-cyan-600 to-teal-600 shadow-xs'
                        : 'bg-gradient-to-tr from-slate-700 to-slate-900 shadow-xs'
                    }`}
                  >
                    {isAssistant ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`p-4 rounded-2xl text-slate-800 ${
                      isAssistant
                        ? 'bg-white border border-slate-200/90 shadow-sm rounded-tl-none'
                        : 'bg-gradient-to-r from-cyan-700 to-teal-700 text-white rounded-tr-none shadow-sm'
                    }`}
                  >
                    <div className={isAssistant ? 'text-slate-800' : 'text-white text-xs sm:text-sm font-medium whitespace-pre-wrap'}>
                      {isAssistant ? renderMarkdown(msg.text) : msg.text}
                    </div>

                    {/* Attached Destination Recommendations Pills */}
                    {isAssistant && attachedDestinations.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                          Suggested Smart Places:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {attachedDestinations.map((dest) => (
                            <div
                              key={dest.id}
                              onClick={() => onSelectDestination && onSelectDestination(dest)}
                              className="p-2.5 rounded-xl border border-slate-200 hover:border-cyan-400 hover:shadow-xs transition-all bg-slate-50/80 cursor-pointer flex items-center gap-2.5 group"
                            >
                              <img
                                src={dest.image}
                                alt={dest.name}
                                className="w-10 h-10 rounded-lg object-cover shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="text-xs font-bold text-slate-800 group-hover:text-cyan-700 truncate">
                                  {dest.name}
                                </h5>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      dest.crowdScore >= 70 ? 'bg-red-500' : 'bg-emerald-500'
                                    }`}
                                  />
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    {dest.crowdLevel} ({dest.crowdScore}%)
                                  </span>
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-700 shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div
                      className={`text-[10px] mt-2 text-right ${
                        isAssistant ? 'text-slate-400' : 'text-cyan-100'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Assistant Typing Bubble */}
            {isTyping && (
              <div className="flex items-center gap-3 self-start mr-auto">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                </div>
                <div className="px-4 py-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-slate-500 font-medium ml-1">Analyzing crowds & routes...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Questions Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 overflow-x-auto no-scrollbar flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-cyan-600" />
              <span>Ask:</span>
            </span>
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isTyping}
                className="px-3 py-1 bg-white hover:bg-cyan-50 hover:border-cyan-300 border border-slate-200 rounded-full text-xs text-slate-700 whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything (e.g. 'Peaceful beach with fresh seafood under ₹1500')..."
              disabled={isTyping}
              className="flex-1 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-800 text-xs sm:text-sm px-4 py-3 rounded-2xl border border-transparent focus:border-cyan-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="p-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-2xl transition-all shadow-md shadow-cyan-600/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Bottom Tip */}
        <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>GoaSmart AI utilizes realistic crowd estimation algorithms to recommend quieter, sustainable destinations.</span>
        </p>

      </div>
    </div>
  );
}
