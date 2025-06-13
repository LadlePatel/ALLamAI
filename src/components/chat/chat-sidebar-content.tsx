
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
import type { ChatSession, SupportedLanguage } from '@/types';
import { PlusSquare, FolderKanban, BookText, Settings, LogOut, Globe } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ChatSidebarContentProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null | undefined;
  onCreateNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onAddManualKbEntry: (entry: string) => Promise<void>; 
  onAddKbFile: (file: File) => Promise<void>;  
  selectedLanguage: SupportedLanguage;
  onSetSelectedLanguage: (languageCode: string) => void;
  supportedLanguages: SupportedLanguage[];        
  sidebarOpen?: boolean; 
}

export function ChatSidebarContent({
  sessions,
  currentSession,
  onCreateNewSession,
  onSelectSession,
  onDeleteSession,
  onAddManualKbEntry, 
  onAddKbFile,    
  selectedLanguage,
  onSetSelectedLanguage,
  supportedLanguages,   
}: ChatSidebarContentProps) {
  
  const isKbDisabled = !currentSession;

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-3 border-b border-sidebar-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icons.Logo className="h-8 w-8 text-primary" />
          <div>
            <p className="text-lg font-semibold text-sidebar-foreground">ALLamAI</p>
          </div>
        </div>
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-1.5 px-2 py-1 h-auto">
              <Globe className="h-4 w-4" />
              <span className="text-sm">{selectedLanguage.flag}</span>
              <span className="sr-only">{selectedLanguage.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            {supportedLanguages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => onSetSelectedLanguage(lang.code)}
                className={`flex items-center gap-2 ${
                  selectedLanguage.code === lang.code ? 'bg-accent text-accent-foreground' : ''
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="p-3">
        <Button 
          variant="default"
          className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90" 
          onClick={onCreateNewSession}
        >
          <PlusSquare className="h-4 w-4" />
          {selectedLanguage.code === 'ar' ? 'محادثة جديدة' : 'New Chat'}
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-0.5">
             <div className="px-2 py-1.5 text-sm font-medium text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden mb-1">
                {selectedLanguage.code === 'ar' ? 'المحادثات' : 'Chats'}
             </div>
          {sessions.length === 0 && (
             <p className="text-xs text-center text-muted-foreground p-4">
                {selectedLanguage.code === 'ar' ? 'لا توجد جلسات محادثة بعد. انقر فوق "محادثة جديدة" للبدء.' : 'No chat sessions yet. Click "New Chat" to start.'}
             </p>
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
                {selectedLanguage.code === 'ar' ? 'قاعدة المعرفة' : 'Knowledge Base'}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-0 space-y-2">
              <KbManualEntryForm 
                onAddEntry={onAddManualKbEntry} 
                disabled={isKbDisabled}
                selectedLanguage={selectedLanguage}
              />
              <Separator className="my-2 bg-sidebar-border/50" />
              <KbFileUploadForm 
                onAddFile={onAddKbFile} 
                disabled={isKbDisabled}
                selectedLanguage={selectedLanguage}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
       {currentSession && ((currentSession.knowledgeBaseManual && currentSession.knowledgeBaseManual.length > 0) || (currentSession.knowledgeBaseFiles && currentSession.knowledgeBaseFiles.length > 0)) && (
        <>
          <Separator className="bg-sidebar-border" />
          <ScrollArea className="h-[100px] p-2 text-xs">
            <h3 className="font-medium text-sidebar-foreground/80 mb-1 flex items-center gap-1.5">
                <BookText size={14}/> 
                {selectedLanguage.code === 'ar' ? 'إدخالات قاعدة المعرفة الحالية' : 'Current KB Entries'}
            </h3>
            {currentSession.knowledgeBaseManual?.map((entry, idx) => (
              <div key={`manual-${idx}`} className="p-1.5 bg-sidebar-accent/10 rounded text-sidebar-foreground/90 mb-1 truncate" title={entry}>
                {selectedLanguage.code === 'ar' ? 'يدوي: ' : 'Manual: '} {entry}
              </div>
            ))}
            {currentSession.knowledgeBaseFiles?.map((file, idx) => (
              <div key={`file-${idx}`} className="p-1.5 bg-sidebar-accent/10 rounded text-sidebar-foreground/90 mb-1 truncate" title={file.name}>
                {selectedLanguage.code === 'ar' ? 'ملف: ' : 'File: '} {file.name}
              </div>
            ))}
          </ScrollArea>
        </>
      )}

      <Separator className="bg-sidebar-border mt-auto" />
      <div className="p-3 space-y-1">
        <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent">
            <Settings className="h-4 w-4" /> 
            {selectedLanguage.code === 'ar' ? 'الإعدادات' : 'Settings'}
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4" /> 
            {selectedLanguage.code === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
        </Button>
        <div className="flex justify-center pt-1">
            <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
