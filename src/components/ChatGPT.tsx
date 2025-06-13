import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';
import { Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatGPTProps {
  onSuggestion?: (flavorName: string, description: string) => void;
  initialPrompt?: string;
}

const SYSTEM_PROMPT = `You are a creative yogurt flavor expert. Help users create unique and delicious yogurt flavor combinations. 
When suggesting a flavor, provide both a name and a detailed description.
Keep flavor names concise (2-3 words max) and descriptions under 100 characters.
Focus on combinations that would work well in yogurt.
Always format your response as "Flavor Name: Description"`;

const DEFAULT_PROMPT = "Suggest a creative and unique yogurt flavor.";

const ChatGPT: React.FC<ChatGPTProps> = ({ onSuggestion, initialPrompt }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Only run once when component mounts
    if (!initialized.current) {
      initialized.current = true;
      handleSubmit(undefined, initialPrompt || DEFAULT_PROMPT);
    }
  }, [initialPrompt]); // Re-run if initialPrompt changes

  const handleSubmit = async (e?: React.FormEvent, defaultMessage?: string) => {
    e?.preventDefault();
    const messageToSend = defaultMessage || input.trim();
    if ((!messageToSend && !defaultMessage) || isLoading) return;

    if (!defaultMessage) {
      setInput('');
    }
    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    setIsLoading(true);

    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: messageToSend }
        ],
        model: 'gpt-3.5-turbo',
      });

      const assistantMessage = completion.choices[0]?.message?.content || 'No suggestion available';
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);

      // Try to extract flavor name and description
      const flavorMatch = assistantMessage.match(/^(.+?)(?::|-)(.+)$/);
      if (flavorMatch && onSuggestion) {
        const [_, name, description] = flavorMatch;
        onSuggestion(name.trim(), description.trim());
      }
    } catch (error) {
      console.error('Error getting completion:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I had trouble generating a suggestion. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full mx-auto">
      <div className="h-96 overflow-y-auto mb-4">
        <div className="space-y-4">
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-purple-100 text-purple-800">
              Hi! I'm your yogurt flavor assistant. I'll help you create unique flavor combinations!
            </div>
          </div>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for specific flavor suggestions..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={`px-4 py-2 rounded-lg ${
            isLoading || !input.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
          } text-white transition-colors`}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatGPT; 