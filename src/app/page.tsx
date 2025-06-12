
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ChatLayout } from '@/components/chat/chat-layout';
import { ChatArea } from '@/components/chat/chat-area';
import type { ChatMessage, ChatSession, KnowledgeBaseFile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const generateId = () => Math.random().toString(36).substr(2, 9);

// const SESSIONS_STORAGE_KEY = 'allamai-sessions';
// const CURRENT_SESSION_ID_STORAGE_KEY = 'allamai-current-session-id';

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  const currentSession = sessions.find(s => s.id === currentSessionId);

  // Load session list from localStorage on mount (Temporarily Disabled)
  useEffect(() => {
    setIsMounted(true);
    // try {
    //   const storedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
    //   if (storedSessions) {
    //     const parsedSessions = JSON.parse(storedSessions) as ChatSession[];
    //     // Ensure messages are empty initially, will be fetched if session is active
    //     parsedSessions.forEach(s => s.messages = []); 
    //     setSessions(parsedSessions);

    //     const storedCurrentSessionId = localStorage.getItem(CURRENT_SESSION_ID_STORAGE_KEY);
    //     if (storedCurrentSessionId && parsedSessions.find(s => s.id === storedCurrentSessionId)) {
    //       setCurrentSessionId(storedCurrentSessionId);
    //     } else if (parsedSessions.length > 0) {
    //       setCurrentSessionId(parsedSessions[0].id);
    //     }
    //   }
    // } catch (error) {
    //   console.error("Failed to load session list from localStorage", error);
    //   toast({ title: "Error", description: "Could not load session data.", variant: "destructive" });
    // }
  }, [toast]); // Removed isMounted from dependencies as it's set inside and effect doesn't re-run on its change

  // Fetch messages for the current session when it changes or on mount
  useEffect(() => {
    if (!currentSessionId || !isMounted) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/sessions/${currentSessionId}/messages`);
        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.statusText}`);
        }
        const messagesData = await response.json();
        
        const fetchedMessages = messagesData.messages || messagesData; 

        setSessions(prevSessions =>
          prevSessions.map(s =>
            s.id === currentSessionId ? { ...s, messages: fetchedMessages } : s
          )
        );
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Error',
          description: `Failed to fetch messages for session. ${error instanceof Error ? error.message : ''}`,
          variant: 'destructive',
        });
        setSessions(prevSessions =>
          prevSessions.map(s =>
            s.id === currentSessionId ? { ...s, messages: [] } : s
          )
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [currentSessionId, isMounted, toast]);


  // Save session list to localStorage when it changes (Temporarily Disabled)
  useEffect(() => {
    if (!isMounted) return;
    // try {
    //   // Store sessions without their messages to keep localStorage light
    //   const sessionsToStore = sessions.map(({ messages, ...rest }) => rest);
    //   localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessionsToStore));
      
    //   if (currentSessionId) {
    //     localStorage.setItem(CURRENT_SESSION_ID_STORAGE_KEY, currentSessionId);
    //   } else {
    //     localStorage.removeItem(CURRENT_SESSION_ID_STORAGE_KEY);
    //   }
    // } catch (error) {
    //   console.error("Failed to save session list to localStorage", error);
    // }
  }, [sessions, currentSessionId, isMounted]);


  const updateSessionMessages = useCallback((sessionId: string, newMessages: ChatMessage[]) => {
    setSessions(prevSessions =>
      prevSessions.map(s => (s.id === sessionId ? { ...s, messages: newMessages } : s))
    );
  }, []);

  const addMessageToSession = useCallback((sessionId: string, message: ChatMessage) => {
    setSessions(prevSessions =>
      prevSessions.map(s =>
        s.id === sessionId ? { ...s, messages: [...s.messages, message] } : s
      )
    );
  }, []);


  const handleSendMessage = async (userInput: string) => {
    if (!currentSession) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: userInput,
      timestamp: Date.now(),
    };

    addMessageToSession(currentSession.id, userMessage);
    setIsLoading(true);
    const startTime = Date.now();

    try {
      const apiRequestBody = {
        session_id: currentSession.id,
        user_input: userInput,
      };

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiRequestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }
      
      const aiResponseData = await response.json();
      const endTime = Date.now();
      const durationMs = endTime - startTime;

      const botMessage: ChatMessage = {
        id: generateId(),
        role: 'bot',
        content: aiResponseData.response, 
        timestamp: Date.now(),
        knowledgeBaseUsed: aiResponseData.knowledge_base_used,
        fromCache: aiResponseData.from_cache,
        durationMs: durationMs,
      };
      
      addMessageToSession(currentSession.id, botMessage);

    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: 'Error',
        description: `Failed to get AI response. ${error instanceof Error ? error.message : ''}`,
        variant: 'destructive',
      });
       const errorMessageContent = "Sorry, I couldn't process your request. Please try again.";
       addMessageToSession(currentSession.id, {
         id: generateId(),
         role: 'bot',
         content: errorMessageContent,
         timestamp: Date.now(),
       });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewSession = () => {
    const newSessionId = generateId();
    const newSession: ChatSession = {
      id: newSessionId,
      name: `Chat ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      createdAt: Date.now(),
      messages: [],
      knowledgeBaseManual: [],
      knowledgeBaseFiles: [],
    };
    setSessions(prevSessions => [newSession, ...prevSessions]);
    setCurrentSessionId(newSessionId);
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleDeleteSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete session on server: ${errorText}`);
      }
      
      setSessions(prevSessions => {
        const remainingSessions = prevSessions.filter(s => s.id !== sessionId);
        if (currentSessionId === sessionId) {
          setCurrentSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
        }
        return remainingSessions;
      });
      toast({ title: 'Session Deleted', description: `Session ${sessionId.substring(0,6)}... was deleted.` });

    } catch (error) {
        console.error('Error deleting session:', error);
        toast({
          title: 'Error',
          description: `Could not delete session. ${error instanceof Error ? error.message : ''}`,
          variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleAddManualKbEntry = async (entry: string) => {
    if (!currentSession) {
      toast({ title: 'No active session', description: 'Please select or create a session first.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge-base/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: currentSession.id, entry: entry }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add KB entry: ${errorText}`);
      }
      const result = await response.json(); 
      
      if (result.success) {
        setSessions(prevSessions => prevSessions.map(s => 
            s.id === currentSession.id 
            ? { ...s, knowledgeBaseManual: [...s.knowledgeBaseManual, entry] } 
            : s
        ));
        toast({ title: 'Knowledge Base Updated', description: result.message });
      } else {
        throw new Error(result.message || 'Failed to add KB entry on server.');
      }
    } catch (error) {
      console.error('Error adding manual KB entry:', error);
      toast({ title: 'KB Error', description: `${error instanceof Error ? error.message : 'Unknown error'}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKbFile = async (file: File) => {
    if (!currentSession) {
      toast({ title: 'No active session', description: 'Please select or create a session first.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', currentSession.id);

    try {
      const response = await fetch(`${API_BASE_URL}/knowledge-base/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload KB file: ${errorText}`);
      }
      const result = await response.json();

      if (result.success) {
        const newKbFile: KnowledgeBaseFile = {
          name: result.filename || file.name,
          type: file.type.includes('pdf') ? 'pdf' : 'txt',
          content: `Uploaded: ${file.name}`,
        };
        setSessions(prevSessions => prevSessions.map(s =>
            s.id === currentSession.id
            ? { ...s, knowledgeBaseFiles: [...s.knowledgeBaseFiles, newKbFile] }
            : s
        ));
        toast({ title: 'Knowledge Base Updated', description: result.message });
      } else {
        throw new Error(result.message || 'Failed to process file on server.');
      }
    } catch (error) {
      console.error('Error uploading KB file:', error);
      toast({ title: 'KB File Error', description: `${error instanceof Error ? error.message : 'Unknown error'}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isMounted) {
     return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Icons.Logo className="h-16 w-16 animate-pulse text-primary" />
        </div>
     );
  }

  return (
    <ChatLayout
      sessions={sessions}
      currentSession={currentSession}
      onCreateNewSession={handleCreateNewSession}
      onSelectSession={handleSelectSession}
      onDeleteSession={handleDeleteSession}
      onAddManualKbEntry={handleAddManualKbEntry}
      onAddKbFile={handleAddKbFile}
      onKnowledgeBaseUpdate={() => {}} 
    >
      <ChatArea
        messages={currentSession?.messages || []}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        currentSessionId={currentSessionId}
      />
    </ChatLayout>
  );
}
