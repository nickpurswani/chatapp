'use client';

import { useState } from 'react';

// Define proper types for tool invocations
interface ToolInvocation {
  name: string;
  // Add other properties that might be in toolInvocations
  [key: string]: unknown;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';  // Make role more specific
  content: string;
  toolInvocations?: ToolInvocation;  // Replace any with proper type
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add the user message to the chat
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: input },
    ]);
    setInput('');

    try {
      setIsLoading(true);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // Process the streaming response
      let buffer = '';
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        buffer += decoder.decode(value, { stream: !done });

        // Split the response into messages by line
        const lines = buffer.split('\n').filter((line) => line.trim());
        buffer = buffer.endsWith('\n') ? '' : lines.pop() || '';

        setMessages((prev) => [
          ...prev,
          ...lines.map((line) => JSON.parse(line)),
        ]);
      }
    } catch (err) {
      console.error('Error fetching response:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "What's the weather like today?",
    "Tell me a fun fact",
    "How can I learn programming?",
    "Write a short story"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-center text-blue-600">AI Chat Assistant</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-24">
          {/* Messages Container */}
          <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto">
            {messages.length === 0 && (
              <div className="text-center text-gray-600 py-8">
                <p className="mb-4">👋 Welcome! Start a conversation or try one of the suggestions below.</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(suggestion)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-full transition-colors duration-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((m: Message, index) => (
              <div 
                key={index} 
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {m.toolInvocations ? (
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(m.toolInvocations, null, 2)}
                    </pre>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200">
            <div className="max-w-4xl mx-auto flex gap-2">
              <input
                className="flex-1 bg-gray-50 text-gray-900 p-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-200"
                value={input}
                placeholder="Type your message here..."
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
