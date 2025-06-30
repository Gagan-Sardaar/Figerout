'use server';
/**
 * @fileOverview An AI agent for extracting descriptive keywords from an image.
 *
 * - extractImageKeywords - A function that analyzes an image and returns relevant search keywords.
 * - ExtractImageKeywordsInput - The input type for the extractImageKeywords function.
 * - ExtractImageKeywordsOutput - The return type for the extractImageKeywords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractImageKeywordsInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractImageKeywordsInput = z.infer<typeof ExtractImageKeywordsInputSchema>;

const ExtractImageKeywordsOutputSchema = z.object({
  keywords: z.array(z.string()).describe('An array of 2-3 descriptive keywords suitable for a stock photo search.'),
});
export type ExtractImageKeywordsOutput = z.infer<typeof ExtractImageKeywordsOutputSchema>;

export async function extractImageKeywords(input: ExtractImageKeywordsInput): Promise<ExtractImageKeywordsOutput> {
  return extractImageKeywordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractImageKeywordsPrompt',
  input: {schema: ExtractImageKeywordsInputSchema},
  output: {schema: ExtractImageKeywordsOutputSchema},
  prompt: `Analyze the following image and provide 2-3 descriptive keywords that would be effective for finding similar images on a stock photo website. Focus on the main subject, style, and mood.

Image: {{media url=imageDataUri}}`,
});

const extractImageKeywordsFlow = ai.defineFlow(
  {
    name: 'extractImageKeywordsFlow',
    inputSchema: ExtractImageKeywordsInputSchema,
    outputSchema: ExtractImageKeywordsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
