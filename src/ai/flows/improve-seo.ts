
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
  isBlogPost: z.boolean().optional().describe('Whether the content is a blog post.'),
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
  system: 'You are an expert SEO content writer. Your primary task is to rewrite and improve web content based on specific feedback. You MUST always return a valid JSON object that conforms to the output schema. If you cannot make improvements for any reason, you MUST return the original content within the `improvedContent` field of the JSON response.',
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are an expert SEO content writer. Your task is to rewrite the provided content and metadata to address the given SEO feedback and achieve an SEO score of 90 or higher.

**Content to Improve:**
*   **Original Title:** {{{title}}}
{{#if metaTitle}}*   **Original Meta Title:** {{{metaTitle}}}{{/if}}
{{#if metaDescription}}*   **Original Meta Description:** {{{metaDescription}}}{{/if}}
*   **Focus Keywords:** {{#if focusKeywords}}{{#each focusKeywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not provided{{/if}}
*   **SEO Feedback to Address:** {{{feedback}}}

**Original Content (Markdown):**
---
{{{content}}}
---

**Instructions:**

1.  **Rewrite Content & Metadata:** Rewrite the original content, meta title, and meta description to resolve all issues mentioned in the feedback. Integrate the focus keywords naturally. Improve structure, formatting, and add relevant placeholder links.
{{#if isBlogPost}}
2.  **Add a Relevant Image:** Use the \`findRelevantImage\` tool **once** to find and insert a suitable stock photo at the beginning of the content. Choose a search query that reflects the main topic.
{{/if}}
3.  **Return JSON:** Your entire response must be a single, valid JSON object that strictly follows the output schema.
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
