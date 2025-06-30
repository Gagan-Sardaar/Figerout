
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
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are an expert SEO content writer and content strategist. Your task is to rewrite and restructure the provided content and its associated metadata to achieve an SEO score of 90 or higher.
Carefully analyze the original content, metadata, and the provided SEO feedback.

**Instructions for Improvement:**

1.  **Address All Feedback:** Directly address all points mentioned in the SEO feedback. This is the most important instruction.

2.  **Rewrite Meta Tags:**
    *   If the feedback mentions issues with the meta title or description (e.g., length, keyword presence, consistency), rewrite them to be optimal.
    *   Meta titles should be 50-60 characters.
    *   Meta descriptions should be 150-160 characters and compelling.

3.  **Keyword Integration:**
    *   Naturally integrate the focus keywords throughout the content, headings, and meta tags.
    *   Adjust keyword density as needed: increase it if it's too low, or reduce it if the content feels repetitive or "stuffed". The goal is natural language.

4.  **Structure and Readability:**
    *   Restructure the content with clear, keyword-targeted headings (H2, H3, H4) and subheadings to improve organization.
    *   Use bulleted or numbered lists to break up long paragraphs and present information clearly.
    *   Use **bold** and _italic_ formatting to emphasize key points.
    *   Add blockquotes for quotes or important callouts.

5.  **Content Expansion:**
    *   If the content is too brief, expand upon it to build topical authority and provide more value to the reader.
    *   For legal pages like a Privacy Policy, if you encounter placeholder text, replace it with realistic and professional content suitable for a creative tech app.

6.  **Add a Relevant Image:**
    *   If the content would be improved by a visual, use the \`findRelevantImage\` tool to find a suitable stock photo.
    *   Place the returned Markdown for the image at an appropriate point in the content, usually after the introduction.
    *   Only use the tool once. If the tool returns nothing, do not add an image.

7.  **Add Links:**
    *   Add a mix of placeholder internal and external links where relevant to boost credibility and user engagement.
    *   Use the format \`[link text](/) \` for internal links and \`[link text](https://example.com)\` for external links.

8.  **Quality and Output:**
    *   Ensure the final content is high-quality, engaging, informative, and significantly improved from the original. Do not change the core topic.
    *   Output the rewritten content and updated meta tags in the specified JSON format.

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
