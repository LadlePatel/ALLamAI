"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, MessageSquare } from 'lucide-react';
import type { ChatSession } from '@/types';
import { cn } from '@/lib/utils';

interface SessionListItemProps {
  session: ChatSession;
  isSelected: boolean;
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

export function SessionListItem({ session, isSelected, onSelect, onDelete }: SessionListItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent onSelect from firing
    onDelete(session.id);
  };

  return (
    <div
      className={cn(
        "group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
        isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
      )}
      onClick={() => onSelect(session.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(session.id)}
      aria-label={`Select session: ${session.name}`}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <MessageSquare className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
        <span className="truncate text-sm font-medium">{session.name}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
            "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive",
            isSelected && "opacity-100" // Keep delete visible if selected
        )}
        onClick={handleDelete}
        aria-label={`Delete session: ${session.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
