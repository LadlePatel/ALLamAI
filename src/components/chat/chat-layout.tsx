
"use client";

import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import { ChatSidebarContent } from './chat-sidebar-content';
import type { ChatSession } from '@/types';

interface ChatLayoutProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null | undefined;
  onCreateNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onAddManualKbEntry: (entry: string) => Promise<void>; // New prop
  onAddKbFile: (file: File) => Promise<void>;          // New prop
  onKnowledgeBaseUpdate: (updatedSession: ChatSession) => void; // Keep for now if other parts use it, but new handlers are primary
  children: React.ReactNode; // For ChatArea
}

export function ChatLayout({
  sessions,
  currentSession,
  onCreateNewSession,
  onSelectSession,
  onDeleteSession,
  onAddManualKbEntry,
  onAddKbFile,
  onKnowledgeBaseUpdate, // Keep for now
  children,
}: ChatLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar collapsible="icon" variant="sidebar" side="left">
          <ChatSidebarContent
            sessions={sessions}
            currentSession={currentSession}
            onCreateNewSession={onCreateNewSession}
            onSelectSession={onSelectSession}
            onDeleteSession={onDeleteSession}
            onAddManualKbEntry={onAddManualKbEntry} // Pass down
            onAddKbFile={onAddKbFile}               // Pass down
            onKnowledgeBaseUpdate={onKnowledgeBaseUpdate} // Keep for now
          />
          <SidebarRail />
        </Sidebar>
        
        <div className="flex flex-1 flex-col">
            <div className="p-2 md:hidden border-b"> {/* Mobile header with trigger */}
               <SidebarTrigger />
            </div>
            <SidebarInset className="flex-1 overflow-hidden">
                {children}
            </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}

    