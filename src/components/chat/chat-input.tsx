
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, Loader2 } from 'lucide-react';
import type { SupportedLanguage } from '@/types';

interface ChatInputProps {
  onSendMessage: (input: string) => void;
  isLoading: boolean;
  selectedLanguage: SupportedLanguage;
}

export function ChatInput({ onSendMessage, isLoading, selectedLanguage }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      const currentTextarea = textareaRef.current;
      currentTextarea.style.height = 'auto'; 
      
      const newHeight = Math.min(currentTextarea.scrollHeight, 120);
      currentTextarea.style.height = `${Math.max(newHeight, 40)}px`;
    }
  }, [input]);
  
  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading, selectedLanguage]); // Re-focus if language changes and not loading

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 z-10 flex items-end gap-2 border-t bg-background p-3 md:p-4 shadow-md"
      dir={selectedLanguage.dir}
    >
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={selectedLanguage.placeholder}
        className="flex-1 resize-none overflow-y-auto rounded-xl border border-primary/70 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 pr-12 text-sm py-2.5 min-h-10 max-h-[120px]"
        rows={1}
        disabled={isLoading}
        aria-label="Chat message input"
        dir={selectedLanguage.dir}
      />
      <Button
        type="submit"
        size="icon"
        className="h-10 w-10 rounded-xl shrink-0"
        disabled={isLoading || !input.trim()}
        aria-label={selectedLanguage.code === 'ar' ? 'إرسال رسالة' : "Send message"}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <SendHorizonal className="h-5 w-5" />
        )}
      </Button>
    </form>
  );
}
