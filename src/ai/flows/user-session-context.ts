'use server';

/**
 * @fileOverview Manages user session context for the chatbot.
 *
 * - getUserSessionContext - A function that retrieves and returns the user session context.
 * - UserSessionContextInput - The input type for the getUserSessionContext function.
 * - UserSessionContextOutput - The return type for the getUserSessionContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UserSessionContextInputSchema = z.object({
  sessionId: z.string().describe('The ID of the user session.'),
});
export type UserSessionContextInput = z.infer<typeof UserSessionContextInputSchema>;

const UserSessionContextOutputSchema = z.object({
  context: z.string().describe('The conversation history for the session.'),
});
export type UserSessionContextOutput = z.infer<typeof UserSessionContextOutputSchema>;

export async function getUserSessionContext(input: UserSessionContextInput): Promise<UserSessionContextOutput> {
  return userSessionContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'userSessionContextPrompt',
  input: {schema: UserSessionContextInputSchema},
  output: {schema: UserSessionContextOutputSchema},
  prompt: `You are a chatbot assistant. Use the following context to answer the user's question. 

Context: {{{context}}}`,
});

const userSessionContextFlow = ai.defineFlow(
  {
    name: 'userSessionContextFlow',
    inputSchema: UserSessionContextInputSchema,
    outputSchema: UserSessionContextOutputSchema,
  },
  async input => {
    // Here, you would normally retrieve the session context from a database or cache
    // based on the sessionId.
    // For this example, we'll just return a static context.
    const context = `Previous conversation history for session ${input.sessionId}: ...`;

    const {output} = await prompt({...input, context});
    return output!;
  }
);
