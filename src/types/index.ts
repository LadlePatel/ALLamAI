
export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: number;
  knowledgeBaseUsed?: string | null;
  fromCache?: boolean;
  durationMs?: number;
  cosineDistance?: number;
  promptSentToModel?: string;
}

export interface KnowledgeBaseFile {
  name:string;
  type: 'txt' | 'pdf'; // Store original type if needed for display or re-processing
  content: string; // For TXT, this is raw text. For PDF, this would be extracted text.
}

export interface ChatSession {
  id: string;
  name: string;
  createdAt: number;
  messages: ChatMessage[];
  knowledgeBaseManual: string[];
  knowledgeBaseFiles: KnowledgeBaseFile[];
}

