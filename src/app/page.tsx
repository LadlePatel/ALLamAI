
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ChatLayout } from '@/components/chat/chat-layout';
import { ChatArea } from '@/components/chat/chat-area';
import type { ChatMessage, ChatSession } from '@/types';
import { chatbotConversation } from '@/ai/flows/chatbot-conversation';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';

// For generating unique IDs
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
        const parsedSessions = JSON.parse(storedSessions);
        if (parsedSessions.length > 0) {
          setCurrentSessionId(parsedSessions[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
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
    const startTime = Date.now();

    try {
      const currentKbString = [
        ...(currentSession.knowledgeBaseManual || []).map(entry => `Manual Entry: ${entry}`),
        ...(currentSession.knowledgeBaseFiles || []).map(f => `File: ${f.name}\nContent:\n${f.content}`)
      ].join('\n\n---\n\n');

      const conversationHistoryForAI = currentSession.messages
        .slice(-10) // Send last 10 messages for history
        .map(msg => ({ role: msg.role, content: msg.content }));

      const aiResponse = await chatbotConversation({
        userInput,
        conversationHistory: conversationHistoryForAI,
        knowledgeBase: currentKbString,
      });
      
      const endTime = Date.now();
      const durationMs = endTime - startTime;

      const botMessage: ChatMessage = {
        id: generateId(),
        role: 'bot',
        content: aiResponse.response,
        timestamp: Date.now(),
        knowledgeBaseUsed: aiResponse.knowledgeBaseUsed,
        fromCache: aiResponse.fromCache,
        durationMs: durationMs,
      };
      
      updateSession({ ...currentSession, messages: [...updatedMessages, botMessage] });

    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI response.',
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

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prevSessions => {
      const remainingSessions = prevSessions.filter(s => s.id !== sessionId);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
      }
      return remainingSessions;
    });
    toast({ title: 'Session Deleted' });
  };

  const handleKnowledgeBaseUpdate = (updatedSessionData: ChatSession) => {
     if (currentSession && currentSession.id === updatedSessionData.id) {
        updateSession(updatedSessionData);
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
