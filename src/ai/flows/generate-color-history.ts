'use server';
/**
 * @fileOverview An AI agent for generating creative historical or futuristic facts about a color.
 *
 * - generateColorHistory - A function that generates a fun fact.
 * - GenerateColorHistoryInput - The input type.
 * - GenerateColorHistoryOutput - The return type.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateColorHistoryInputSchema = z.object({
  colorHex: z.string().describe('The hex code of the color (e.g., #RRGGBB).'),
  colorName: z.string().describe('The common name of the color.'),
});
export type GenerateColorHistoryInput = z.infer<typeof GenerateColorHistoryInputSchema>;

const GenerateColorHistoryOutputSchema = z.object({
  history: z.string().describe('A single, concise, creative sentence about the color. It can be a historical fact, a futuristic use, or a fantastical story. Should be engaging and surprising.'),
});
export type GenerateColorHistoryOutput = z.infer<typeof GenerateColorHistoryOutputSchema>;

export async function generateColorHistory(input: GenerateColorHistoryInput): Promise<GenerateColorHistoryOutput> {
  return generateColorHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateColorHistoryPrompt',
  input: { schema: GenerateColorHistoryInputSchema },
  output: { schema: GenerateColorHistoryOutputSchema },
  prompt: `You are a creative historian and futurist who finds fascinating stories about colors.

Generate ONE fun, single-sentence fact about the color '{{{colorName}}}' (hex: {{{colorHex}}}). The fact can be historical, futuristic, or purely fantastical. Make it sound specific and intriguing. Do NOT mention the color name or hex code in your response.

Examples for the color 'Galactic Indigo':
- "In the year 3057, this shade was used for all emergency alerts broadcast by the Interstellar Embassy."
- "Medieval alchemists believed this color was powdered starlight, captured only on moonless nights."
- "Ancient cartographers used this pigment to draw the edges of the known world on their maps."

Color Name: {{{colorName}}}
Hex Code: {{{colorHex}}}

Generate a new, unique fact in a similar style about the provided color.
`,
});

const generateColorHistoryFlow = ai.defineFlow(
  {
    name: 'generateColorHistoryFlow',
    inputSchema: GenerateColorHistoryInputSchema,
    outputSchema: GenerateColorHistoryOutputSchema,
  },
  async (input) => {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const { output } = await prompt(input);
        if (output) {
          return output;
        }
      } catch (error: any) {
        lastError = error;
        console.warn(
          `Attempt ${i + 1} of ${maxRetries} failed for generateColorHistoryFlow. Retrying in ${i + 1}s...`
        );
        if (i < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }

    if (lastError) {
        throw lastError;
    }

    throw new Error('Failed to generate color history after multiple retries.');
  }
);
