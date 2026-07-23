/**
 * DeepSeek API server-side wrapper.
 * Generates English collection emails and rebuttals using the deepseek-v4-flash model.
 * Tier calculation is handled by lib/tier.ts — this module only generates text.
 *
 * NEVER import this file in Client Components.
 */
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: 'https://api.deepseek.com',
});

interface GenerateEmailParams {
  customerName: string;
  amountOwed: number;
  currentOverdueDays: number;
  roundNumber: number;
  tier: Tier;
  opponentResponse: string;
}

interface GenerateEmailResult {
  email: string;
  rebuttals: string[];
}

type Tier = 'R1' | 'R2' | 'R3';

const TIER_INSTRUCTIONS: Record<Tier, string> = {
  R1: 'Tone: polite and friendly reminder. The customer may have simply forgotten. Keep it light, helpful, and relationship-preserving.',
  R2: 'Tone: firm but cooperative. Express understanding of potential issues, but emphasize the need for resolution. Offer to work together on a payment plan if needed.',
  R3: 'Tone: urgent and final. This is a last notice before legal action. Be direct about consequences, mention potential legal steps, but remain professional.',
};

function buildSystemPrompt(tier: Tier, roundNumber: number): string {
  return `You are an AI assistant for ChaseWise, a debt collection platform for small businesses. Your task is to write a professional debt collection email in English.

${TIER_INSTRUCTIONS[tier]}

IMPORTANT RULES:
- Output ONLY in English. Never output Chinese or any other language.
- Address the recipient professionally.
- Reference the overdue amount and days overdue naturally in the body.
- This is round ${roundNumber} of communication.
- Do NOT include a subject line — only the email body.
- Sign off as "The ChaseWise Team" unless told otherwise.`;
}

function buildUserPrompt(params: GenerateEmailParams): string {
  return `Customer name: ${params.customerName}
Amount owed: $${params.amountOwed.toFixed(2)}
Days overdue: ${params.currentOverdueDays}
Communication round: ${params.roundNumber}
Tier: ${params.tier}
Their last response was: "${params.opponentResponse}"

Please generate:
1. A professional debt collection email body (no subject line)
2. Three short rebuttals (one sentence each) to use if the customer pushes back again

Format your response EXACTLY as follows:

---EMAIL---
[email body here]
---REBUTTALS---
1. [first rebuttal]
2. [second rebuttal]
3. [third rebuttal]`;
}

function parseResponse(raw: string): GenerateEmailResult {
  const emailMatch = raw.match(/---EMAIL---\s*([\s\S]*?)\s*---REBUTTALS---/);
  const email = emailMatch?.[1]?.trim() ?? '';

  const rebuttalsSection = raw.split('---REBUTTALS---')[1] ?? '';
  const rebuttalLines = rebuttalsSection
    .split('\n')
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter((line) => line.length > 0);

  const rebuttals = rebuttalLines.slice(0, 3);
  while (rebuttals.length < 3) {
    rebuttals.push('We look forward to resolving this matter promptly.');
  }

  return { email, rebuttals };
}

export async function generateEmail(params: GenerateEmailParams): Promise<GenerateEmailResult> {
  const systemPrompt = buildSystemPrompt(params.tier, params.roundNumber);
  const userPrompt = buildUserPrompt(params);

  const completion = await client.chat.completions.create({
    model: 'deepseek-v4-flash',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  const raw = completion.choices[0]?.message?.content ?? '';
  return parseResponse(raw);
}