
// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview AI-powered SEO content generator for blog posts.
 *
 * - generateSeoContent - A function that generates SEO-friendly blog post titles and summaries.
 * - GenerateSeoContentInput - The input type for the generateSeoContent function.
 * - GenerateSeoContentOutput - The return type for the generateSeoContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSeoContentInputSchema = z.object({
  topic: z.string().describe('The topic to generate blog posts about, related to colors.'),
});
export type GenerateSeoContentInput = z.infer<typeof GenerateSeoContentInputSchema>;

const GenerateSeoContentOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      title: z.string().describe('The suggested blog post title.'),
      summary: z.string().describe('A brief summary of the blog post.'),
    })
  ).describe('An array of suggested blog post titles and summaries.'),
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
Figerout is a mobile app that lets users capture real-world colours through their camera and instantly identifies HEX codes, names, and descriptions using AI. It's for designers, artists, developers, and anyone inspired by the colors around them.

Generate 5 SEO-friendly blog post titles and summaries based on the given topic. The ideas should be relevant to Figerout's features and audience.
The output should be structured as an array of objects, each containing a 'title' and a 'summary'.

Topic: {{{topic}}}

Output format: 
  {
    "suggestions": [
      {
        "title": "Blog Post Title 1",
        "summary": "Brief summary of the blog post 1."
      },
      {
        "title": "Blog Post Title 2",
        "summary": "Brief summary of the blog post 2."
      },
      {
        "title": "Blog Post Title 3",
        "summary": "Brief summary of the blog post 3."
      },
      {
        "title": "Blog Post Title 4",
        "summary": "Brief summary of the blog post 4."
      },
      {
        "title": "Blog Post Title 5",
        "summary": "Brief summary of the blog post 5."
      }
    ]
  }`,
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
