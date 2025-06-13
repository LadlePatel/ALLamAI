
"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUp, Loader2 } from 'lucide-react';
import type { SupportedLanguage } from '@/types';

interface KbFileUploadFormProps {
  onAddFile: (file: File) => Promise<void>; 
  disabled?: boolean;
  selectedLanguage: SupportedLanguage;
}

export function KbFileUploadForm({ onAddFile, disabled, selectedLanguage }: KbFileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      await onAddFile(file); 
      setFile(null); 
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
      }
    } catch (error) {
      console.error('Error submitting file upload form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const titleText = selectedLanguage.code === 'ar' ? 'رفع ملف (.txt, .pdf)' : 'File Upload (.txt, .pdf)';
  const buttonText = selectedLanguage.code === 'ar' ? 'إضافة ملف إلى قاعدة المعرفة' : 'Add File to KB';
  const loadingText = selectedLanguage.code === 'ar' ? 'جاري المعالجة...' : 'Processing...';


  return (
    <Card className="w-full shadow-none border-none bg-transparent" dir={selectedLanguage.dir}>
      <CardHeader className="p-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileUp className="h-4 w-4" />
          {titleText}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="kb-file-upload" className="sr-only">
              {titleText}
            </Label>
            <Input
              id="kb-file-upload"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt,.pdf"
              className="text-xs h-9 file:mr-2 file:text-xs file:font-medium file:bg-primary/10 file:text-primary file:border-0 file:rounded file:px-2 file:py-1 hover:file:bg-primary/20"
              disabled={disabled || isLoading}
              dir={selectedLanguage.dir}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full text-xs" 
            disabled={disabled || !file || isLoading}
            size="sm"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            {isLoading ? loadingText : buttonText}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
