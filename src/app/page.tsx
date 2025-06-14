
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { ChatLayout } from '@/components/chat/chat-layout';
import { ChatArea } from '@/components/chat/chat-area';
import type { ChatMessage, ChatSession, KnowledgeBaseFile, SupportedLanguage } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE_CODE, getLanguageConfig } from '@/config/languages';

const API_BASE_URL = 'http://34.134.224.160:8000'; 

const generateId = () => Math.random().toString(36).substr(2, 9);

const SESSIONS_STORAGE_KEY = 'allamai-sessions';
const CURRENT_SESSION_ID_STORAGE_KEY = 'allamai-current-session-id';
const SELECTED_LANGUAGE_STORAGE_KEY = 'allamai-selected-language';

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedLanguage, setSelectedLanguageState] = useState<SupportedLanguage>(() => getLanguageConfig(DEFAULT_LANGUAGE_CODE));
  const { toast } = useToast();

  const currentSession = sessions.find(s => s.id === currentSessionId);

  // Load session list and language from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const storedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (storedSessions) {
        const parsedSessions = JSON.parse(storedSessions) as ChatSession[];
        parsedSessions.forEach(s => {
          s.messages = s.messages || []; 
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
          handleCreateNewSession(true); 
        }
      } else {
        handleCreateNewSession(true); 
      }

      const storedLanguageCode = localStorage.getItem(SELECTED_LANGUAGE_STORAGE_KEY);
      setSelectedLanguageState(getLanguageConfig(storedLanguageCode || DEFAULT_LANGUAGE_CODE));

    } catch (error) {
      console.error("Failed to load session data from localStorage", error);
      toast({ title: "Error", description: "Could not load session data. Starting fresh.", variant: "destructive" });
      handleCreateNewSession(true); 
      setSelectedLanguageState(getLanguageConfig(DEFAULT_LANGUAGE_CODE));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const setSelectedLanguage = useCallback((languageCode: string) => {
    setSelectedLanguageState(getLanguageConfig(languageCode));
    localStorage.setItem(SELECTED_LANGUAGE_STORAGE_KEY, languageCode);
  }, []);

  // Fetch messages for the current session when it changes or on mount
  useEffect(() => {
    if (!currentSessionId || !isMounted) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/sessions/${currentSessionId}/messages`);
        const messagesData = response.data;
        const fetchedMessages: ChatMessage[] = (Array.isArray(messagesData.messages) ? messagesData.messages : (Array.isArray(messagesData) ? messagesData : [])).map((msg: any) => ({
          ...msg,
          language: msg.language || selectedLanguage.code, // Ensure language is set
        }));

        setSessions(prevSessions =>
          prevSessions.map(s =>
            s.id === currentSessionId ? { ...s, messages: fetchedMessages } : s
          )
        );
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
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
  }, [currentSessionId, isMounted, toast, selectedLanguage.code]); 


  // Save session list (metadata only) to localStorage when it changes
  useEffect(() => {
    if (!isMounted) return; 
    try {
      const sessionsToStore = sessions.map(({ messages, ...rest }) => ({
        ...rest,
        knowledgeBaseManual: rest.knowledgeBaseManual || [], 
        knowledgeBaseFiles: rest.knowledgeBaseFiles || [],  
      }));
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessionsToStore));
      
      if (currentSessionId) {
        localStorage.setItem(CURRENT_SESSION_ID_STORAGE_KEY, currentSessionId);
      } else {
        localStorage.removeItem(CURRENT_SESSION_ID_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save session list to localStorage", error);
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
      language: selectedLanguage.code,
    };

    addMessageToSession(currentSession.id, userMessage);
    setIsLoading(true);

    try {
      const apiRequestBody = {
        session_id: currentSession.id, 
        question: userInput,
        language: selectedLanguage.code,
      };

      const response = await axios.post(`${API_BASE_URL}/chat`, apiRequestBody);
      const aiResponseData = response.data;

      const botMessage: ChatMessage = {
        id: generateId(),
        role: 'bot',
        content: aiResponseData.final_answer,
        timestamp: Date.now(), 
        language: aiResponseData.language || selectedLanguage.code,
        durationMs: aiResponseData.response_time ? Math.round(aiResponseData.response_time * 1000) : undefined,
        knowledgeBaseUsed: aiResponseData.kb_used, 
        fromCache: aiResponseData.cached, 
        cosineDistance: aiResponseData.distance,
        promptSentToModel: aiResponseData.question_asked, 
      };
      
      addMessageToSession(currentSession.id, botMessage);

      // If backend detected and responded in a different language, update UI
      if (aiResponseData.language && aiResponseData.language !== selectedLanguage.code) {
        setSelectedLanguage(aiResponseData.language);
      }

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
       const errorMessageContent = selectedLanguage.code === 'ar' ? "عذراً، لم أتمكن من معالجة طلبك. الرجاء المحاولة مرة أخرى." : "Sorry, I couldn't process your request. Please try again.";
       addMessageToSession(currentSession.id, {
         id: generateId(),
         role: 'bot',
         content: errorMessageContent,
         timestamp: Date.now(),
         language: selectedLanguage.code,
       });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewSession = useCallback((switchToNew = true) => {
    const newSessionId = generateId();
    const newSessionName = selectedLanguage.code === 'ar' 
        ? `محادثة ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : `Chat ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newSession: ChatSession = {
      id: newSessionId,
      name: newSessionName,
      createdAt: Date.now(),
      messages: [], 
      knowledgeBaseManual: [],
      knowledgeBaseFiles: [],
    };
    setSessions(prevSessions => [newSession, ...prevSessions]);
    if (switchToNew) {
      setCurrentSessionId(newSessionId);
    }
    return newSessionId;
  }, [selectedLanguage.code]); 

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/sessions/${sessionId}`);
      
      setSessions(prevSessions => {
        const remainingSessions = prevSessions.filter(s => s.id !== sessionId);
        if (currentSessionId === sessionId) {
          if (remainingSessions.length > 0) {
            setCurrentSessionId(remainingSessions[0].id);
          } else {
            const newId = handleCreateNewSession(false); 
            setCurrentSessionId(newId); 
            const sessionsAfterDeletion = prevSessions.filter(s => s.id !== sessionId);
            if (sessionsAfterDeletion.length === 0) {
                handleCreateNewSession(true); 
                return []; 
            }
            setCurrentSessionId(sessionsAfterDeletion[0].id);
            return sessionsAfterDeletion;
          }
        }
        return remainingSessions;
      });
      toast({ title: 'Session Deleted', description: `Session was deleted successfully.` });

    } catch (error: any) {
        console.error('Error deleting session:', error);
        let detailMessage = "Could not delete session.";
        if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
           setSessions(prevSessions => {
             const remainingSessions = prevSessions.filter(s => s.id !== sessionId);
             if (currentSessionId === sessionId) {
               if (remainingSessions.length > 0) {
                 setCurrentSessionId(remainingSessions[0].id);
               } else {
                 handleCreateNewSession(true); 
                 return []; 
               }
             }
             return remainingSessions;
           });
           toast({ title: 'Session Removed', description: `Session removed locally (not found on server).` });
           return; 
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
      const response = await axios.post(`${API_BASE_URL}/knowledge-base/add`, { 
        session_id: currentSession.id, 
        entry: entry,
        language: selectedLanguage.code,
      });
      const result = response.data; 
      
      if (result.success) {
        setSessions(prevSessions => prevSessions.map(s => 
            s.id === currentSession.id 
            ? { ...s, knowledgeBaseManual: [...(s.knowledgeBaseManual || []), entry] } 
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
    formData.append('session_id', currentSession.id); 
    formData.append('language', selectedLanguage.code);

    try {
      const response = await axios.post(`${API_BASE_URL}/knowledge-base/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const result = response.data; 

      if (result.success) {
        const newKbFile: KnowledgeBaseFile = {
          name: result.filename || file.name, 
          type: file.type.includes('pdf') ? 'pdf' : 'txt', 
          content: `Uploaded: ${result.filename || file.name}`, 
        };
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
      selectedLanguage={selectedLanguage}
      onSetSelectedLanguage={setSelectedLanguage}
      supportedLanguages={SUPPORTED_LANGUAGES}
    >
      <ChatArea
        messages={currentSession?.messages || []}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        currentSessionId={currentSessionId}
        selectedLanguage={selectedLanguage}
      />
    </ChatLayout>
  );
}
