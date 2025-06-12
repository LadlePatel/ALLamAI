"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle2, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage as Message } from '@/types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex items-start gap-3 py-3 px-2 md:px-4 transition-opacity duration-300 animate-in fade-in',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 border border-border">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-3.5 py-2.5 shadow-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-card text-card-foreground rounded-bl-none border border-border'
        )}
      >
        <p className="text-sm whitespace-pre-wrap font-body">{message.content}</p>
        <p className={cn("text-xs mt-1.5", isUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 border border-border">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <UserCircle2 className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
