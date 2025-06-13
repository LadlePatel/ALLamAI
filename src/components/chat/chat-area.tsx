
"use client";

import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import type { ChatMessage as MessageType, SupportedLanguage } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatWelcome } from './chat-welcome';

interface ChatAreaProps {
  messages: MessageType[];
  isLoading: boolean;
  onSendMessage: (input: string) => void;
  currentSessionId: string | null;
  selectedLanguage: SupportedLanguage;
}

export function ChatArea({ messages, isLoading, onSendMessage, currentSessionId, selectedLanguage }: ChatAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, isLoading]);
  
  return (
    <div className="flex h-full flex-col bg-background">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-1 md:p-2 space-y-1 min-h-[calc(100%-4rem)]" ref={viewportRef}>
          {messages.length === 0 && !isLoading && <ChatWelcome selectedLanguage={selectedLanguage} />}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className={`flex items-start gap-3 py-3 px-2 md:px-4 ${selectedLanguage.dir === 'rtl' ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
              <Skeleton className="h-8 w-8 rounded-full bg-muted" />
              <div className="max-w-[70%] rounded-lg px-3.5 py-2.5 bg-card">
                <Skeleton className="h-4 w-24 mb-2 bg-muted/50" />
                <Skeleton className="h-3 w-16 bg-muted/50" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <ChatInput 
        onSendMessage={onSendMessage} 
        isLoading={isLoading || !currentSessionId} 
        selectedLanguage={selectedLanguage}
      />
    </div>
  );
}
