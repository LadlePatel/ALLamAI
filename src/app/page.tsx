
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ChatLayout } from '@/components/chat/chat-layout';
import { ChatArea } from '@/components/chat/chat-area';
import type { ChatMessage, ChatSession, KnowledgeBaseFile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';

const API_BASE_URL = 'https://34.134.224.160'; // Updated API Base URL

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

  // Load session list from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const storedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (storedSessions) {
        const parsedSessions = JSON.parse(storedSessions) as ChatSession[];
        // Ensure all sessions have necessary arrays initialized
        parsedSessions.forEach(s => {
          s.messages = s.messages || []; // Messages are primarily server-side now, but client might keep a copy
          s.knowledgeBaseManual = s.knowledgeBaseManual || [];
          s.knowledgeBaseFiles = s.knowledgeBaseFiles || [];
        });
        setSessions(parsedSessions);

        const storedCurrentSessionId = localStorage.getItem(CURRENT_SESSION_ID_STORAGE_KEY);
        if (storedCurrentSessionId && parsedSessions.find(s => s.id === storedCurrentSessionId)) {
          setCurrentSessionId(storedCurrentSessionId);
        } else if (parsedSessions.length > 0) {
          setCurrentSessionId(parsedSessions[0].id);
        } else {
          handleCreateNewSession(true); // Create a new session if none are found or stored
        }
      } else {
        handleCreateNewSession(true); // Create a new session if no sessions in localStorage
      }
    } catch (error) {
      console.error("Failed to load session list from localStorage", error);
      toast({ title: "Error", description: "Could not load session data from local storage. Starting fresh.", variant: "destructive" });
      handleCreateNewSession(true); // Ensure a session exists even if local storage fails
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]); // handleCreateNewSession dependency removed as it causes loops if toast is involved; it's stable.


  // Fetch messages for the current session when it changes or on mount
  useEffect(() => {
    if (!currentSessionId || !isMounted) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/sessions/${currentSessionId}/messages`);
        const messagesData = response.data;
        // Assuming response.data is { messages: ChatMessage[] } or similar
        const fetchedMessages = Array.isArray(messagesData.messages) ? messagesData.messages : (Array.isArray(messagesData) ? messagesData : []);

        setSessions(prevSessions =>
          prevSessions.map(s =>
            s.id === currentSessionId ? { ...s, messages: fetchedMessages } : s
          )
        );
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
          // Session not found on server, treat as new client-side session with empty messages
          console.log(`Session ${currentSessionId} not found on server. Initializing with empty messages.`);
          setSessions(prevSessions =>
            prevSessions.map(s =>
              s.id === currentSessionId ? { ...s, messages: [] } : s
            )
          );
        } else {
          console.error('Error fetching messages:', error);
          let detailMessage = "Failed to fetch messages for session.";
          if (axios.isAxiosError(error) && error.response) {
            detailMessage += ` Server: ${error.response.status} - ${JSON.stringify(error.response.data?.detail || error.response.data || error.message)}`;
          } else if (error instanceof Error) {
            detailMessage += ` ${error.message}`;
          }
          toast({
            title: 'Error',
            description: detailMessage,
            variant: 'destructive',
          });
          // Ensure messages array is empty if fetching fails, to prevent UI errors
          setSessions(prevSessions =>
            prevSessions.map(s =>
              s.id === currentSessionId ? { ...s, messages: [] } : s
            )
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSessionId, isMounted, toast]); // API_BASE_URL is stable, toast might change if its provider rerenders


  // Save session list (metadata only) to localStorage when it changes
  useEffect(() => {
    if (!isMounted) return; // Don't save during server-side rendering or before hydration
    try {
      // Store only session metadata, not the messages themselves to keep localStorage light
      const sessionsToStore = sessions.map(({ messages, ...rest }) => ({
        ...rest,
        knowledgeBaseManual: rest.knowledgeBaseManual || [], // ensure arrays exist
        knowledgeBaseFiles: rest.knowledgeBaseFiles || [],   // ensure arrays exist
      }));
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessionsToStore));
      
      if (currentSessionId) {
        localStorage.setItem(CURRENT_SESSION_ID_STORAGE_KEY, currentSessionId);
      } else {
        localStorage.removeItem(CURRENT_SESSION_ID_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save session list to localStorage", error);
      // Optionally, inform the user if saving fails, though often this is a silent operation
      // toast({ title: "Warning", description: "Could not save session data to local storage.", variant: "default" });
    }
  }, [sessions, currentSessionId, isMounted]);

  const addMessageToSession = useCallback((sessionId: string, message: ChatMessage) => {
    setSessions(prevSessions =>
      prevSessions.map(s =>
        s.id === sessionId ? { ...s, messages: [...(s.messages || []), message] } : s
      )
    );
  }, []);


  const handleSendMessage = async (userInput: string) => {
    if (!currentSession) {
        toast({ title: 'No active session', description: 'Cannot send message.', variant: 'destructive' });
        return;
    }

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
      // The backend now manages history and knowledge base context
      const apiRequestBody = {
        session_id: currentSession.id, // Backend needs to know which session this is for
        user_input: userInput,
      };

      const response = await axios.post(`${API_BASE_URL}/chat`, apiRequestBody);
      const aiResponseData = response.data; // Assuming this matches ChatbotConversationOutput structure
      const endTime = Date.now();
      const durationMs = endTime - startTime;

      const botMessage: ChatMessage = {
        id: generateId(),
        role: 'bot',
        content: aiResponseData.response, // Assuming backend key is 'response'
        timestamp: Date.now(), // Or use a server-provided timestamp if available
        durationMs: durationMs,
        knowledgeBaseUsed: aiResponseData.knowledge_base_used, // field from FastAPI
        fromCache: aiResponseData.from_cache, // field from FastAPI
        cosineDistance: aiResponseData.cosine_distance, // field from FastAPI
        promptSentToModel: aiResponseData.prompt_sent_to_model, // field from FastAPI
      };
      
      addMessageToSession(currentSession.id, botMessage);

    } catch (error: any) {
      console.error('Error getting AI response:', error);
      let detailMessage = "Failed to get AI response.";
      if (axios.isAxiosError(error) && error.response) {
        detailMessage += ` Server: ${error.response.status} - ${JSON.stringify(error.response.data?.detail || error.response.data || error.message)}`;
      } else if (error instanceof Error) {
        detailMessage += ` ${error.message}`;
      }
      toast({
        title: 'Error',
        description: detailMessage,
        variant: 'destructive',
      });
       // Add a generic error message to the chat for the user
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

  const handleCreateNewSession = useCallback((switchToNew = true) => {
    const newSessionId = generateId();
    const newSession: ChatSession = {
      id: newSessionId,
      name: `Chat ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      createdAt: Date.now(),
      messages: [], // Start with empty messages; will be fetched if session exists on server
      knowledgeBaseManual: [],
      knowledgeBaseFiles: [],
    };
    setSessions(prevSessions => [newSession, ...prevSessions]);
    if (switchToNew) {
      setCurrentSessionId(newSessionId);
    }
    // Note: We don't need to explicitly create the session on the backend here.
    // The backend can create it on the first interaction (e.g., first /chat or /messages call).
    return newSessionId;
  }, []); 

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    // Messages for the selected session will be fetched by the useEffect hook
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/sessions/${sessionId}`);
      
      // Remove from local state regardless of server success for responsiveness,
      // but server is the source of truth.
      setSessions(prevSessions => {
        const remainingSessions = prevSessions.filter(s => s.id !== sessionId);
        if (currentSessionId === sessionId) {
          if (remainingSessions.length > 0) {
            setCurrentSessionId(remainingSessions[0].id);
          } else {
            // If no sessions left, create a new one and switch to it
            const newId = handleCreateNewSession(false); // Create but don't switch yet
            setCurrentSessionId(newId); // Now switch
            return remainingSessions; // This will be empty before new one is added by handleCreateNewSession
          }
        }
        return remainingSessions;
      });
      toast({ title: 'Session Deleted', description: `Session was deleted successfully.` });

    } catch (error: any) {
        console.error('Error deleting session:', error);
        let detailMessage = "Could not delete session.";
        // If server says 404, it means it's already gone or never existed there.
        // Proceed with local deletion.
        if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
           setSessions(prevSessions => {
             const remainingSessions = prevSessions.filter(s => s.id !== sessionId);
             if (currentSessionId === sessionId) {
               if (remainingSessions.length > 0) {
                 setCurrentSessionId(remainingSessions[0].id);
               } else {
                 const newId = handleCreateNewSession(false);
                 setCurrentSessionId(newId);
               }
             }
             return remainingSessions;
           });
           toast({ title: 'Session Removed', description: `Session removed locally (not found on server).` });
           return; // Exit early for 404
        } else if (axios.isAxiosError(error) && error.response) {
          detailMessage += ` Server: ${error.response.status} - ${JSON.stringify(error.response.data?.detail || error.response.data || error.message)}`;
        } else if (error instanceof Error) {
          detailMessage += ` ${error.message}`;
        }
        toast({
          title: 'Error',
          description: detailMessage,
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
      // Backend request body needs session_id and the entry content
      const response = await axios.post(`${API_BASE_URL}/knowledge-base/add`, { 
        session_id: currentSession.id, 
        entry: entry 
      });
      const result = response.data; // Assuming { success: boolean, message: string, id?: string }
      
      if (result.success) {
        // Update local display list of KB entries for the current session
        setSessions(prevSessions => prevSessions.map(s => 
            s.id === currentSession.id 
            ? { ...s, knowledgeBaseManual: [...(s.knowledgeBaseManual || []), entry] } // Add the raw entry for display
            : s
        ));
        toast({ title: 'Knowledge Base Updated', description: result.message });
      } else {
        throw new Error(result.message || 'Failed to add KB entry on server.');
      }
    } catch (error: any) {
      console.error('Error adding manual KB entry:', error);
      let detailMessage = "Failed to add manual KB entry.";
      if (axios.isAxiosError(error) && error.response) {
        detailMessage += ` Server: ${error.response.status} - ${JSON.stringify(error.response.data?.detail || error.response.data || error.message)}`;
      } else if (error instanceof Error) {
        detailMessage += ` ${error.message}`;
      }
      toast({ title: 'KB Error', description: detailMessage, variant: 'destructive' });
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
    formData.append('session_id', currentSession.id); // Server needs session_id

    try {
      const response = await axios.post(`${API_BASE_URL}/knowledge-base/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const result = response.data; // Assuming { success: boolean, message: string, filename?: string }

      if (result.success) {
        const newKbFile: KnowledgeBaseFile = {
          name: result.filename || file.name, // Use filename from server if provided
          type: file.type.includes('pdf') ? 'pdf' : 'txt', // Basic type detection
          content: `Uploaded: ${result.filename || file.name}`, // Placeholder content for local display
        };
        // Update local display list of KB files for the current session
        setSessions(prevSessions => prevSessions.map(s =>
            s.id === currentSession.id
            ? { ...s, knowledgeBaseFiles: [...(s.knowledgeBaseFiles || []), newKbFile] }
            : s
        ));
        toast({ title: 'Knowledge Base Updated', description: result.message });
      } else {
        throw new Error(result.message || 'Failed to process file on server.');
      }
    } catch (error: any) {
      console.error('Error uploading KB file:', error);
      let detailMessage = "Failed to upload KB file.";
      if (axios.isAxiosError(error) && error.response) {
        detailMessage += ` Server: ${error.response.status} - ${JSON.stringify(error.response.data?.detail || error.response.data || error.message)}`;
      } else if (error instanceof Error) {
        detailMessage += ` ${error.message}`;
      }
      toast({ title: 'KB File Error', description: detailMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Loading screen until component is mounted and initial session logic is resolved
  if (!isMounted || !currentSessionId || !currentSession) {
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
      onCreateNewSession={() => handleCreateNewSession(true)}
      onSelectSession={handleSelectSession}
      onDeleteSession={handleDeleteSession}
      onAddManualKbEntry={handleAddManualKbEntry}
      onAddKbFile={handleAddKbFile}
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

    