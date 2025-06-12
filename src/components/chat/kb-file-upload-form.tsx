"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { ChatSession, KnowledgeBaseFile } from '@/types';
import { addKnowledgeBaseFileUpload } from '@/ai/flows/add-knowledge-base-file-upload';
import { FileUp } from 'lucide-react';

interface KbFileUploadFormProps {
  currentSession: ChatSession | null | undefined;
  onKnowledgeBaseUpdate: (updatedSession: ChatSession) => void;
  disabled?: boolean;
}

export function KbFileUploadForm({ currentSession, onKnowledgeBaseUpdate, disabled }: KbFileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession || !file) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        const fileDataUri = event.target.result;
        try {
          // Call AI flow
          const result = await addKnowledgeBaseFileUpload({ fileDataUri, filename: file.name });

          if (result.success) {
            const newKbFile: KnowledgeBaseFile = {
              name: file.name,
              // For MVP, assume text extraction happens in the AI flow or is not needed client-side for this step
              // In a real app, you might extract text here for TXT or store URI for PDF processing
              content: file.type === 'text/plain' ? await file.text() : `Uploaded file: ${file.name}`, 
              type: file.type === 'application/pdf' ? 'pdf' : 'txt',
            };
            const updatedKbFiles = [...(currentSession.knowledgeBaseFiles || []), newKbFile];
            const updatedSession: ChatSession = { ...currentSession, knowledgeBaseFiles: updatedKbFiles };
            onKnowledgeBaseUpdate(updatedSession);
            
            setFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = ""; // Reset file input
            }
            toast({
              title: 'Knowledge Base Updated',
              description: result.message,
            });
          } else {
            toast({
              title: 'Error',
              description: result.message || 'Failed to upload file.',
              variant: 'destructive',
            });
          }
        } catch (error) {
          console.error('Error uploading KB file:', error);
          toast({
            title: 'Error',
            description: 'An unexpected error occurred during file upload.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        toast({
          title: 'Error',
          description: 'Could not read file data.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        toast({
          title: 'Error',
          description: 'Failed to read file.',
          variant: 'destructive',
        });
        setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="w-full shadow-none border-none bg-transparent">
      <CardHeader className="p-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileUp className="h-4 w-4" />
          File Upload (.txt, .pdf)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="kb-file-upload" className="sr-only">
              Upload File
            </Label>
            <Input
              id="kb-file-upload"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt,.pdf"
              className="text-xs h-9 file:mr-2 file:text-xs file:font-medium file:bg-primary/10 file:text-primary file:border-0 file:rounded file:px-2 file:py-1 hover:file:bg-primary/20"
              disabled={!currentSession || isLoading || disabled}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full text-xs" 
            disabled={!currentSession || !file || isLoading || disabled}
            size="sm"
          >
            {isLoading ? 'Uploading...' : 'Upload File'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
