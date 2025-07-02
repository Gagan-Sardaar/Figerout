
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
  prompt: `You are an expert blog post writer and SEO specialist for the 'Figerout' app, skilled in creating engaging, SEO-optimized content about color, design, and creativity.

**About Figerout:**
Figerout: AI Colour Vision is a smart mobile-first tool that captures real-world colours through your camera and instantly identifies their HEX codes, names, and human-friendly descriptions using a custom AI pipeline. The workflow blends computer vision and generative AI—processing the image, sampling pixel data, mapping it to standard colour spaces, and using a fine-tuned language model to generate natural, accessible descriptions like “dusty rose” or “warm sunset orange.” Trained on a rich dataset of labelled colours, design vocabularies, and varied lighting conditions (including simulation for colour-blind users), Figerout ensures accuracy, inclusivity, and ease of sharing through custom links. This project is designed for designers, artists, developers, and educators seeking a seamless bridge between real-world inspiration and digital creativity. **Important: Figerout is an independent project, not a large company. Avoid mentioning a "team" or using corporate language. Frame it as the vision of a passionate creator.**

**Instructions for Blog Post Generation:**

1.  **Length and Format:** Generate a full blog post of 1000-1500 words in Markdown format for the 'content' field.
2.  **Engaging Content:** The content must be engaging, informative, and highly relevant to the Figerout app and its audience (designers, artists, developers, creatives).
3.  **SEO Optimization:**
    *   **Structure:** Use clear, compelling headings (H2, H3) and subheadings to structure the post.
    *   **Readability:** Use short paragraphs, bullet points, and **bold** or *italic* text to improve readability.
    *   **Keywords:** Naturally weave in relevant keywords related to the title, color theory, design, AI, and the Figerout app.
4.  **Tone and Style:** Maintain a creative, inspiring, and authoritative tone.
5.  **SEO Metadata:** Generate the following SEO fields:
    *   **metaTitle:** A concise, SEO-friendly title (50-60 characters).
    *   **metaDescription:** A compelling summary (150-160 characters).
    *   **focusKeywords:** An array of 3-5 primary keywords.
6.  **Image Query:** Generate an \`imageSearchQuery\` field with 2-3 descriptive words that are highly relevant to the blog post's topic, suitable for finding a feature image.

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
