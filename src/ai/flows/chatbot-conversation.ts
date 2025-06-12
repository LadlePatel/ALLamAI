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
  conversationHistory: z.array(z.object({ 
    role: z.enum(['user', 'bot']),
    content: z.string(),
  })).optional().describe('The conversation history between the user and the chatbot.'),
  knowledgeBase: z.string().optional().describe('The combined knowledge base content for the chatbot.'),
});

export type ChatbotConversationInput = z.infer<typeof ChatbotConversationInputSchema>;

const ChatbotConversationOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user input.'),
  knowledgeBaseUsed: z.string().optional().describe('The snippet from the knowledge base used for the response, if any.'),
  fromCache: z.boolean().optional().describe('Indicates if the response was retrieved from a cache.'),
});

export type ChatbotConversationOutput = z.infer<typeof ChatbotConversationOutputSchema>;

export async function chatbotConversation(input: ChatbotConversationInput): Promise<ChatbotConversationOutput> {
  return chatbotConversationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotConversationPrompt',
  input: {schema: ChatbotConversationInputSchema},
  // Output schema for the prompt itself will just be a string response
  // The flow will augment this with other details like fromCache and knowledgeBaseUsed
  output: {schema: z.object({ response: z.string() })},
  prompt: `You are ALLamAI, an intelligent and precise AI assistant.
{{#if knowledgeBase}}
Review the following information from the knowledge base. If it is relevant to the user's question, use it to formulate your answer and briefly mention the key information from the knowledge base that helped.
[Knowledge Base Start]
{{{knowledgeBase}}}
[Knowledge Base End]
{{else}}
You do not have a specific knowledge base for this query.
{{/if}}

Conversation History:
{{#if conversationHistory}}
  {{#each conversationHistory}}
    {{role}}: {{content}}
  {{/each}}
{{else}}
No previous conversation history.
{{/if}}

User Input:
{{userInput}}

Assistant Response:`,
});

const chatbotConversationFlow = ai.defineFlow(
  {
    name: 'chatbotConversationFlow',
    inputSchema: ChatbotConversationInputSchema,
    outputSchema: ChatbotConversationOutputSchema,
  },
  async (input: ChatbotConversationInput): Promise<ChatbotConversationOutput> => {
    // Simulate cache check
    const isFromCache = Math.random() > 0.8; // Simulate 20% cache hit rate

    // Simulate KB usage determination (simplified)
    let kbUsedSnippet: string | undefined = undefined;
    if (input.knowledgeBase && input.knowledgeBase.trim().length > 0) {
      // Simple simulation: if KB exists and user input is not trivial, assume some part of KB might be relevant.
      // A real system would use embeddings to find relevant chunks.
      if (input.userInput.toLowerCase().includes('info') || input.userInput.length > 10) { // Example trigger
         kbUsedSnippet = input.knowledgeBase.substring(0, Math.min(input.knowledgeBase.length, 200));
         if (input.knowledgeBase.length > 200) kbUsedSnippet += "...";
      }
    }

    if (isFromCache) {
      // Simulate a cached response
      let cachedResponseText = `(Simulated Cache) Based on previous interactions regarding "${input.userInput}", here's a cached answer.`;
      if (kbUsedSnippet) {
        // cachedResponseText += ` It might have originally used knowledge like: "${kbUsedSnippet}".`;
      }
      return {
        response: cachedResponseText,
        knowledgeBaseUsed: kbUsedSnippet, // This might be a "best guess" if it was cached
        fromCache: true,
      };
    } else {
      // Not from cache, call the LLM
      // Pass only relevant parts to the prompt, the prompt template handles the rest
      const { output } = await prompt({ 
        userInput: input.userInput, 
        conversationHistory: input.conversationHistory,
        knowledgeBase: kbUsedSnippet // Pass the potentially relevant snippet to the prompt
      });
      
      // The LLM's output is the main response.
      // The kbUsedSnippet here is what we *thought* might be useful before calling the LLM.
      // The LLM's actual response might or might not reflect usage of this specific snippet.
      // For a more accurate "knowledgeBaseUsed" post-LLM, the LLM would need to explicitly state what it used,
      // or we'd need more sophisticated parsing of its response.
      // For now, we'll return the snippet we *provided* to the prompt if we provided one.
      return {
        response: output!.response,
        knowledgeBaseUsed: kbUsedSnippet, 
        fromCache: false,
      };
    }
  }
);
