
'use server';

/**
 * @fileOverview An AI agent for generating full blog posts from a title.
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
});
export type GenerateBlogPostOutput = z.infer<typeof GenerateBlogPostOutputSchema>;

export async function generateBlogPost(input: GenerateBlogPostInput): Promise<GenerateBlogPostOutput> {
  return generateBlogPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBlogPostPrompt',
  input: {schema: GenerateBlogPostInputSchema},
  output: {schema: GenerateBlogPostOutputSchema},
  prompt: `You are an expert blog post writer for the 'Figerout' app, skilled in creating engaging, SEO-optimized content about color, design, and creativity.

**About Figerout:**
Figerout: AI Colour Vision is a creative tech project designed to capture colours from the real world using a mobile camera and instantly identify their HEX codes, names, and visual descriptions through AI. Users simply snap a photo, tap a point on the image, and receive a precise colour breakdown powered by Google Gemini API. The app then allows users to copy or share the colour info via a unique link. It's a smart mobile-first tool that blends computer vision, colour theory, and generative AI to offer designers, artists, and developers a seamless way to explore and use real-world colours in their digital work.

Based on the provided title, generate a full blog post of 1000-1500 words in Markdown format.
Ensure the content is engaging, informative, relevant to the Figerout app, and optimized for search engines.

Title: {{{title}}}
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
