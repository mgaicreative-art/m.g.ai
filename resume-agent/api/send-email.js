// POST /api/send-email
// Body: { to, subject, body, cvBase64, cvFilename }
// Sends one approved application email with the résumé attached, via Resend.
import { Resend } from 'resend'
import { readJson, sendError } from './_lib.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed')
  try {
    const { to, subject, body, cvBase64, cvFilename } = await readJson(req)
    if (!to || !subject || !body) return sendError(res, 400, 'Missing to/subject/body')
    if (!process.env.RESEND_API_KEY) return sendError(res, 500, 'RESEND_API_KEY not configured')
    if (!process.env.FROM_EMAIL) return sendError(res, 500, 'FROM_EMAIL not configured')

    const resend = new Resend(process.env.RESEND_API_KEY)
    const attachments = cvBase64
      ? [{ filename: cvFilename || 'cv.pdf', content: cvBase64 }]
      : undefined

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      text: body,
      attachments,
    })

    if (error) return sendError(res, 502, error.message || 'Send failed')
    res.status(200).json({ id: data?.id, sent: true })
  } catch (err) {
    console.error('send-email error', err)
    sendError(res, 500, err.message || 'Internal error')
  }
}
