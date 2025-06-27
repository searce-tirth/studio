'use server';
/**
 * @fileOverview A flow to select a model for the chat application.
 *
 * - selectModel - A function that allows users to select an LLM for chat.
 * - SelectModelInput - The input type for the selectModel function.
 * - SelectModelOutput - The return type for the selectModel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SelectModelInputSchema = z.object({
  modelName: z.string().describe('The name of the model to use for the chat.'),
});
export type SelectModelInput = z.infer<typeof SelectModelInputSchema>;

const SelectModelOutputSchema = z.object({
  modelName: z.string().describe('The name of the selected model.'),
});
export type SelectModelOutput = z.infer<typeof SelectModelOutputSchema>;

export async function selectModel(input: SelectModelInput): Promise<SelectModelOutput> {
  return selectModelFlow(input);
}

const selectModelFlow = ai.defineFlow(
  {
    name: 'selectModelFlow',
    inputSchema: SelectModelInputSchema,
    outputSchema: SelectModelOutputSchema,
  },
  async input => {
    // No need to call an LLM here, just return the selected model name.
    return {modelName: input.modelName};
  }
);
