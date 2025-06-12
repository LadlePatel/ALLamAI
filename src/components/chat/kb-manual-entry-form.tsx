
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { useToast } from '@/hooks/use-toast'; // Toast will be handled by parent
// import type { ChatSession } from '@/types'; // No longer need ChatSession type here
import { FilePlus2, Loader2 } from 'lucide-react';

interface KbManualEntryFormProps {
  onAddEntry: (entry: string) => Promise<void>; // Changed prop
  disabled?: boolean;
}

export function KbManualEntryForm({ onAddEntry, disabled }: KbManualEntryFormProps) {
  const [entry, setEntry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const { toast } = useToast(); // Parent will handle toasts

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry.trim() || disabled) return;

    setIsLoading(true);
    try {
      await onAddEntry(entry.trim()); // Call the new prop
      setEntry(''); // Clear input on successful call (parent handles actual success)
    } catch (error) {
      // Error handling (e.g., toast) is now primarily managed by the parent component (page.tsx)
      console.error('Error submitting manual entry form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-none border-none bg-transparent">
      <CardHeader className="p-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FilePlus2 className="h-4 w-4" />
          Manual Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="kb-manual-entry" className="sr-only">
              Add to Knowledge Base
            </Label>
            <Textarea
              id="kb-manual-entry"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="Type your knowledge entry here..."
              rows={3}
              className="text-xs"
              disabled={disabled || isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full text-xs" 
            disabled={disabled || !entry.trim() || isLoading}
            size="sm"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            {isLoading ? 'Adding...' : 'Add Entry to KB'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

    