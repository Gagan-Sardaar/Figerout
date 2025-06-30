'use server';

/**
 * @fileOverview An AI agent for improving SEO of existing content.
 *
 * - improveSeo - A function that rewrites content to improve its SEO score.
 * - ImproveSeoInput - The input type for the improveSeo function.
 * - ImproveSeoOutput - The return type for the improveSeo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ImproveSeoInputSchema = z.object({
  title: z.string().describe('The title of the content.'),
  content: z.string().describe('The original content in Markdown format.'),
  metaTitle: z.string().optional().describe('The SEO meta title.'),
  metaDescription: z.string().optional().describe('The SEO meta description.'),
  focusKeywords: z.array(z.string()).describe('A list of focus keywords.'),
  feedback: z.string().describe('The SEO feedback that needs to be addressed.'),
});
export type ImproveSeoInput = z.infer<typeof ImproveSeoInputSchema>;

export const ImproveSeoOutputSchema = z.object({
  improvedContent: z.string().describe('The rewritten content in Markdown format, optimized for SEO.'),
});
export type ImproveSeoOutput = z.infer<typeof ImproveSeoOutputSchema>;

export async function improveSeo(input: ImproveSeoInput): Promise<ImproveSeoOutput> {
  return improveSeoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveSeoPrompt',
  input: {schema: ImproveSeoInputSchema},
  output: {schema: ImproveSeoOutputSchema},
  prompt: `You are an expert SEO content writer. Your task is to rewrite the provided content to achieve an SEO score of 90 or higher.
Carefully analyze the original content and the provided SEO feedback.

Instructions:
1.  Address all points mentioned in the feedback.
2.  Naturally integrate the focus keywords throughout the content.
3.  Ensure the content remains high-quality, readable, and engaging.
4.  Do not change the core message or topic of the content.
5.  Output only the rewritten content in well-structured Markdown format.

Original Title: {{{title}}}
Original Meta Title: {{{metaTitle}}}
Original Meta Description: {{{metaDescription}}}
Focus Keywords: {{#each focusKeywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

SEO Feedback to Address:
{{{feedback}}}

Original Content (Markdown):
---
{{{content}}}
---
`,
});

const improveSeoFlow = ai.defineFlow(
  {
    name: 'improveSeoFlow',
    inputSchema: ImproveSeoInputSchema,
    outputSchema: ImproveSeoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
