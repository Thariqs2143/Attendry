
'use server';
/**
 * @fileOverview An AI flow for verifying if two faces belong to the same person.
 *
 * - verifyFace - A function that handles the face verification process.
 * - VerifyFaceInput - The input type for the verifyFace function.
 * - VerifyFaceOutput - The return type for the verifyFace function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VerifyFaceInputSchema = z.object({
  capturedPhotoDataUri: z
    .string()
    .describe(
      "A photo of a person captured live, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  referencePhotoUrl: z.string().url().describe('A reference profile photo of the person, as a public URL.'),
});
export type VerifyFaceInput = z.infer<typeof VerifyFaceInputSchema>;

const VerifyFaceOutputSchema = z.object({
  isSamePerson: z.boolean().describe('Whether or not the two faces belong to the same person.'),
  reasoning: z.string().describe('A brief explanation for the decision.'),
});
export type VerifyFaceOutput = z.infer<typeof VerifyFaceOutputSchema>;

export async function verifyFace(input: VerifyFaceInput): Promise<VerifyFaceOutput> {
  return verifyFaceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyFacePrompt',
  input: { schema: VerifyFaceInputSchema },
  output: { schema: VerifyFaceOutputSchema },
  prompt: `You are an expert face recognition system. Your task is to determine if the two images provided show the same person.

Analyze the key facial features in both images: the captured photo and the reference photo. Compare features like eye shape and distance, nose structure, and jawline. Account for minor variations in lighting, angle, and expression.

Based on your comparison, decide if they are the same person and set the 'isSamePerson' field to true or false. Provide a very brief, one-sentence reasoning for your decision. While security is important, aim for a reliable match rather than being overly strict. If features are generally consistent, lean towards a match.

Captured Photo:
{{media url=capturedPhotoDataUri}}

Reference Photo:
{{media url=referencePhotoUrl}}`,
});

const verifyFaceFlow = ai.defineFlow(
  {
    name: 'verifyFaceFlow',
    inputSchema: VerifyFaceInputSchema,
    outputSchema: VerifyFaceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
