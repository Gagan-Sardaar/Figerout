'use server';

/**
 * @fileOverview An AI agent for analyzing and scoring SEO for blog posts.
 *
 * - generateSeoScore - A function that scores a blog post based on its content.
 * - GenerateSeoScoreInput - The input type for the generateSeoScore function.
 * - GenerateSeoScoreOutput - The return type for the generateSeoScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSeoScoreInputSchema = z.object({
  title: z.string().describe('The main title of the blog post.'),
  content: z.string().describe('The full markdown content of the blog post.'),
  metaTitle: z.string().optional().describe('The SEO meta title for the blog post.'),
  metaDescription: z.string().optional().describe('The SEO meta description for the blog post.'),
});
export type GenerateSeoScoreInput = z.infer<typeof GenerateSeoScoreInputSchema>;

const GenerateSeoScoreOutputSchema = z.object({
  score: z.number().min(0).max(100).describe('An SEO score from 0 to 100.'),
  feedback: z.string().describe('Actionable feedback and suggestions for improving the SEO score.'),
});
export type GenerateSeoScoreOutput = z.infer<typeof GenerateSeoScoreOutputSchema>;

export async function generateSeoScore(
  input: GenerateSeoScoreInput
): Promise<GenerateSeoScoreOutput> {
  return generateSeoScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSeoScorePrompt',
  input: { schema: GenerateSeoScoreInputSchema },
  output: { schema: GenerateSeoScoreOutputSchema },
  prompt: `You are an SEO expert. Analyze the following blog post content and provide an SEO score out of 100, along with actionable feedback.

Consider these factors for scoring:
- Title and Meta Title: Clarity, keyword presence, length (50-60 characters).
- Meta Description: Compelling, includes keywords, length (150-160 characters).
- Content: Readability, keyword density (without stuffing), structure (headings, paragraphs), length (aim for at least 300 words), and overall quality.

Return a JSON object with a 'score' (0-100) and 'feedback' (a concise string with 2-3 key improvement points).

Title: {{{title}}}
Meta Title: {{{metaTitle}}}
Meta Description: {{{metaDescription}}}
Content Body (Markdown):
---
{{{content}}}
---
`,
});

const generateSeoScoreFlow = ai.defineFlow(
  {
    name: 'generateSeoScoreFlow',
    inputSchema: GenerateSeoScoreInputSchema,
    outputSchema: GenerateSeoScoreOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
