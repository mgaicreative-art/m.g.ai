import { useState, useEffect } from 'react'

// ── Theme ────────────────────────────────────────────────────────
const t = {
  bg: '#0B1020', surface: '#141B2E', card: '#1B2540', accent: '#6366F1',
  accent2: '#22D3EE', green: '#34D399', red: '#F87171', gold: '#FBBF24',
  text: '#F1F5F9', muted: '#94A3B8', dim: '#64748B', border: '#2A3550',
}
const s = {
  app: { fontFamily: "'Assistant','Heebo','Segoe UI',sans-serif", direction: 'rtl', background: t.bg, color: t.text, minHeight: '100vh' },
  wrap: { maxWidth: 760, margin: '0 auto', padding: '20px 16px 80px' },
  card: { background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: 18, marginBottom: 14 },
  h1: { fontSize: 24, fontWeight: 800, margin: '0 0 4px' },
  sub: { color: t.muted, fontSize: 14, marginBottom: 20 },
  label: { fontSize: 12, color: t.muted, marginBottom: 4, display: 'block' },
  input: { width: '100%', background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 12px', color: t.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  ta: { width: '100%', background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 12px', color: t.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 },
  btn: (v = 'primary', disabled) => ({
    background: disabled ? t.border : v === 'primary' ? t.accent : v === 'green' ? t.green : 'transparent',
    color: v === 'outline' ? t.accent : disabled ? t.dim : v === 'green' ? '#062018' : '#fff',
    border: v === 'outline' ? `1px solid ${t.accent}` : 'none',
    borderRadius: 10, padding: '11px 18px', fontSize: 14, fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center',
  }),
  chip: { display: 'inline-block', background: t.accent + '22', color: t.accent2, borderRadius: 8, padding: '3px 10px', fontSize: 12, margin: '0 0 6px 6px' },
  badge: (c) => ({ display: 'inline-block', background: c + '22', color: c, borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 700 }),
  step: (active, done) => ({ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: 700, color: active ? t.accent2 : done ? t.green : t.dim, paddingBottom: 8, borderBottom: `2px solid ${active ? t.accent : done ? t.green : t.border}` }),
}

const STEPS = ['העלאה', 'פרופיל', 'חיפוש', 'אישור ושליחה', 'מעקב']

// ── API helpers ──────────────────────────────────────────────────
async function api(path, payload) {
  const res = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `שגיאה (${res.status})`)
  return data
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── App ──────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0)
  const [cv, setCv] = useState(null) // { base64, mediaType, filename, text }
  const [profile, setProfile] = useState(null)
  const [preferences, setPreferences] = useState('')
  const [jobs, setJobs] = useState([])
  const [drafts, setDrafts] = useState({}) // jobId -> {subject, body, status}
  const [sent, setSent] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sent') || '[]') } catch { return [] }
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { localStorage.setItem('sent', JSON.stringify(sent)) }, [sent])

  const run = async (fn) => {
    setError(''); setBusy(true)
    try { await fn() } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  // Step 1 — upload & parse
  const onFile = (file) => run(async () => {
    if (!file) return
    const isText = file.type.startsWith('text/') || file.name.endsWith('.txt')
    const rec = { filename: file.name, mediaType: file.type }
    let payload
    if (isText) {
      const text = await file.text()
      rec.text = text
      payload = { text }
    } else {
      const base64 = await fileToBase64(file)
      rec.base64 = base64
      payload = { fileBase64: base64, mediaType: file.type }
    }
    const { profile } = await api('parse-cv', payload)
    setCv(rec)
    setProfile(profile)
    setPreferences(profile.location ? `אזור: ${profile.location}` : '')
    setStep(1)
  })

  // Step 3 — search jobs
  const search = () => run(async () => {
    const { jobs } = await api('find-jobs', { profile, preferences })
    setJobs(jobs.map((j, i) => ({ ...j, id: i, selected: !!j.email })))
    setStep(3)
  })

  // Draft an email for a selected job
  const draftFor = (job) => run(async () => {
    const { draft } = await api('draft-email', { profile, job })
    setDrafts((d) => ({ ...d, [job.id]: { ...draft, status: 'draft' } }))
  })

  const sendFor = (job) => run(async () => {
    const draft = drafts[job.id]
    await api('send-email', {
      to: job.email,
      subject: draft.subject,
      body: draft.body,
      cvBase64: cv.base64 || null,
      cvFilename: cv.filename,
    })
    setDrafts((d) => ({ ...d, [job.id]: { ...d[job.id], status: 'sent' } }))
    setSent((prev) => [{ company: job.company, role: job.role, email: job.email, at: new Date().toISOString() }, ...prev])
  })

  return (
    <div style={s.app}>
      <div style={s.wrap}>
        <div style={s.h1}>🎯 סוכן קורות חיים חכם</div>
        <div style={s.sub}>מנתח את הקו"ח, מוצא משרות, כותב מייל מותאם — ואתה מאשר לפני שליחה.</div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          {STEPS.map((label, i) => (
            <div key={label} style={s.step(i === step, i < step)}>{label}</div>
          ))}
        </div>

        {error && (
          <div style={{ ...s.card, borderColor: t.red, color: t.red, fontSize: 13 }}>⚠️ {error}</div>
        )}

        {step === 0 && <UploadStep onFile={onFile} busy={busy} />}
        {step === 1 && profile && (
          <ProfileStep profile={profile} setProfile={setProfile} preferences={preferences} setPreferences={setPreferences} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <SearchStep profile={profile} busy={busy} onSearch={search} onBack={() => setStep(1)} />
        )}
        {step === 3 && (
          <ReviewStep
            jobs={jobs} setJobs={setJobs} drafts={drafts} setDrafts={setDrafts}
            busy={busy} draftFor={draftFor} sendFor={sendFor}
            onDone={() => setStep(4)} onBack={() => setStep(2)}
          />
        )}
        {step === 4 && <TrackingStep sent={sent} onRestart={() => setStep(2)} />}
      </div>
    </div>
  )
}

