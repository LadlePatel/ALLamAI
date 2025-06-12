"use client";

import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import type { ChatMessage as MessageType } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot } from 'lucide-react';

interface ChatAreaProps {
  messages: MessageType[];
  isLoading: boolean;
  onSendMessage: (input: string) => void;
  currentSessionId: string | null;
}

export function ChatArea({ messages, isLoading, onSendMessage, currentSessionId }: ChatAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, isLoading]);
  
  const NoMessagesPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <Bot className="w-16 h-16 mb-4 text-muted-foreground" />
      <h2 className="text-xl font-semibold mb-2 font-headline">Welcome to ALLamAI!</h2>
      <p className="text-muted-foreground">
        Start a new conversation or select an existing one from the sidebar.
      </p>
      {!currentSessionId && 
        <p className="text-sm text-muted-foreground mt-2">
          Click "New Chat" to begin.
        </p>
      }
    </div>
  );

  return (
    <div className="flex h-full flex-col bg-background">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-1 md:p-2 space-y-1 min-h-[calc(100%-4rem)]" ref={viewportRef}> {/* Adjust min-h based on ChatInput height */}
          {messages.length === 0 && !isLoading && !currentSessionId && <NoMessagesPlaceholder />}
          {messages.length === 0 && !isLoading && currentSessionId && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Bot className="w-12 h-12 mb-3 text-primary" />
              <p className="text-muted-foreground">No messages yet. Send a message to start the chat!</p>
            </div>
          )}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 py-3 px-2 md:px-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="max-w-[70%] rounded-lg px-3.5 py-2.5 shadow-sm bg-card">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading || !currentSessionId} />
    </div>
  );
}
