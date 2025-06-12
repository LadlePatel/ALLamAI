
"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { useToast } from '@/hooks/use-toast'; // Toast handled by parent
// import type { ChatSession, KnowledgeBaseFile } from '@/types'; // No longer need these types here
import { FileUp, Loader2 } from 'lucide-react';

interface KbFileUploadFormProps {
  onAddFile: (file: File) => Promise<void>; // Changed prop
  disabled?: boolean;
}

export function KbFileUploadForm({ onAddFile, disabled }: KbFileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const { toast } = useToast(); // Parent will handle toasts

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || disabled) return;

    setIsLoading(true);
    try {
      await onAddFile(file); // Call the new prop
      setFile(null); // Clear file input on successful call
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
      }
    } catch (error) {
      // Error handling is now primarily managed by the parent component (page.tsx)
      console.error('Error submitting file upload form:', error);
    } finally {
      setIsLoading(false);
    }
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
              disabled={disabled || isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full text-xs" 
            disabled={disabled || !file || isLoading}
            size="sm"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            {isLoading ? 'Processing...' : 'Add File to KB'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

    