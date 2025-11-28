import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../services/geminiService';
import { ChatMessage } from '../types';

// --- Custom Markdown Renderer ---
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const parseInline = (text: string): React.ReactNode[] => {
    // Split by markdown syntax: **bold**, *italic*, [link](url)
    const regex = /(\*\*.*?\*\*)|(\*.*?\*)|(\[.*?\]\(.*?\))/g;
    const parts = text.split(regex).filter(part => part !== undefined && part !== '');

    return parts.map((part, i) => {
      // Bold
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      // Italic
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <em key={i} className="italic text-gray-800">{part.slice(1, -1)}</em>;
      }
      // Link
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const match = part.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          return (
            <a key={i} href={match[2]} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
              {match[1]}
            </a>
          );
        }
      }
      return part;
    });
  };

  const lines = content.split('\n');
  const elements: React.ReactElement[] = [];
  let listBuffer: React.ReactElement[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const listMatch = line.match(/^(\*|-)\s+(.*)/);

    if (listMatch) {
      // List Item
      listBuffer.push(
        <li key={`li-${index}`} className="mb-1 ml-4 list-disc marker:text-blue-500">
          {parseInline(listMatch[2])}
        </li>
      );
    } else {
      // Flush List if exists
      if (listBuffer.length > 0) {
        elements.push(<ul key={`ul-${index}`} className="mb-3">{listBuffer}</ul>);
        listBuffer = [];
      }

      // Empty line (paragraph break)
      if (!trimmed) {
        return; 
      }

      // Standard Paragraph
      elements.push(
        <p key={`p-${index}`} className="mb-3 last:mb-0 leading-relaxed text-gray-800">
          {parseInline(line)}
        </p>
      );
    }
  });

  // Flush remaining list
  if (listBuffer.length > 0) {
    elements.push(<ul key="ul-end" className="mb-3">{listBuffer}</ul>);
  }

  return <div className="text-sm">{elements}</div>;
};

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // Closed by default as per request to be minimizable/unintrusive initially? Or prompt said "able to minimize", usually implies open first? Let's keep it open initially to be discovered.
  // Actually, standard pattern for "on the right hand side" often implies a bubble to click. 
  // Let's set it to closed initially so it doesn't block content on mobile, but easily accessible.
  // Re-reading: "It will be on the right hand side, and should be able to minimize."
  // I will default to OPEN so the user sees it immediately as a feature, but they can minimize it.
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I am Reidar\'s AI assistant. Ask me anything about his experience, skills, or projects.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await sendMessage(input);
    
    const botMsg: ChatMessage = { role: 'model', text: responseText };
    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-10">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white/20">
                <i className="fas fa-robot text-white text-sm"></i>
              </div>
              <div>
                <h3 className="font-bold text-sm">Reidar's AI Assistant</h3>
                <p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Powered by Gemini</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
              <i className="fas fa-minus"></i>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }`}>
                   {msg.role === 'user' ? (
                     <div className="text-sm">{msg.text}</div>
                   ) : (
                     <MarkdownRenderer content={msg.text} />
                   )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about projects, skills, history..."
                  className="w-full bg-gray-100 text-sm rounded-full pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1 top-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <i className="fas fa-paper-plane text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button (Only visible when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 ring-4 ring-white/20"
        >
          <i className="fas fa-comment-alt text-xl"></i>
        </button>
      )}
    </div>
  );
};

export default ChatWidget;