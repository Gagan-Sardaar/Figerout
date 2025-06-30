
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
  prompt: `You are an SEO expert specializing in generating blog post ideas for 'Figerout', an AI color-capturing app.

**About Figerout:**
Figerout is a mobile app that lets users capture real-world colours through their camera and instantly identifies HEX codes, names, and descriptions using AI. It's for designers, artists, developers, and anyone inspired by the colors around them. **Note: Figerout is an independent project by a single creator.**

Generate ONE unique, SEO-friendly blog post title and summary based on the given topic. The idea should be relevant to Figerout's features and audience.
The output should be structured as a single JSON object, containing a 'title' and a 'summary'.

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
