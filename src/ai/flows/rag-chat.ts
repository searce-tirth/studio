'use server';
/**
 * @fileOverview implements the RagChat flow.
 *
 * - ragChat - A function that implements the RAG chat functionality.
 * - RagChatInput - The input type for the ragChat function.
 * - RagChatOutput - The return type for the ragChat function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import wav from 'wav';

const RagChatInputSchema = z.object({
  message: z.string().describe('The user message to send to the chat bot.'),
  history: z
    .array(z.object({role: z.enum(['user', 'assistant']), content: z.string()}))
    .optional()
    .describe('The chat history.'),
  model: z.string().optional().describe('The model to use for the chat.'),
  isTtsEnabled: z
    .boolean()
    .optional()
    .describe('Whether to generate text-to-speech audio.'),
  voice: z.string().optional().describe('The voice to use for text-to-speech.'),
});
export type RagChatInput = z.infer<typeof RagChatInputSchema>;

const RagChatOutputSchema = z.object({
  response: z.string().describe('The response from the chat bot.'),
  audioDataUri: z
    .string()
    .optional()
    .describe('The generated audio as a base64 data URI.'),
});
export type RagChatOutput = z.infer<typeof RagChatOutputSchema>;

export async function ragChat(input: RagChatInput): Promise<RagChatOutput> {
  return ragChatFlow(input);
}

const ragChatPrompt = ai.definePrompt({
  name: 'ragChatPrompt',
  input: {schema: RagChatInputSchema},
  output: {schema: z.object({response: z.string()})},
  prompt: `You are a helpful chat bot. Use the chat history to maintain context.

Chat History:
{{#each history}}
  {{this.role}}: {{this.content}}
{{/each}}

User Message: {{message}}

Response: `,
});

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', d => {
      bufs.push(d);
    });
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const ragChatFlow = ai.defineFlow(
  {
    name: 'ragChatFlow',
    inputSchema: RagChatInputSchema,
    outputSchema: RagChatOutputSchema,
  },
  async input => {
    const {output} = await ragChatPrompt(input, {
      model: input.model ? `googleai/${input.model}` : undefined,
    });
    const responseText = output!.response;

    if (!input.isTtsEnabled) {
      return {response: responseText};
    }

    const {media} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: input.voice || 'Algenib'},
          },
        },
      },
      prompt: responseText,
    });

    if (!media) {
      console.error('No media returned from TTS model');
      return {response: responseText};
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);
    const audioDataUri = 'data:audio/wav;base64,' + wavBase64;

    return {
      response: responseText,
      audioDataUri,
    };
  }
);
