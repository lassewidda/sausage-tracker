import Anthropic from '@anthropic-ai/sdk'
import type { AnalysisResult } from '@/types'

const SAUSAGE_SYSTEM_PROMPT = `You are a precise food analysis assistant specialized in identifying sausages in meal photographs. Your task is to count sausages and respond with valid JSON only.

A "sausage" includes: bratwurst, frankfurters, hot dogs, chorizo, merguez, breakfast sausages, chipolatas, weisswurst, bangers, and any similar cylindrical cased meat product. Do NOT count meatballs, nuggets, or other non-sausage items.

Always respond with ONLY a JSON object in this exact format, no other text, no markdown:
{"count":<integer>,"description":"<one sentence describing the meal and sausages>","confidence":"<high|medium|low>","sausage_types":["<type>"]}

If you cannot determine whether sausages are present, set count to 0 and confidence to "low".`

let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

export async function rewriteDescriptionForCount(
  description: string,
  oldCount: number,
  newCount: number,
): Promise<string> {
  const client = getClient()

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 128,
    messages: [
      {
        role: 'user',
        content: `The following meal description was written assuming there are ${oldCount} sausage(s): "${description}"\n\nRewrite ONLY that sentence so it correctly says there are ${newCount} sausage(s) instead. Return just the rewritten sentence, nothing else.`,
      },
    ],
  })

  const textBlock = message.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') return description
  return textBlock.text.trim()
}

export async function analyzeSausages(imageUrl: string): Promise<AnalysisResult> {
  const client = getClient()

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    system: SAUSAGE_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'url',
              url: imageUrl,
            },
          },
          {
            type: 'text',
            text: 'Count the sausages in this meal photo and respond with JSON only.',
          },
        ],
      },
    ],
  })

  const textBlock = message.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  // Strip markdown code fences defensively
  const cleaned = textBlock.text
    .replace(/^```(?:json)?\n?/, '')
    .replace(/\n?```$/, '')
    .trim()

  const parsed = JSON.parse(cleaned) as {
    count: number
    description: string
    confidence: string
    sausage_types: string[]
  }

  return {
    count: Math.max(0, Math.round(Number(parsed.count) || 0)),
    description: parsed.description || '',
    confidence: (['high', 'medium', 'low'].includes(parsed.confidence)
      ? parsed.confidence
      : 'low') as AnalysisResult['confidence'],
    sausageTypes: Array.isArray(parsed.sausage_types) ? parsed.sausage_types : [],
  }
}
