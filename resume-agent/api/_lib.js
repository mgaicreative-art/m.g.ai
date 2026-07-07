// Shared helpers for the serverless functions.
// Files prefixed with `_` are not exposed as HTTP routes by Vercel.
import Anthropic from '@anthropic-ai/sdk'

// Model is read from the environment so it can be swapped without code changes.
export const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5'

let _client = null
export function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }
  if (!_client) _client = new Anthropic() // reads ANTHROPIC_API_KEY from env
  return _client
}

// Read a JSON body regardless of whether Vercel already parsed it.
export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

// Collect all text blocks from a Claude response.
export function textOf(response) {
  return (response.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim()
}

// Robustly pull a JSON value out of a model's text answer.
export function extractJSON(text) {
  if (!text) return null
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    // Fall back to the first {...} or [...] block.
    const match = cleaned.match(/[[{][\s\S]*[\]}]/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {
        return null
      }
    }
    return null
  }
}

export function sendError(res, status, message) {
  res.status(status).json({ error: message })
}
