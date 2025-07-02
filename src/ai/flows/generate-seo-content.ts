
'use server';

/**
 * @fileOverview AI-powered SEO content generator for blog posts.
 *
 * - generateSeoContent - A function that generates a single SEO-friendly blog post title and summary.
 * - GenerateSeoContentInput - The input type for the generateSeoContent function.
 * - GenerateSeoContentOutput - The return type for the generateSeoContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSeoContentInputSchema = z.object({
  topic: z.string().describe('The topic to generate a blog post idea about, related to colors.'),
});
export type GenerateSeoContentInput = z.infer<typeof GenerateSeoContentInputSchema>;

const GenerateSeoContentOutputSchema = z.object({
    title: z.string().describe('The suggested blog post title.'),
    summary: z.string().describe('A brief summary of the blog post.'),
});
export type GenerateSeoContentOutput = z.infer<typeof GenerateSeoContentOutputSchema>;

export async function generateSeoContent(input: GenerateSeoContentInput): Promise<GenerateSeoContentOutput> {
  return generateSeoContentFlow(input);
}

const generateSeoContentPrompt = ai.definePrompt({
  name: 'generateSeoContentPrompt',
  input: {schema: GenerateSeoContentInputSchema},
  output: {schema: GenerateSeoContentOutputSchema},
  prompt: `You are an expert SEO content strategist.

Generate ONE unique, SEO-friendly blog post title and a brief summary (around 2-3 sentences) based on the given topic. The idea should be engaging and have strong potential to rank well in search results.

The output must be structured as a single JSON object containing a 'title' and a 'summary'.

Topic: {{{topic}}}
`,
});

const generateSeoContentFlow = ai.defineFlow(
  {
    name: 'generateSeoContentFlow',
    inputSchema: GenerateSeoContentInputSchema,
    outputSchema: GenerateSeoContentOutputSchema,
  },
  async input => {
    const {output} = await generateSeoContentPrompt(input);
    return output!;
  }
);
