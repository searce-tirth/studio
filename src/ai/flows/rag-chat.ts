// RagChat flow definition.
'use server';
/**
 * @fileOverview implements the RagChat flow.
 *
 * - ragChat - A function that implements the RAG chat functionality.
 * - RagChatInput - The input type for the ragChat function.
 * - RagChatOutput - The return type for the ragChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RagChatInputSchema = z.object({
  message: z.string().describe('The user message to send to the chat bot.'),
  history: z
    .array(z.object({role: z.enum(['user', 'assistant']), content: z.string()}))
    .optional()
    .describe('The chat history.'),
  model: z.string().optional().describe('The model to use for the chat.'),
});
export type RagChatInput = z.infer<typeof RagChatInputSchema>;

const RagChatOutputSchema = z.object({
  response: z.string().describe('The response from the chat bot.'),
});
export type RagChatOutput = z.infer<typeof RagChatOutputSchema>;

export async function ragChat(input: RagChatInput): Promise<RagChatOutput> {
  return ragChatFlow(input);
}

const ragChatPrompt = ai.definePrompt({
  name: 'ragChatPrompt',
  input: {schema: RagChatInputSchema},
  output: {schema: RagChatOutputSchema},
  prompt: `You are a helpful chat bot. Use the chat history to maintain context.

Chat History:
{{#each history}}
  {{this.role}}: {{this.content}}
{{/each}}

User Message: {{message}}

Response: `,
});

const ragChatFlow = ai.defineFlow(
  {
    name: 'ragChatFlow',
    inputSchema: RagChatInputSchema,
    outputSchema: RagChatOutputSchema,
  },
  async input => {
    const {output} = await ragChatPrompt(input, { model: input.model ? `googleai/${input.model}` : undefined });
    return output!;
  }
);