// ── Steps ────────────────────────────────────────────────────────
function UploadStep({ onFile, busy }) {
  return (
    <div style={s.card}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>העלה קורות חיים</div>
      <div style={{ color: t.muted, fontSize: 13, marginBottom: 14 }}>PDF, תמונה או קובץ טקסט. הסוכן ינתח ויבנה פרופיל.</div>
      <label style={{ ...s.btn('primary', busy), width: '100%' }}>
        {busy ? '⏳ מנתח...' : '📄 בחר קובץ קורות חיים'}
        <input type="file" accept=".pdf,.png,.jpg,.jpeg,.txt,.md,application/pdf,image/*,text/plain" hidden disabled={busy}
          onChange={(e) => onFile(e.target.files[0])} />
      </label>
    </div>
  )
}

function ProfileStep({ profile, setProfile, preferences, setPreferences, onNext }) {
  const set = (k, v) => setProfile((p) => ({ ...p, [k]: v }))
  const fields = [['name', 'שם'], ['title', 'כותרת מקצועית'], ['email', 'אימייל'], ['phone', 'טלפון'], ['location', 'מיקום']]
  return (
    <div style={s.card}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>הפרופיל שלך</div>
      <div style={{ color: t.muted, fontSize: 13, marginBottom: 14 }}>עבור ותקן במידת הצורך לפני החיפוש.</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {fields.map(([k, l]) => (
          <div key={k}>
            <label style={s.label}>{l}</label>
            <input style={s.input} value={profile[k] || ''} onChange={(e) => set(k, e.target.value)} />
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={s.label}>כישורים</label>
        <div>{(profile.skills || []).map((sk) => <span key={sk} style={s.chip}>{sk}</span>)}</div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={s.label}>העדפות חיפוש (תפקידים, אזור, סוג משרה...)</label>
        <textarea style={s.ta} rows={3} value={preferences} onChange={(e) => setPreferences(e.target.value)} />
      </div>
      <button style={s.btn('primary')} onClick={onNext}>המשך לחיפוש ←</button>
    </div>
  )
}

function SearchStep({ profile, busy, onSearch, onBack }) {
  return (
    <div style={s.card}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>חיפוש משרות רלוונטיות 🔎</div>
      <div style={{ color: t.muted, fontSize: 13, marginBottom: 14 }}>
        הסוכן יחפש באינטרנט משרות פתוחות המתאימות ל<b style={{ color: t.text }}> {(profile.roles || [profile.title]).join(', ')}</b> וינסה למצוא כתובת מייל להגשה לכל חברה. זה עשוי לקחת עד דקה.
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={s.btn('primary', busy)} disabled={busy} onClick={onSearch}>{busy ? '⏳ מחפש...' : '🚀 התחל חיפוש'}</button>
        <button style={s.btn('outline')} onClick={onBack}>→ חזרה</button>
      </div>
    </div>
  )
}

function ReviewStep({ jobs, setJobs, drafts, setDrafts, busy, draftFor, sendFor, onDone, onBack }) {
  const setDraftField = (id, k, v) => setDrafts((d) => ({ ...d, [id]: { ...d[id], [k]: v } }))
  if (!jobs.length) {
    return (
      <div style={s.card}>
        <div style={{ color: t.muted }}>לא נמצאו משרות. נסה לשנות את העדפות החיפוש.</div>
        <button style={{ ...s.btn('outline'), marginTop: 12 }} onClick={onBack}>→ חזרה לחיפוש</button>
      </div>
    )
  }
  return (
    <div>
      <div style={{ ...s.sub, marginBottom: 10 }}>נמצאו {jobs.length} משרות. לכל אחת: כתוב מייל, עבור/ערוך, ואשר שליחה.</div>
      {jobs.map((job) => {
        const draft = drafts[job.id]
        return (
          <div key={job.id} style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{job.role}</div>
                <div style={{ color: t.accent2, fontSize: 13 }}>{job.company} • {job.location}</div>
                <div style={{ color: t.muted, fontSize: 12, marginTop: 4 }}>{job.reason}</div>
              </div>
              {draft?.status === 'sent'
                ? <span style={s.badge(t.green)}>✓ נשלח</span>
                : job.email
                  ? <span style={s.badge(t.accent)}>{job.email}</span>
                  : <span style={s.badge(t.gold)}>אין מייל</span>}
            </div>
            {job.url && <a href={job.url} target="_blank" rel="noreferrer" style={{ color: t.dim, fontSize: 12 }}>{job.url}</a>}

            {draft?.status !== 'sent' && (
              <div style={{ marginTop: 12 }}>
                {!draft ? (
                  <button style={s.btn('outline', busy)} disabled={busy} onClick={() => draftFor(job)}>
                    ✍️ כתוב מייל מותאם
                  </button>
                ) : (
                  <div>
                    <label style={s.label}>נושא</label>
                    <input style={{ ...s.input, marginBottom: 8 }} value={draft.subject} onChange={(e) => setDraftField(job.id, 'subject', e.target.value)} />
                    <label style={s.label}>גוף המייל (ניתן לעריכה)</label>
                    <textarea style={s.ta} rows={8} value={draft.body} onChange={(e) => setDraftField(job.id, 'body', e.target.value)} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      {job.email ? (
                        <button style={s.btn('green', busy)} disabled={busy} onClick={() => sendFor(job)}>✅ אשר ושלח</button>
                      ) : (
                        <span style={{ color: t.gold, fontSize: 12, alignSelf: 'center' }}>
                          לא נמצאה כתובת מייל — העתק את הטקסט והגש ידנית דרך {job.url ? 'הקישור' : 'אתר החברה'}.
                        </span>
                      )}
                      <button style={s.btn('outline', busy)} disabled={busy} onClick={() => draftFor(job)}>🔄 נסח מחדש</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button style={s.btn('primary')} onClick={onDone}>📊 מעבר למעקב</button>
        <button style={s.btn('outline')} onClick={onBack}>→ חיפוש חדש</button>
      </div>
    </div>
  )
}

function TrackingStep({ sent, onRestart }) {
  return (
    <div>
      <div style={s.card}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>מעקב שליחות 📊</div>
        <div style={{ color: t.muted, fontSize: 13 }}>{sent.length} מיילים נשלחו.</div>
      </div>
      {sent.length === 0 && <div style={{ ...s.card, color: t.muted }}>עוד לא נשלחו מיילים.</div>}
      {sent.map((r, i) => (
        <div key={i} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600 }}>{r.role} — {r.company}</div>
            <div style={{ color: t.muted, fontSize: 12 }}>{r.email}</div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <span style={s.badge(t.green)}>נשלח</span>
            <div style={{ color: t.dim, fontSize: 11, marginTop: 4 }}>{new Date(r.at).toLocaleString('he-IL')}</div>
          </div>
        </div>
      ))}
      <button style={{ ...s.btn('primary'), marginTop: 4 }} onClick={onRestart}>🔎 חיפוש משרות נוסף</button>
    </div>
  )
}
