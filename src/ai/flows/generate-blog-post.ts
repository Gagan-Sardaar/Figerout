
'use server';

/**
 * @fileOverview An AI agent for generating full blog posts from a title, including SEO metadata and an image query.
 *
 * - generateBlogPost - A function that generates a full blog post in Markdown format.
 * - GenerateBlogPostInput - The input type for the generateBlogPost function.
 * - GenerateBlogPostOutput - The return type for the generateBlogPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBlogPostInputSchema = z.object({
  title: z.string().describe('The title of the blog post to generate.'),
});
export type GenerateBlogPostInput = z.infer<typeof GenerateBlogPostInputSchema>;

const GenerateBlogPostOutputSchema = z.object({
  content: z.string().describe('The full blog post content in Markdown format.'),
  metaTitle: z.string().describe('An SEO-optimized title for the <title> tag (50-60 characters).'),
  metaDescription: z.string().describe('A compelling meta description for search engines (150-160 characters).'),
  focusKeywords: z.array(z.string()).describe('An array of 3-5 primary focus keywords for the post.'),
  imageSearchQuery: z.string().describe('A 2-3 word search query suitable for finding a feature image on a stock photo website like Pexels.'),
});
export type GenerateBlogPostOutput = z.infer<typeof GenerateBlogPostOutputSchema>;

export async function generateBlogPost(input: GenerateBlogPostInput): Promise<GenerateBlogPostOutput> {
  return generateBlogPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBlogPostPrompt',
  input: {schema: GenerateBlogPostInputSchema},
  output: {schema: GenerateBlogPostOutputSchema},
  prompt: `You are an expert content creator and SEO specialist. Your task is to generate a well-structured and engaging blog post based on the provided title.

Your output must be a valid JSON object that conforms to the output schema.

**Instructions:**

1.  **Content:** Write a blog post of at least 800 words. The content should be high-quality, easy to read, and structured with Markdown (using H2, H3, lists, bold, etc.).
2.  **SEO Score:** The content and metadata should be optimized to achieve an SEO score of 80 or higher.
3.  **SEO Metadata:**
    *   \`metaTitle\`: Create a concise, SEO-friendly title (50-60 characters).
    *   \`metaDescription\`: Write a compelling summary for search engines (150-160 characters).
    *   \`focusKeywords\`: Provide an array of 3-5 relevant keywords.
4.  **Image Query:**
    *   \`imageSearchQuery\`: Generate a 2-3 word search query suitable for finding a feature image on a stock photo website.

**Blog Post Title:**
{{{title}}}
`,
});

const generateBlogPostFlow = ai.defineFlow(
  {
    name: 'generateBlogPostFlow',
    inputSchema: GenerateBlogPostInputSchema,
    outputSchema: GenerateBlogPostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
