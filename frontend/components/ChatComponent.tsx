'use client'

import React, { useEffect, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Mic, Send } from 'lucide-react';
import pythonAxios from '@/lib/python-axios';
import ReactMarkdown from 'react-markdown';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

const dummyMessages = [
  { type: 'bot', text: 'Hello! How can I help you today? Ask any question about this indexed website content.' },
];

const ChatComponent = ({ id }: { id: string }) => {
  const [messages, setMessages] = useState<any[]>(dummyMessages);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Voice Typing
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        toast.success('Voice input transcribed!');
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info('Listening... Speak your question now.');
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const mutation = useMutation({
    mutationFn: async (query: string) => {
      // Send query directly to Python FastAPI + Pinecone RAG endpoint
      const response = await pythonAxios.post('/api/chat', {
        query,
        collection_id: id,
        top_k: 3
      });
      return response.data.data;
    },
    onMutate: async (inputMsg: string) => {
      // Add user message
      setMessages(prev => [...prev, { type: 'user', text: inputMsg }]);

      // Add animated generating placeholder
      setMessages(prev => [...prev, { type: 'bot', text: '__GENERATING__' }]);
    },
    onSuccess: (data) => {
      const responseText = data.response;
      const sources = data.sources || [];

      // Replace generating placeholder with actual AI response + sources
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          type: 'bot',
          text: responseText,
          sources: sources
        }
      ]);
    },
    onError: (error: any) => {
      console.error('Chat error:', error);
      toast.error(error?.response?.data?.detail || 'Failed to query Pinecone & Gemini');
      
      // Remove the generating message on error
      setMessages(prev => prev.slice(0, -1));
    }
  });

  const handleSend = () => {
    if (!input.trim() || mutation.isPending) return;
    const userInput = input.trim();
    setInput('');
    mutation.mutate(userInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto border rounded-2xl overflow-hidden bg-background shadow-lg">
      
      {/* Header */}
      <div className="p-3.5 border-b border-border/60 text-sm font-semibold flex items-center justify-between bg-card/60">
        <span className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <span className="font-display font-semibold">Web RAG Assistant</span>
        </span>
        <span className="text-[10px] bg-primary/15 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full font-mono font-semibold">
          Gemini 2.5 Flash
        </span>
      </div>

      {/* Scrollable chat area */}
      <div className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full pr-4">
          <div className="flex flex-col space-y-4 py-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.type === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="max-w-[88%] sm:max-w-[80%]">
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.type === 'user' 
                        ? 'bg-primary text-primary-foreground font-medium shadow-sm' 
                        : 'bg-card text-foreground border border-border/80 shadow-sm' 
                    }`}
                  >
                    {msg.text === '__GENERATING__' || msg.text.includes('Searching Pinecone') || msg.text.includes('Performing Multi-Query') ? (
                      <div className="flex items-center gap-2.5 py-1 px-1 text-sm font-medium text-foreground">
                        <div className="relative flex items-center justify-center">
                          <Sparkles className="size-4 text-primary animate-spin" />
                        </div>
                        <span className="text-xs text-muted-foreground">Generating</span>
                        <span className="flex gap-1 items-center">
                          <span className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="size-1.5 bg-primary/70 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="size-1.5 bg-primary/40 rounded-full animate-bounce" />
                        </span>
                      </div>
                    ) : (
                      <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                        <ReactMarkdown>
                          {msg?.text}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input area */}
      <div className="p-4 border-t bg-background">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this indexed website..."
            className="flex-1 resize-none min-h-[48px] max-h-[140px] rounded-xl text-sm"
            rows={2}
          />
          <Button
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            onClick={toggleVoiceInput}
            className={`h-[48px] w-[48px] rounded-xl flex-shrink-0 ${isListening ? 'animate-pulse' : ''}`}
            title="Voice Typing"
          >
            <Mic className={`w-4 h-4 ${isListening ? 'text-white' : 'text-emerald-500'}`} />
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || mutation.isPending}
            className="h-[48px] px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
