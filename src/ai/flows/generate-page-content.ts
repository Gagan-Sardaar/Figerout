
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
  prompt: `You are an expert content strategist and SEO specialist for 'Figerout'. Your task is to generate the full content for a static web page from scratch.

**About Figerout:**
Figerout: AI Colour Vision is a smart mobile-first tool that captures real-world colours through your camera and instantly identifies their HEX codes, names, and human-friendly descriptions using a custom AI pipeline. The workflow blends computer vision and generative AI—processing the image, sampling pixel data, mapping it to standard colour spaces, and using a fine-tuned language model to generate natural, accessible descriptions like “dusty rose” or “warm sunset orange.” Trained on a rich dataset of labelled colours, design vocabularies, and varied lighting conditions (including simulation for colour-blind users), Figerout ensures accuracy, inclusivity, and ease of sharing through custom links. This project is designed for designers, artists, developers, and educators seeking a seamless bridge between real-world inspiration and digital creativity.

**Instructions for Content Generation:**

1.  **Generate All Fields:** Based on the provided page topic, generate all required fields: \`pageTitle\`, \`metaTitle\`, \`metaDescription\`, \`focusKeywords\`, and \`pageContent\`.

2.  **SEO Best Practices:**
    *   **Meta Title:** Create a concise, SEO-friendly title (50-60 characters) for the HTML \`<title>\` tag. It should be compelling and contain primary keywords.
    *   **Meta Description:** Write a compelling summary (150-160 characters) to attract clicks on search engine results pages. Include keywords naturally.
    *   **Focus Keywords:** Identify and list 3-5 primary keywords that the content should target.

3.  **High-Quality Page Content:**
    *   **Structure and Readability:** The content must be comprehensive and well-structured in Markdown format. Use clear, keyword-targeted headings (H2, H3), bulleted or numbered lists, and paragraphs to make it readable and informative. Use **bold** and *italic* formatting for emphasis.
    *   **Keyword Integration:** Naturally integrate the focus keywords throughout the page content, headings, and meta tags. Avoid "keyword stuffing."
    *   **Legal Pages:** For legal pages like "Privacy Policy" or "Terms of Service," generate realistic and professional content tailored to a creative tech app. Do not use simple placeholder text. The content should be comprehensive and build trust.

**Application Name:** {{{appName}}}
**Page Topic:** {{{pageTopic}}}
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
