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
  onKnowledgeBaseUpdate: (updatedSession: ChatSession) => void;
  children: React.ReactNode; // For ChatArea
}

export function ChatLayout({
  sessions,
  currentSession,
  onCreateNewSession,
  onSelectSession,
  onDeleteSession,
  onKnowledgeBaseUpdate,
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
            onKnowledgeBaseUpdate={onKnowledgeBaseUpdate}
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
