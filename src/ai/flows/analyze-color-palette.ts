'use server';

/**
 * @fileOverview An AI agent for analyzing trending color palettes.
 *
 * - analyzeTrendingColorPalettes - A function that analyzes trending color palettes based on user interactions.
 * - AnalyzeTrendingColorPalettesInput - The input type for the analyzeTrendingColorPalettes function.
 * - AnalyzeTrendingColorPalettesOutput - The return type for the analyzeTrendingColorPalettes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTrendingColorPalettesInputSchema = z.object({
  userInteractionsData: z
    .string()
    .describe(
      'A string containing data about user interactions with colors, including captures and shares. Should include hex codes and frequency of captures and shares.'
    ),
});
export type AnalyzeTrendingColorPalettesInput =
  z.infer<typeof AnalyzeTrendingColorPalettesInputSchema>;

const AnalyzeTrendingColorPalettesOutputSchema = z.object({
  trendingColors: z
    .array(z.string())
    .describe('A list of the most trending colors (hex codes).'),
  dominantPalettes: z
    .array(z.string())
    .describe(
      'A list of dominant color palettes, represented as comma-separated hex codes.'
    ),
  insights: z
    .string()
    .describe(
      'Insights into popular color preferences based on the analyzed data.'
    ),
});

export type AnalyzeTrendingColorPalettesOutput =
  z.infer<typeof AnalyzeTrendingColorPalettesOutputSchema>;

export async function analyzeTrendingColorPalettes(
  input: AnalyzeTrendingColorPalettesInput
): Promise<AnalyzeTrendingColorPalettesOutput> {
  return analyzeTrendingColorPalettesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTrendingColorPalettesPrompt',
  input: {schema: AnalyzeTrendingColorPalettesInputSchema},
  output: {schema: AnalyzeTrendingColorPalettesOutputSchema},
  prompt: `You are an expert color analyst. Analyze the following data about user interactions with colors to identify trending colors and dominant palettes, and provide insights into user color preferences.

Data: {{{userInteractionsData}}}

Trending Colors: A list of the most trending colors (hex codes).
Dominant Palettes: A list of dominant color palettes, represented as comma-separated hex codes. These should be based on colors frequently seen together in user captures and shares.
Insights: Insights into popular color preferences based on the analyzed data.

Output the trending colors, dominant palettes, and insights based on your analysis.`,
});

const analyzeTrendingColorPalettesFlow = ai.defineFlow(
  {
    name: 'analyzeTrendingColorPalettesFlow',
    inputSchema: AnalyzeTrendingColorPalettesInputSchema,
    outputSchema: AnalyzeTrendingColorPalettesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
