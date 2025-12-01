import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../services/geminiService';
import { ChatMessage } from '../types';
import SimpleTooltip from './SimpleTooltip';

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
  const [isOpen, setIsOpen] = useState(true); // Default to open
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I am Reidar\'s BragBot. Ask me anything about his experience, skills, or projects.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestModelMessageRef = useRef<HTMLDivElement>(null);

  // Scroll Logic
  useEffect(() => {
    if (isOpen) {
      const lastMsg = messages[messages.length - 1];
      
      if (lastMsg?.role === 'user') {
        // If user sent message (or loading state follows), scroll to bottom
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else if (lastMsg?.role === 'model') {
        // If AI responded, scroll to the START of that message
        setTimeout(() => {
          latestModelMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        // Fallback
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isOpen]);

  // Listen for custom trigger events from other components
  useEffect(() => {
    const handleChatTrigger = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.prompt) {
        setIsOpen(true);
        handleSend(customEvent.detail.prompt);
      }
    };

    window.addEventListener('chat:trigger', handleChatTrigger);
    return () => {
      window.removeEventListener('chat:trigger', handleChatTrigger);
    };
  }, []);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let responseText = await sendMessage(textToSend);
    
    // --- PARSE HIDDEN LOCATION DATA ---
    const locationRegex = /<<<LOCATIONS:\s*(\[.*?\])>>>/s;
    const match = responseText.match(locationRegex);
    
    if (match && match[1]) {
       try {
         const locations = JSON.parse(match[1]);
         // Remove the hidden block from display
         responseText = responseText.replace(match[0], '').trim();
         
         // Dispatch Map Highlight Event
         const event = new CustomEvent('map:highlight', { 
            detail: { locations: locations } 
         });
         window.dispatchEvent(event);
         
       } catch (e) {
         console.warn("Failed to parse locations from AI response", e);
       }
    }

    const botMsg: ChatMessage = { role: 'model', text: responseText };
    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end font-sans pointer-events-none">
      {/* Chat Window - Responsive Width */}
      {isOpen && (
        <div className="mb-4 w-[90vw] sm:w-[400px] h-[500px] max-h-[75vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col pointer-events-auto animate-in fade-in slide-in-from-bottom-10">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white/20">
                <i className="fas fa-robot text-white text-sm"></i>
              </div>
              <div>
                <h3 className="font-bold text-sm">Reidar's BragBot</h3>
                <p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Powered by Gemini</p>
              </div>
            </div>
            <SimpleTooltip text="Minimize chat" position="left">
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
                <i className="fas fa-minus"></i>
              </button>
            </SimpleTooltip>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg, idx) => {
              // Attach ref to the latest model message for auto-scrolling
              const isLastModelMessage = idx === messages.length - 1 && msg.role === 'model';
              
              return (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  ref={isLastModelMessage ? latestModelMessageRef : null}
                >
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
              );
            })}
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
          <div className="p-3 bg-white border-t border-gray-100 rounded-b-2xl">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about projects..."
                  className="w-full bg-gray-100 text-sm rounded-full pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                />
                <SimpleTooltip text="Send message" position="top">
                  <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-1 top-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <i className="fas fa-paper-plane text-xs"></i>
                  </button>
                </SimpleTooltip>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <SimpleTooltip text="Open BragBot" position="left">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-slate-900 hover:bg-blue-700 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 ring-4 ring-white/20 pointer-events-auto"
          >
            <i className="fas fa-comment-alt text-lg sm:text-xl"></i>
          </button>
        </SimpleTooltip>
      )}
    </div>
  );
};

export default ChatWidget;