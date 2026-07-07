// POST /api/find-jobs
// Body: { profile, preferences }
// Uses Claude's server-side web_search tool to find relevant open positions
// and, where possible, the company's application email.
import { getClient, MODEL, readJson, textOf, extractJSON, sendError } from './_lib.js'

export const config = { maxDuration: 60 }

const SYSTEM = `אתה סוכן חיפוש עבודה. חפש באינטרנט משרות פתוחות ורלוונטיות למועמד.
לכל משרה נסה למצוא את כתובת המייל להגשת מועמדות (לרוב career@ / jobs@ / hr@ באתר החברה).
ענה אך ורק ב-JSON תקין: מערך של אובייקטים במבנה:
[{
  "company": "שם החברה",
  "role": "שם המשרה",
  "location": "מיקום",
  "email": "כתובת מייל להגשה או null אם לא נמצאה",
  "url": "קישור למשרה/דף קריירה",
  "reason": "משפט קצר למה זה מתאים למועמד",
  "source": "מאיפה נמצא המידע"
}]
החזר עד 10 משרות. אל תמציא כתובות מייל — אם לא מצאת, החזר null.`

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed')
  try {
    const { profile, preferences } = await readJson(req)
    if (!profile) return sendError(res, 400, 'Missing profile')

    const client = getClient()
    const prompt = `פרופיל המועמד:
- תפקידים מבוקשים: ${(profile.roles || []).join(', ') || profile.title}
- ותק: ${profile.experienceYears || '?'} שנים (${profile.seniority || 'לא ידוע'})
- כישורים: ${(profile.skills || []).join(', ')}
- תעשיות: ${(profile.industries || []).join(', ')}
- מיקום מועדף: ${profile.location || 'גמיש'}
- העדפות נוספות: ${preferences || 'אין'}

חפש משרות פתוחות רלוונטיות ונסה למצוא כתובת מייל להגשה לכל חברה.`

    const tools = [{ type: 'web_search_20260209', name: 'web_search', max_uses: 8 }]
    let messages = [{ role: 'user', content: prompt }]
    let response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM,
      tools,
      messages,
    })

    // The web_search tool runs a server-side loop; resume on pause_turn.
    let guard = 0
    while (response.stop_reason === 'pause_turn' && guard++ < 6) {
      messages.push({ role: 'assistant', content: response.content })
      response = await client.messages.create({
        model: MODEL,
        max_tokens: 8000,
        system: SYSTEM,
        tools,
        messages,
      })
    }

    const jobs = extractJSON(textOf(response))
    if (!Array.isArray(jobs)) return sendError(res, 502, 'Could not parse job results')
    res.status(200).json({ jobs })
  } catch (err) {
    console.error('find-jobs error', err)
    sendError(res, 500, err.message || 'Internal error')
  }
}
