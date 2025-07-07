'use server';

/**
 * @fileOverview An AI agent for improving SEO metadata.
 *
 * - suggestSeoImprovements - A function that suggests better meta titles and descriptions.
 * - SuggestSeoImprovementsInput - The input type for the function.
 * - SuggestSeoImprovementsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSeoImprovementsInputSchema = z.object({
  metaTitle: z.string().describe('The current meta title.'),
  metaDescription: z.string().describe('The current meta description.'),
  appName: z.string().describe('The name of the application.'),
});
export type SuggestSeoImprovementsInput = z.infer<typeof SuggestSeoImprovementsInputSchema>;

const SuggestSeoImprovementsOutputSchema = z.object({
  suggestedMetaTitle: z.string().describe('An improved, SEO-optimized meta title (50-60 characters).'),
  suggestedMetaDescription: z.string().describe('An improved, compelling meta description for search engines (150-160 characters).'),
});
export type SuggestSeoImprovementsOutput = z.infer<typeof SuggestSeoImprovementsOutputSchema>;

export async function suggestSeoImprovements(
  input: SuggestSeoImprovementsInput
): Promise<SuggestSeoImprovementsOutput> {
  return suggestSeoImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSeoImprovementsPrompt',
  input: {schema: SuggestSeoImprovementsInputSchema},
  output: {schema: SuggestSeoImprovementsOutputSchema},
  prompt: `You are an expert SEO specialist for '{{{appName}}}'. Your task is to rewrite the provided website metadata to improve its SEO performance and click-through rate on search engines.

**About Figerout:**
Figerout: AI Color Vision is a smart mobile-first tool that captures real-world colors through your camera and instantly identifies their HEX codes and names. It's for designers, artists, developers, and hobbyists.

**Current Metadata:**
*   Meta Title: {{{metaTitle}}}
*   Meta Description: {{{metaDescription}}}

**Instructions:**
1.  **Rewrite Meta Title:** Create a more compelling, SEO-friendly title between 50-60 characters. It should contain primary keywords and be enticing to users.
2.  **Rewrite Meta Description:** Write a more persuasive meta description between 150-160 characters. It should summarize the site's value proposition and include a call-to-action.

Return a valid JSON object with \`suggestedMetaTitle\` and \`suggestedMetaDescription\`.`,
});

const suggestSeoImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestSeoImprovementsFlow',
    inputSchema: SuggestSeoImprovementsInputSchema,
    outputSchema: SuggestSeoImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
