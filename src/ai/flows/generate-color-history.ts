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

Generate ONE fun, single-sentence fact about the color provided. The fact can be historical, futuristic, or purely fantastical. Make it sound specific and intriguing.

Examples:
- "1327 BC, Nile River—Egyptians painted pyramids with your #C1A57B (Mud of Glory)."
- "Year 3057—Interstellar Embassy uses your #4B0082 (Galactic Indigo) for emergency alerts."
- "In medieval alchemy, #FFD700 (Gilded Sun) was believed to be powdered sunlight."

Color Name: {{{colorName}}}
Hex Code: {{{colorHex}}}

Generate a new, unique fact in a similar style.
`,
});

const generateColorHistoryFlow = ai.defineFlow(
  {
    name: 'generateColorHistoryFlow',
    inputSchema: GenerateColorHistoryInputSchema,
    outputSchema: GenerateColorHistoryOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
