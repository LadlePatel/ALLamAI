
export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: number;
  language?: string; // Added for message-specific language
  knowledgeBaseUsed?: string | null;
  fromCache?: boolean;
  durationMs?: number;
  cosineDistance?: number;
  promptSentToModel?: string;
}

export interface KnowledgeBaseFile {
  name:string;
  type: 'txt' | 'pdf';
  content: string; 
}

export interface ChatSession {
  id: string;
  name: string;
  createdAt: number;
  messages: ChatMessage[];
  knowledgeBaseManual: string[];
  knowledgeBaseFiles: KnowledgeBaseFile[];
}

export interface SupportedLanguage {
  code: string;
  name: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  placeholder: string;
}
