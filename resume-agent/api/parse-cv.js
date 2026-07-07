// POST /api/parse-cv
// Body: { fileBase64, mediaType, text }  (send either a PDF/image base64 OR plain text)
// Returns a structured candidate profile extracted from the résumé.
import { getClient, MODEL, readJson, textOf, extractJSON, sendError } from './_lib.js'

const SYSTEM = `אתה עוזר גיוס. חלץ מקורות החיים פרופיל מובנה של המועמד.
ענה אך ורק ב-JSON תקין (ללא טקסט נוסף, ללא markdown) במבנה הבא:
{
  "name": "שם מלא",
  "title": "תפקיד/כותרת מקצועית",
  "email": "אימייל",
  "phone": "טלפון",
  "location": "עיר/אזור",
  "summary": "תקציר קצר של 1-2 משפטים",
  "seniority": "junior|mid|senior|lead",
  "experienceYears": 0,
  "skills": ["כישור1", "כישור2"],
  "roles": ["תפקיד רלוונטי לחיפוש 1", "תפקיד רלוונטי 2"],
  "industries": ["תעשייה1"],
  "languages": ["עברית", "אנגלית"]
}
אם שדה חסר, החזר מחרוזת ריקה או מערך ריק. שמור על השפה של קורות החיים.`

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed')
  try {
    const { fileBase64, mediaType, text } = await readJson(req)
    if (!fileBase64 && !text) return sendError(res, 400, 'Provide fileBase64 or text')

    const client = getClient()
    const content = []
    if (fileBase64) {
      if (mediaType === 'application/pdf') {
        content.push({
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: fileBase64 },
        })
      } else {
        content.push({
          type: 'image',
          source: { type: 'base64', media_type: mediaType || 'image/png', data: fileBase64 },
        })
      }
    }
    content.push({
      type: 'text',
      text: text
        ? `הפק פרופיל מקורות החיים הבאים:\n\n${text}`
        : 'הפק פרופיל מקובץ קורות החיים המצורף.',
    })

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: 'user', content }],
    })

    const profile = extractJSON(textOf(response))
    if (!profile) return sendError(res, 502, 'Could not parse profile from résumé')
    res.status(200).json({ profile })
  } catch (err) {
    console.error('parse-cv error', err)
    sendError(res, 500, err.message || 'Internal error')
  }
}
