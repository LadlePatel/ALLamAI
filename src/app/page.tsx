"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ChatLayout } from '@/components/chat/chat-layout';
import { ChatArea } from '@/components/chat/chat-area';
import type { ChatMessage, ChatSession, KnowledgeBaseFile } from '@/types';
import { chatbotConversation } from '@/ai/flows/chatbot-conversation';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// Mock uuid if not available (e.g. in environments where crypto is limited)
// or install `uuid` and `@types/uuid`
// For this exercise, we assume uuid is available or a simple polyfill.
// If `uuid` is not in package.json, we'd use a simpler ID generator.
// Let's use a simple one for now to avoid package changes.
const generateId = () => Math.random().toString(36).substr(2, 9);


const SESSIONS_STORAGE_KEY = 'allamai-sessions';
const CURRENT_SESSION_ID_STORAGE_KEY = 'allamai-current-session-id';

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  const currentSession = sessions.find(s => s.id === currentSessionId);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const storedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (storedSessions) {
        setSessions(JSON.parse(storedSessions));
      }
      const storedCurrentSessionId = localStorage.getItem(CURRENT_SESSION_ID_STORAGE_KEY);
      if (storedCurrentSessionId) {
        setCurrentSessionId(storedCurrentSessionId);
      } else if (storedSessions) {
        // Default to the first session if no current ID is stored but sessions exist
        const parsedSessions = JSON.parse(storedSessions);
        if (parsedSessions.length > 0) {
          setCurrentSessionId(parsedSessions[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      // Optionally clear corrupted storage
      // localStorage.removeItem(SESSIONS_STORAGE_KEY);
      // localStorage.removeItem(CURRENT_SESSION_ID_STORAGE_KEY);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      if (currentSessionId) {
        localStorage.setItem(CURRENT_SESSION_ID_STORAGE_KEY, currentSessionId);
      } else {
        localStorage.removeItem(CURRENT_SESSION_ID_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [sessions, currentSessionId, isMounted]);

  const updateSession = useCallback((updatedSession: ChatSession) => {
    setSessions(prevSessions => 
      prevSessions.map(s => s.id === updatedSession.id ? updatedSession : s)
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

    const updatedMessages = [...currentSession.messages, userMessage];
    updateSession({ ...currentSession, messages: updatedMessages });
    setIsLoading(true);

    try {
      // Prepare knowledge base string
      let knowledgeBaseString = "";
      if (currentSession.knowledgeBaseManual.length > 0) {
        knowledgeBaseString += "Manual Entries:\n" + currentSession.knowledgeBaseManual.join("\n") + "\n\n";
      }
      if (currentSession.knowledgeBaseFiles.length > 0) {
        knowledgeBaseString += "File Contents:\n" + currentSession.knowledgeBaseFiles.map(f => `--- ${f.name} ---\n${f.content}`).join("\n\n") + "\n";
      }


      const conversationHistory = currentSession.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      const aiResponse = await chatbotConversation({
        userInput,
        conversationHistory: conversationHistory, // Send previous messages from current session
        knowledgeBase: knowledgeBaseString || undefined,
      });

      const botMessage: ChatMessage = {
        id: generateId(),
        role: 'bot',
        content: aiResponse.response,
        timestamp: Date.now(),
      };
      
      updateSession({ ...currentSession, messages: [...updatedMessages, botMessage] });

    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response from AI.',
        variant: 'destructive',
      });
       const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'bot',
        content: "Sorry, I couldn't process your request. Please try again.",
        timestamp: Date.now(),
      };
      updateSession({ ...currentSession, messages: [...updatedMessages, errorMessage] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewSession = () => {
    const newSessionId = generateId();
    const newSession: ChatSession = {
      id: newSessionId,
      name: `Chat ${new Date().toLocaleTimeString()}`,
      createdAt: Date.now(),
      messages: [],
      knowledgeBaseManual: [],
      knowledgeBaseFiles: [],
    };
    setSessions(prevSessions => [newSession, ...prevSessions]); // Add to the beginning for recency
    setCurrentSessionId(newSessionId);
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prevSessions => prevSessions.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(sessions.length > 1 ? sessions.find(s => s.id !== sessionId)?.id ?? null : null);
    }
    toast({ title: 'Session Deleted' });
  };

  const handleKnowledgeBaseUpdate = (updatedSessionData: ChatSession) => {
     if (currentSession && currentSession.id === updatedSessionData.id) {
        updateSession(updatedSessionData);
     }
  };
  
  if (!isMounted) {
     // Optional: render a loading skeleton or null for SSR/initial client render phase
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
      onKnowledgeBaseUpdate={handleKnowledgeBaseUpdate}
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
