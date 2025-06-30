
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
import { searchPexelsImage } from '@/app/actions';

const ImproveSeoInputSchema = z.object({
  title: z.string().describe('The title of the content.'),
  content: z.string().describe('The original content in Markdown format.'),
  metaTitle: z.string().optional().describe('The SEO meta title.'),
  metaDescription: z.string().optional().describe('The SEO meta description.'),
  focusKeywords: z.array(z.string()).describe('A list of focus keywords.'),
  feedback: z.string().describe('The SEO feedback that needs to be addressed.'),
});
type ImproveSeoInput = z.infer<typeof ImproveSeoInputSchema>;

const ImproveSeoOutputSchema = z.object({
  improvedContent: z.string().describe('The rewritten content in Markdown format, optimized for SEO.'),
  improvedMetaTitle: z.string().optional().describe('The rewritten, SEO-optimized meta title (50-60 characters).'),
  improvedMetaDescription: z.string().optional().describe('The rewritten, SEO-optimized meta description (150-160 characters).'),
});
export type ImproveSeoOutput = z.infer<typeof ImproveSeoOutputSchema>;

export async function improveSeo(input: ImproveSeoInput): Promise<ImproveSeoOutput> {
  return improveSeoFlow(input);
}

const findRelevantImage = ai.defineTool(
  {
    name: 'findRelevantImage',
    description: 'Finds a relevant stock photo from Pexels for a given topic and returns its Markdown embed code, including attribution. Use this to add a visually appealing and contextually relevant image to the content.',
    inputSchema: z.object({
      query: z.string().describe('A search query describing the desired image, e.g., "vibrant colors abstract".'),
    }),
    outputSchema: z.object({
        markdown: z.string().describe('The full Markdown string for the image, including alt text and attribution link. e.g., "![alt text](data:image...)\\n*Photo by [Author](url)*". Returns an empty string if no image is found.')
    }),
  },
  async ({ query }) => {
    const imageDetails = await searchPexelsImage(query);
    if (!imageDetails) {
      return { markdown: '' };
    }
    const { dataUri, photographer, photographerUrl, alt } = imageDetails;
    const markdown = `![${alt}](${dataUri})\n*Photo by [${photographer}](${photographerUrl})*`;
    return { markdown };
  }
);

const prompt = ai.definePrompt({
  name: 'improveSeoPrompt',
  input: {schema: ImproveSeoInputSchema},
  output: {schema: ImproveSeoOutputSchema},
  tools: [findRelevantImage],
  prompt: `You are an expert SEO content writer and content strategist. Your task is to rewrite and restructure the provided content and its associated metadata to achieve an SEO score of 90 or higher.
Carefully analyze the original content, metadata, and the provided SEO feedback.

**Instructions for Improvement:**

1.  **Address All Feedback:** Directly address all points mentioned in the SEO feedback. This includes fixing issues with the meta title and meta description.
2.  **Rewrite Meta Tags:** If the feedback mentions issues with the meta title or description (e.g., length, keyword presence), rewrite them to be optimal and include them in the output.
3.  **Keyword Integration:** Naturally integrate the focus keywords throughout the content, headings, and meta tags.
4.  **Structure and Readability:**
    *   Restructure the content with clear headings (H2, H3, H4) and subheadings to improve organization.
    *   Use bulleted or numbered lists to break up long paragraphs and present information clearly.
    *   Use **bold** and _italic_ formatting to emphasize key points.
    *   Add blockquotes for quotes or important callouts.
5.  **Add a Relevant Image:** If the content would be improved by an image, use the \`findRelevantImage\` tool to find a suitable stock photo. Place the returned Markdown for the image at an appropriate point in the content, usually after the introduction. Only use the tool once. If the tool returns nothing, do not add an image.
6.  **Add Links:** Add placeholder internal and external links where relevant to boost credibility. Use the format \`[link text](/) \` for internal links and \`[link text](https://example.com)\` for external links.
7.  **Quality:** Ensure the final content is high-quality, engaging, informative, and significantly improved from the original. Do not change the core topic.
8.  **Output:** Output the rewritten content and updated meta tags in the specified JSON format.

**Content Details:**

*   **Original Title:** {{{title}}}
*   **Original Meta Title:** {{{metaTitle}}}
*   **Original Meta Description:** {{{metaDescription}}}
*   **Focus Keywords:** {{#each focusKeywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

**SEO Feedback to Address:**
{{{feedback}}}

**Original Content (Markdown):**
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
