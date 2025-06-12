'use server';

/**
 * @fileOverview Implements the chatbot conversation flow.
 *
 * - chatbotConversation - A function that handles the conversation with the chatbot.
 * - ChatbotConversationInput - The input type for the chatbotConversation function.
 * - ChatbotConversationOutput - The return type for the chatbotConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatbotConversationInputSchema = z.object({
  userInput: z.string().describe('The user input to the chatbot.'),
  conversationHistory: z.array(z.object({ // Simplified conversation history
    role: z.enum(['user', 'bot']),
    content: z.string(),
  })).optional().describe('The conversation history between the user and the chatbot.'),
  knowledgeBase: z.string().optional().describe('The knowledge base for the chatbot.'),
});

export type ChatbotConversationInput = z.infer<typeof ChatbotConversationInputSchema>;

const ChatbotConversationOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user input.'),
});

export type ChatbotConversationOutput = z.infer<typeof ChatbotConversationOutputSchema>;

export async function chatbotConversation(input: ChatbotConversationInput): Promise<ChatbotConversationOutput> {
  return chatbotConversationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotConversationPrompt',
  input: {schema: ChatbotConversationInputSchema},
  output: {schema: ChatbotConversationOutputSchema},
  prompt: `You are a helpful chatbot. Use the following knowledge base and conversation history to generate a response to the user input.  If the knowledge base doesn't contain the information to answer the question, respond based on previous conversation history or general knowledge.

Knowledge Base:
{{knowledgeBase}}

Conversation History:
{{#each conversationHistory}}
  {{role}}: {{content}}
{{/each}}

User Input:
{{userInput}}`,
});

const chatbotConversationFlow = ai.defineFlow(
  {
    name: 'chatbotConversationFlow',
    inputSchema: ChatbotConversationInputSchema,
    outputSchema: ChatbotConversationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
