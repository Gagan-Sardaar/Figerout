'use server';

/**
 * @fileOverview An AI agent for generating images from a text prompt, with an optional style reference.
 *
 * - generateImage - A function that generates an image based on a prompt.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('A text description of the image to generate.'),
  referenceImageUrl: z.string().optional().describe('An optional URL to an image to use as a style reference.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe("The generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async ({ prompt, referenceImageUrl }) => {
    let generationPrompt: string | Array<object> = prompt;

    if (referenceImageUrl) {
      generationPrompt = [
        { media: { url: referenceImageUrl } },
        { text: `Generate an image in your own unique style, using the provided image as a visual and stylistic reference, but adapted to the following prompt: "${prompt}"` },
      ];
    }
    
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: generationPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const imagePart = media?.find(p => p.media && p.media.url);

    if (!imagePart || !imagePart.media?.url) {
      throw new Error('Image generation failed to return a valid image URL.');
    }

    return { imageUrl: imagePart.media.url };
  }
);
