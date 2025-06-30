
'use server';

/**
 * @fileOverview An AI agent for generating full page content, including SEO metadata.
 *
 * - generatePageContent - A function that generates content for static pages.
 * - GeneratePageContentInput - The input type for the function.
 * - GeneratePageContentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePageContentInputSchema = z.object({
  pageTopic: z.string().describe('The topic of the page to generate, e.g., "About Us", "Privacy Policy".'),
  appName: z.string().describe('The name of the application.'),
});
export type GeneratePageContentInput = z.infer<typeof GeneratePageContentInputSchema>;

const GeneratePageContentOutputSchema = z.object({
  pageTitle: z.string().describe('The main H1 title for the page.'),
  metaTitle: z.string().describe('The SEO-optimized title for the <title> tag (50-60 characters).'),
  metaDescription: z.string().describe('A compelling meta description for search engines (150-160 characters).'),
  focusKeywords: z.array(z.string()).describe('An array of 3-5 primary focus keywords for the page.'),
  pageContent: z.string().describe('The full page content in well-structured Markdown format.'),
});
export type GeneratePageContentOutput = z.infer<typeof GeneratePageContentOutputSchema>;

export async function generatePageContent(input: GeneratePageContentInput): Promise<GeneratePageContentOutput> {
  return generatePageContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePageContentPrompt',
  input: {schema: GeneratePageContentInputSchema},
  output: {schema: GeneratePageContentOutputSchema},
  prompt: `You are an expert content strategist and SEO specialist for 'Figerout'. Your task is to generate the full content for a static web page.

**About Figerout:**
Figerout: AI Colour Vision is a smart mobile-first tool that captures real-world colours through your camera and instantly identifies their HEX codes, names, and human-friendly descriptions using a custom AI pipeline. The workflow blends computer vision and generative AI—processing the image, sampling pixel data, mapping it to standard colour spaces, and using a fine-tuned language model to generate natural, accessible descriptions. Figerout is designed for designers, artists, developers, and educators seeking a seamless bridge between real-world inspiration and digital creativity.

Your task is to generate the following based on the provided page topic, keeping the app's features and audience in mind:
1.  **Page Title:** A clear and engaging H1 title for the page.
2.  **Meta Title:** A concise, SEO-friendly title (50-60 characters) for the HTML <title> tag.
3.  **Meta Description:** A compelling summary (150-160 characters) to attract clicks on search engine results pages.
4.  **Focus Keywords:** A list of 3-5 primary keywords that the content should target.
5.  **Page Content:** Comprehensive, well-structured content for the page body in Markdown format. Use headings, lists, and paragraphs to make it readable and informative. For legal pages like Privacy Policy or Terms of Service, use placeholder sections but make the content look realistic and professional, tailored to a creative tech app.

Application Name: {{{appName}}}
Page Topic: {{{pageTopic}}}
`,
});

const generatePageContentFlow = ai.defineFlow(
  {
    name: 'generatePageContentFlow',
    inputSchema: GeneratePageContentInputSchema,
    outputSchema: GeneratePageContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
