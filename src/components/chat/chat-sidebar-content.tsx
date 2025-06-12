"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { Icons } from '@/components/icons';
import { KbManualEntryForm } from './kb-manual-entry-form';
import { KbFileUploadForm } from './kb-file-upload-form';
import { SessionListItem } from './session-list-item';
import type { ChatSession } from '@/types';
import { PlusSquare, ChevronDown, ChevronUp, FolderKanban, BookText } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ChatSidebarContentProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null | undefined;
  onCreateNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onKnowledgeBaseUpdate: (updatedSession: ChatSession) => void;
  sidebarOpen?: boolean; // from useSidebar hook if needed for conditional rendering
}

export function ChatSidebarContent({
  sessions,
  currentSession,
  onCreateNewSession,
  onSelectSession,
  onDeleteSession,
  onKnowledgeBaseUpdate,
  sidebarOpen,
}: ChatSidebarContentProps) {
  
  const isKbDisabled = !currentSession;

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Icons.Logo className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-semibold font-headline text-primary">ALLamAI</h1>
        </div>
        <ThemeToggle />
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button variant="outline" className="w-full justify-start gap-2 border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={onCreateNewSession}>
          <PlusSquare className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <Separator className="bg-sidebar-border" />

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1.5">
          {sessions.length === 0 && (
             <p className="text-xs text-center text-muted-foreground p-4">No chat sessions yet. Click "New Chat" to start.</p>
          )}
          {sessions.map((session) => (
            <SessionListItem
              key={session.id}
              session={session}
              isSelected={currentSession?.id === session.id}
              onSelect={onSelectSession}
              onDelete={onDeleteSession}
            />
          ))}
        </div>
      </ScrollArea>

      <Separator className="bg-sidebar-border" />
      
      {/* Knowledge Base Section */}
      <div className="p-2">
        <Accordion type="single" collapsible defaultValue="kb-item" className="w-full">
          <AccordionItem value="kb-item" className="border-b-0">
            <AccordionTrigger className="p-2 text-sm font-medium hover:no-underline hover:bg-sidebar-accent/50 rounded-md [&[data-state=open]>svg]:text-primary">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                Knowledge Base
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-0 space-y-2">
              <KbManualEntryForm 
                currentSession={currentSession} 
                onKnowledgeBaseUpdate={onKnowledgeBaseUpdate}
                disabled={isKbDisabled}
              />
              <Separator className="my-2 bg-sidebar-border/50" />
              <KbFileUploadForm 
                currentSession={currentSession} 
                onKnowledgeBaseUpdate={onKnowledgeBaseUpdate}
                disabled={isKbDisabled}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
       {/* Display current KB content (optional) */}
       {currentSession && (currentSession.knowledgeBaseManual.length > 0 || currentSession.knowledgeBaseFiles.length > 0) && (
        <>
          <Separator className="bg-sidebar-border" />
          <ScrollArea className="h-[150px] p-2 text-xs">
            <h3 className="font-medium text-sidebar-foreground/80 mb-1 flex items-center gap-1.5"><BookText size={14}/> Current KB</h3>
            {currentSession.knowledgeBaseManual.map((entry, idx) => (
              <div key={`manual-${idx}`} className="p-1.5 bg-sidebar-accent/10 rounded text-sidebar-foreground/90 mb-1 truncate" title={entry}>Manual: {entry}</div>
            ))}
            {currentSession.knowledgeBaseFiles.map((file, idx) => (
              <div key={`file-${idx}`} className="p-1.5 bg-sidebar-accent/10 rounded text-sidebar-foreground/90 mb-1 truncate" title={file.name}>File: {file.name}</div>
            ))}
          </ScrollArea>
        </>
      )}
    </div>
  );
}
