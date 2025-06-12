
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
import { PlusSquare, FolderKanban, BookText, Settings, LogOut } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatSidebarContentProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null | undefined;
  onCreateNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onAddManualKbEntry: (entry: string) => Promise<void>; // New prop
  onAddKbFile: (file: File) => Promise<void>;          // New prop
  onKnowledgeBaseUpdate: (updatedSession: ChatSession) => void; // Kept for compatibility, but new handlers are primary
  sidebarOpen?: boolean; 
}

export function ChatSidebarContent({
  sessions,
  currentSession,
  onCreateNewSession,
  onSelectSession,
  onDeleteSession,
  onAddManualKbEntry, // Use this
  onAddKbFile,       // Use this
  onKnowledgeBaseUpdate, // Keep for now
}: ChatSidebarContentProps) {
  
  const isKbDisabled = !currentSession;

  const mockUser = {
    name: "Gopinath Murugesan",
    email: "mgopinath2810@gmail.com",
    avatarUrl: "https://placehold.co/40x40.png",
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-3 border-b border-sidebar-border flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={mockUser.avatarUrl} alt={mockUser.name} data-ai-hint="profile person" />
          <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-sidebar-foreground">{mockUser.name}</p>
          <p className="text-xs text-sidebar-foreground/70">{mockUser.email}</p>
        </div>
      </div>
      
      <div className="p-3">
        <Button 
          variant="default"
          className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90" 
          onClick={onCreateNewSession}
        >
          <PlusSquare className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-0.5">
             <div className="px-2 py-1.5 text-sm font-medium text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden mb-1">
                Chat
             </div>
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

      <Separator className="bg-sidebar-border my-2" />
      
      <div className="p-2">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="kb-item" className="border-b-0">
            <AccordionTrigger className="p-2 text-sm font-medium hover:no-underline hover:bg-sidebar-accent/50 rounded-md [&[data-state=open]>svg]:text-primary">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                Knowledge Base
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-0 space-y-2">
              <KbManualEntryForm 
                onAddEntry={onAddManualKbEntry} // Pass the new handler
                disabled={isKbDisabled}
              />
              <Separator className="my-2 bg-sidebar-border/50" />
              <KbFileUploadForm 
                onAddFile={onAddKbFile} // Pass the new handler
                disabled={isKbDisabled}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
       {currentSession && (currentSession.knowledgeBaseManual.length > 0 || currentSession.knowledgeBaseFiles.length > 0) && (
        <>
          <Separator className="bg-sidebar-border" />
          <ScrollArea className="h-[100px] p-2 text-xs">
            <h3 className="font-medium text-sidebar-foreground/80 mb-1 flex items-center gap-1.5"><BookText size={14}/> Current KB Entries</h3>
            {currentSession.knowledgeBaseManual.map((entry, idx) => (
              <div key={`manual-${idx}`} className="p-1.5 bg-sidebar-accent/10 rounded text-sidebar-foreground/90 mb-1 truncate" title={entry}>Manual: {entry}</div>
            ))}
            {currentSession.knowledgeBaseFiles.map((file, idx) => (
              <div key={`file-${idx}`} className="p-1.5 bg-sidebar-accent/10 rounded text-sidebar-foreground/90 mb-1 truncate" title={file.name}>File: {file.name}</div>
            ))}
          </ScrollArea>
        </>
      )}

      <Separator className="bg-sidebar-border mt-auto" />
      <div className="p-3 space-y-1">
        <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent">
            <Settings className="h-4 w-4" /> Settings
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4" /> Log Out
        </Button>
        <div className="flex justify-center pt-1">
            <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

    