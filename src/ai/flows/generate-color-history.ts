'use server';
/**
 * @fileOverview An AI agent for generating historical or present-day facts about a color.
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
  history: z.string().describe('A single, very concise, creative sentence (around 15-20 words) about the color. It must be a historical or present-day fact. It must be engaging and surprising.'),
});
export type GenerateColorHistoryOutput = z.infer<typeof GenerateColorHistoryOutputSchema>;

export async function generateColorHistory(input: GenerateColorHistoryInput): Promise<GenerateColorHistoryOutput> {
  return generateColorHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateColorHistoryPrompt',
  input: { schema: GenerateColorHistoryInputSchema },
  output: { schema: GenerateColorHistoryOutputSchema },
  prompt: `You are an expert cultural historian with a deep research algorithm for uncovering fascinating details about colors.

Your task is to generate ONE engaging, concise sentence (around 15-20 words) about the color '{{{colorName}}}' (hex: {{{colorHex}}}).

**Instructions:**
1.  The fact MUST be from the past (historical) or present day.
2.  **ABSOLUTELY NO futuristic or purely fantastical statements.**
3.  The fact should sound specific, plausible, and intriguing.
4.  Do NOT mention the color's name or hex code in your response.

**Good Examples (Past/Present Focus):**
- "Legend states Viking longboats were stained this deep hue to camouflage with the fjords."
- "Ancient cartographers used it to draw the edges of the known world on their maps."
- "In the Victorian era, this exact pigment was notoriously difficult to produce, making it a status symbol."

Color Name: {{{colorName}}}
Hex Code: {{{colorHex}}}

Generate a new, unique, and concise fact in a similar style about the provided color.
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
