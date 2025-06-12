'use server';
/**
 * @fileOverview A flow to add manual entries to the knowledge base.
 *
 * - addKnowledgeBaseManualEntry - A function that handles adding a manual entry to the knowledge base.
 * - AddKnowledgeBaseManualEntryInput - The input type for the addKnowledgeBaseManualEntry function.
 * - AddKnowledgeBaseManualEntryOutput - The return type for the addKnowledgeBaseManualEntry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AddKnowledgeBaseManualEntryInputSchema = z.object({
  entry: z.string().describe('The manual entry to add to the knowledge base.'),
});
export type AddKnowledgeBaseManualEntryInput = z.infer<
  typeof AddKnowledgeBaseManualEntryInputSchema
>;

const AddKnowledgeBaseManualEntryOutputSchema = z.object({
  success: z.boolean().describe('Whether the entry was successfully added.'),
  message: z.string().describe('A message indicating the result of the operation.'),
});
export type AddKnowledgeBaseManualEntryOutput = z.infer<
  typeof AddKnowledgeBaseManualEntryOutputSchema
>;

export async function addKnowledgeBaseManualEntry(
  input: AddKnowledgeBaseManualEntryInput
): Promise<AddKnowledgeBaseManualEntryOutput> {
  return addKnowledgeBaseManualEntryFlow(input);
}

const addKnowledgeBaseManualEntryFlow = ai.defineFlow(
  {
    name: 'addKnowledgeBaseManualEntryFlow',
    inputSchema: AddKnowledgeBaseManualEntryInputSchema,
    outputSchema: AddKnowledgeBaseManualEntryOutputSchema,
  },
  async input => {
    // In a real implementation, this would add the entry to a persistent knowledge base.
    // For this example, we'll just return a success message.
    return {
      success: true,
      message: `Entry "${input.entry}" added to the knowledge base.`, // Note:  Template strings are OK here.
    };
  }
);
