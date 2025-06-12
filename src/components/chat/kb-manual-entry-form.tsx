
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { ChatSession } from '@/types';
import { FilePlus2, Loader2 } from 'lucide-react';

interface KbManualEntryFormProps {
  currentSession: ChatSession | null | undefined;
  onKnowledgeBaseUpdate: (updatedSession: ChatSession) => void;
  disabled?: boolean;
}

export function KbManualEntryForm({ currentSession, onKnowledgeBaseUpdate, disabled }: KbManualEntryFormProps) {
  const [entry, setEntry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession || !entry.trim()) return;

    setIsLoading(true);
    try {
      // Simulating processing. A real implementation would send this to a backend
      // to be vectorized and stored in a vector database.
      await new Promise(resolve => setTimeout(resolve, 300)); 
      const simulatedResult = { success: true, message: `Entry processed locally (simulated for UI). Real KB would use vector embeddings.` };
      
      if (simulatedResult.success) {
        const updatedKbManual = [...(currentSession.knowledgeBaseManual || []), entry.trim()];
        const updatedSession: ChatSession = { ...currentSession, knowledgeBaseManual: updatedKbManual };
        onKnowledgeBaseUpdate(updatedSession);
        setEntry('');
        toast({
          title: 'Knowledge Base Updated (Simulated)',
          description: simulatedResult.message,
        });
      } else {
        toast({
          title: 'Error (Simulated)',
          description: simulatedResult.message || 'Failed to add manual entry.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error simulating manual KB entry:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred during simulated entry.',
        variant: 'destructive',
      });
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
              disabled={!currentSession || isLoading || disabled}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full text-xs" 
            disabled={!currentSession || !entry.trim() || isLoading || disabled}
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
