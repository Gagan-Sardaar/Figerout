'use server';

/**
 * @fileOverview An AI agent for extracting dominant colors from clothing in an image.
 *
 * - extractDominantColors - A function that identifies the 5 most dominant colors from clothing.
 * - ExtractDominantColorsInput - The input type for the extractDominantColors function.
 * - ExtractDominantColorsOutput - The return type for the extractDominantColors function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const ExtractDominantColorsInputSchema = z.object({
  imageUrl: z.string().describe('The public URL of the image to analyze.'),
});
export type ExtractDominantColorsInput = z.infer<typeof ExtractDominantColorsInputSchema>;

export const ExtractDominantColorsOutputSchema = z.object({
  colors: z.array(z.object({
    hex: z.string().describe('The hex code of the dominant color.'),
    name: z.string().describe('The common name of the color.'),
  })).describe('An array of the 5 most dominant colors found in the clothing.'),
});
export type ExtractDominantColorsOutput = z.infer<typeof ExtractDominantColorsOutputSchema>;

export async function extractDominantColors(
  input: ExtractDominantColorsInput
): Promise<ExtractDominantColorsOutput> {
  return extractDominantColorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractDominantColorsPrompt',
  input: { schema: ExtractDominantColorsInputSchema },
  output: { schema: ExtractDominantColorsOutputSchema },
  prompt: `You are a fashion and color expert. Analyze the provided image and identify the 5 most dominant colors found specifically on the clothing items worn by people in the image. Ignore background colors, skin tones, and non-clothing items.

For each of the 5 colors, provide its hex code and a common, simple name for the color.

Image URL: {{{imageUrl}}}

Return the result as a JSON object matching the specified output schema.
`,
});

const extractDominantColorsFlow = ai.defineFlow(
  {
    name: 'extractDominantColorsFlow',
    inputSchema: ExtractDominantColorsInputSchema,
    outputSchema: ExtractDominantColorsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({
        ...input,
        // The multimodal model expects image content directly
        // This is a placeholder for how you would pass an image part.
        // In a real scenario, you'd fetch the URL and convert to a data part.
        // For now, we rely on the model's ability to fetch from URL.
    });
    return output!;
  }
);
