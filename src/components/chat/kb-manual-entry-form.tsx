
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2, Loader2 } from 'lucide-react';
import type { SupportedLanguage } from '@/types';

interface KbManualEntryFormProps {
  onAddEntry: (entry: string) => Promise<void>; 
  disabled?: boolean;
  selectedLanguage: SupportedLanguage;
}

export function KbManualEntryForm({ onAddEntry, disabled, selectedLanguage }: KbManualEntryFormProps) {
  const [entry, setEntry] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry.trim() || disabled) return;

    setIsLoading(true);
    try {
      await onAddEntry(entry.trim()); 
      setEntry(''); 
    } catch (error) {
      console.error('Error submitting manual entry form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const titleText = selectedLanguage.code === 'ar' ? 'إدخال يدوي' : 'Manual Entry';
  const placeholderText = selectedLanguage.code === 'ar' ? 'اكتب إدخال المعرفة الخاص بك هنا...' : 'Type your knowledge entry here...';
  const buttonText = selectedLanguage.code === 'ar' ? 'إضافة إدخال إلى قاعدة المعرفة' : 'Add Entry to KB';
  const loadingText = selectedLanguage.code === 'ar' ? 'جار الإضافة...' : 'Adding...';

  return (
    <Card className="w-full shadow-none border-none bg-transparent" dir={selectedLanguage.dir}>
      <CardHeader className="p-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FilePlus2 className="h-4 w-4" />
          {titleText}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="kb-manual-entry" className="sr-only">
              {titleText}
            </Label>
            <Textarea
              id="kb-manual-entry"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder={placeholderText}
              rows={3}
              className="text-xs"
              disabled={disabled || isLoading}
              dir={selectedLanguage.dir}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full text-xs" 
            disabled={disabled || !entry.trim() || isLoading}
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
