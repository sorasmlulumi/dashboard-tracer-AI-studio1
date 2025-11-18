
import React, { useState, useEffect, useRef } from 'react';
import { getChatResponseStream } from '../services/geminiService';
import { Finding } from '../types';
import { CloseIcon, SendIcon, SparklesIcon } from './icons';

interface GeminiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  data: Finding[];
}

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const GeminiChatbot: React.FC<GeminiChatbotProps> = ({ isOpen, onClose, data }) => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const fullHistory = [...history, userMessage];
    
    // Add a placeholder for the model's response
    setHistory(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

    try {
      const resultStream = await getChatResponseStream(fullHistory, input, data);
      
      let fullResponse = '';
      for await (const chunk of resultStream) {
        fullResponse += chunk.text;
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { role: 'model', parts: [{ text: fullResponse }] };
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { role: 'model', parts: [{ text: 'Sorry, I encountered an error. Please try again.' }] };
          return newHistory;
        });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-end">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl m-4 w-full max-w-lg h-[70vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b dark:border-slate-700">
          <div className="flex items-center">
            <SparklesIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold ml-2 dark:text-white">AI Assistant</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
            <CloseIcon className="h-6 w-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-slate-700 dark:text-gray-200'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.parts[0].text}</p>
              </div>
            </div>
          ))}
           {isLoading && history[history.length - 1].role === 'user' && (
             <div className="flex justify-start">
               <div className="p-3 rounded-lg bg-gray-200 dark:bg-slate-700">
                 <div className="flex items-center justify-center space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                 </div>
               </div>
             </div>
           )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t dark:border-slate-700">
          <div className="flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about the data..."
              className="flex-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading} className="ml-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed">
              <SendIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiChatbot;
