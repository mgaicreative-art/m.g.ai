// POST /api/draft-email
// Body: { profile, job }
// Returns a tailored application email { subject, body } for one company.
import { getClient, MODEL, readJson, textOf, extractJSON, sendError } from './_lib.js'

const SYSTEM = `אתה כותב מכתבי הגשת מועמדות. כתוב מייל קצר, מקצועי ומותאם אישית
לחברה ולמשרה הספציפית, על בסיס פרופיל המועמד. אורך: 3-5 פסקאות קצרות.
טון: מקצועי, אנושי, לא מלאכותי. ציין שקורות החיים מצורפים.
ענה אך ורק ב-JSON תקין: {"subject": "נושא המייל", "body": "גוף המייל"}
שמור על שפת קורות החיים של המועמד.`

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed')
  try {
    const { profile, job } = await readJson(req)
    if (!profile || !job) return sendError(res, 400, 'Missing profile or job')

    const client = getClient()
    const prompt = `המועמד:
- שם: ${profile.name}
- כותרת: ${profile.title}
- תקציר: ${profile.summary}
- כישורים בולטים: ${(profile.skills || []).slice(0, 8).join(', ')}
- ותק: ${profile.experienceYears || '?'} שנים

המשרה:
- חברה: ${job.company}
- תפקיד: ${job.role}
- מיקום: ${job.location || ''}
- למה מתאים: ${job.reason || ''}

כתוב מייל הגשת מועמדות מותאם.`

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    })

    const draft = extractJSON(textOf(response))
    if (!draft || !draft.body) return sendError(res, 502, 'Could not draft email')
    res.status(200).json({ draft })
  } catch (err) {
    console.error('draft-email error', err)
    sendError(res, 500, err.message || 'Internal error')
  }
}
