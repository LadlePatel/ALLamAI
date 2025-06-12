
"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle2, Bot, FileText, Zap, Clock, MessageCircleQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage as Message } from '@/types';
import { Badge } from '@/components/ui/badge';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const userAvatarUrl = "https://placehold.co/40x40.png"; 

  return (
    <div
      className={cn(
        'flex items-start gap-3 py-3 px-2 md:px-4 transition-opacity duration-300 animate-in fade-in',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 border-none">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[70%] rounded-lg', 
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-none' 
            : 'bg-card text-card-foreground rounded-bl-none' 
        )}
      >
        <div className={cn('px-3.5 py-2.5')}>
          <p className="text-sm whitespace-pre-wrap font-body">{message.content}</p>
        </div>
        
        {!isUser && (message.knowledgeBaseUsed || message.fromCache !== undefined || message.durationMs !== undefined || message.promptSentToModel) && (
          <div className="px-3.5 pb-2.5 pt-1.5 border-t border-border/30 space-y-2 mt-1">
            {message.fromCache && (
              <Badge variant="secondary" className="text-xs py-0.5 px-1.5">
                <Zap className="h-3 w-3 mr-1" /> From Cache
                {message.cosineDistance !== undefined && (
                  <span className="ml-1">(cosine: {message.cosineDistance.toFixed(2)})</span>
                )}
              </Badge>
            )}
            {message.promptSentToModel && (
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1 font-medium mb-0.5">
                  <MessageCircleQuestion className="h-3.5 w-3.5" />
                  Prompt Sent to Model:
                </div>
                <p className="pl-1 italic max-h-20 overflow-y-auto bg-muted/30 p-1 rounded-sm text-[0.7rem] leading-tight">
                  {message.promptSentToModel}
                </p>
              </div>
            )}
            {message.knowledgeBaseUsed && (
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1 font-medium mb-0.5">
                  <FileText className="h-3.5 w-3.5" />
                  Knowledge Snippet Used:
                </div>
                <p className="pl-1 italic max-h-20 overflow-y-auto bg-muted/30 p-1 rounded-sm text-[0.7rem] leading-tight">
                  {message.knowledgeBaseUsed}
                </p>
              </div>
            )}
          </div>
        )}

        <div className={cn("text-xs mt-1.5 px-3.5 pb-2 flex items-center", isUser ? "justify-end" : "justify-start")}>
          {isUser && (
            <span className="text-primary-foreground/70">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {!isUser && message.durationMs !== undefined && (
            <div className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Response: {(message.durationMs / 1000).toFixed(2)}s</span>
            </div>
          )}
        </div>

      </div>
      {isUser && (
        <Avatar className="h-8 w-8 border-none">
          <AvatarImage src={userAvatarUrl} alt="User" data-ai-hint="profile person" />
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <UserCircle2 className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
