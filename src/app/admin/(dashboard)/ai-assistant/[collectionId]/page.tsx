'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Check,
  X,
  Image as ImageIcon,
} from 'lucide-react'

type StepKind = 'text' | 'url' | 'number' | 'boolean' | 'array' | 'objectArray' | 'reference' | 'status'

interface StepOption {
  value: string
  label: string
}

interface ObjectArrayField {
  key: string
  label: string
  type: 'text' | 'number'
}

interface StepDef {
  key: string
  displayName: string
  kind: StepKind
  multiSelect: boolean
  options: StepOption[] | null
  skippable: boolean
  itemShape?: ObjectArrayField[]
}

type Phase = 'loading' | 'error' | 'intro' | 'edit' | 'done'

export default function AiAssistantPage() {
  const params = useParams<{ collectionId: string }>()
  const COLLECTION_ID = decodeURIComponent(params.collectionId)

  const [phase, setPhase] = useState<Phase>('loading')
  const [error, setError] = useState('')
  const [displayName, setDisplayName] = useState(COLLECTION_ID)
  const [steps, setSteps] = useState<StepDef[]>([])
  const [imageFields, setImageFields] = useState<{ key: string; displayName: string }[]>([])
  const [fields, setFields] = useState<Record<string, unknown>>({})

  const [introText, setIntroText] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [prefillNotice, setPrefillNotice] = useState('')

  const [arrayInputDrafts, setArrayInputDrafts] = useState<Record<string, string>>({})

  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState<{ id: string; warning?: string } | null>(null)

  const loadSteps = useCallback(async () => {
    setPhase('loading')
    setError('')
    try {
      const res = await fetch(`/api/admin/ai-assistant/steps?collectionId=${COLLECTION_ID}`)
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        displayName?: string
        steps?: StepDef[]
        imageFields?: { key: string; displayName: string }[]
        error?: string
      }
      if (!res.ok || !data.ok) {
        setError(data.error || 'Could not load the form.')
        setPhase('error')
        return
      }
      setDisplayName(data.displayName || COLLECTION_ID)
      setSteps(data.steps || [])
      setImageFields(data.imageFields || [])
      setPhase('intro')
    } catch {
      setError('Could not load the form. Please try again.')
      setPhase('error')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [COLLECTION_ID])

  useEffect(() => {
    loadSteps()
  }, [loadSteps])

  const setFieldValue = (key: string, value: unknown) => {
    setFields((prev) => {
      const next = { ...prev }
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) delete next[key]
      else next[key] = value
      return next
    })
  }

  const toggleArrayItem = (key: string, current: string[], value: string) => {
    const has = current.includes(value)
    setFieldValue(key, has ? current.filter((v) => v !== value) : [...current, value])
  }

  const startIntro = async (skip: boolean) => {
    if (skip || !introText.trim()) {
      setFields({})
      setPhase('edit')
      return
    }
    setExtracting(true)
    let prefilledCount = 0
    try {
      const res = await fetch('/api/admin/ai-assistant/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId: COLLECTION_ID, prompt: introText.trim() }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; fields?: Record<string, unknown> }
      if (data.ok && data.fields && Object.keys(data.fields).length) {
        // Only keep keys that are real steps, to avoid the model inventing one.
        const validKeys = new Set(steps.map((s) => s.key))
        const cleaned: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(data.fields)) {
          if (validKeys.has(k) && v !== '' && v != null && !(Array.isArray(v) && v.length === 0)) cleaned[k] = v
        }
        prefilledCount = Object.keys(cleaned).length
        setFields(cleaned)
      } else {
        setFields({})
      }
    } catch {
      setFields({})
      // Silent degrade — the form still works fine with nothing prefilled.
    } finally {
      setExtracting(false)
      setPrefillNotice(
        prefilledCount > 0
          ? `Drafted ${prefilledCount} field${prefilledCount === 1 ? '' : 's'} from your description — review and edit anything below before creating.`
          : ''
      )
      setPhase('edit')
    }
  }

  const confirmCreate = async () => {
    setCreating(true)
    setError('')
    try {
      const { __status, ...rest } = fields as Record<string, unknown> & { __status?: string }
      const res = await fetch('/api/admin/items/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId: COLLECTION_ID, fields: rest, status: __status || 'draft' }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; id?: string; warning?: string; error?: string }
      if (!res.ok || !data.ok) {
        setError(data.error || 'Failed to create item.')
        setCreating(false)
        return
      }
      setCreated({ id: data.id!, warning: data.warning })
      setPhase('done')
    } catch {
      setError('Failed to create item.')
    } finally {
      setCreating(false)
    }
  }

  const startOver = () => {
    setFields({})
    setIntroText('')
    setCreated(null)
    setError('')
    setPrefillNotice('')
    setPhase('intro')
  }

  const statusStep = steps.find((s) => s.kind === 'status')
  const fieldSteps = steps.filter((s) => s.kind !== 'status')

  return (
    <div className="px-6 sm:px-8 py-10 max-w-2xl">
      <Link href="/admin/ai-assistant" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 mb-4 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> All collections
      </Link>
      <div className="mb-1 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-brand-600" />
        <h1 className="text-2xl font-black text-slate-900">AI Assistant</h1>
      </div>
      <p className="text-sm text-slate-500 mb-8">
        Creating a new item in <span className="font-semibold text-slate-700">{displayName}</span>.
      </p>

      {phase === 'loading' && (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-16 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading form…
        </div>
      )}

      {phase === 'error' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button onClick={loadSteps} className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs">
            Retry
          </button>
        </div>
      )}

      {phase === 'intro' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <p className="text-sm text-slate-700">
            Tell me about the new {displayName.toLowerCase()} in a sentence or two. I&apos;ll draft as many fields as I can — using what you know it's
            about, not just your exact wording — then you&apos;ll review and edit everything before it&apos;s created.
          </p>
          <textarea
            value={introText}
            onChange={(e) => setIntroText(e.target.value)}
            placeholder={`e.g. Add a service called Product Development in the Software Development category`}
            rows={3}
            disabled={extracting}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition disabled:opacity-60"
          />
          <div className="flex gap-2">
            <button
              onClick={() => startIntro(false)}
              disabled={extracting || !introText.trim()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors disabled:opacity-40"
            >
              {extracting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {extracting ? 'Drafting…' : 'Continue'}
            </button>
            <button
              onClick={() => startIntro(true)}
              disabled={extracting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors disabled:opacity-40"
            >
              Skip, I&apos;ll fill it in myself
            </button>
          </div>
        </div>
      )}

      {phase === 'edit' && (
        <div className="space-y-4">
          {prefillNotice && (
            <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-2.5 text-xs font-medium text-brand-700 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 shrink-0" /> {prefillNotice}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
            {fieldSteps.map((s) => {
              const value = fields[s.key]
              return (
                <div key={s.key}>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{s.displayName}</label>

                  {(s.kind === 'text' || s.kind === 'url') && (
                    <input
                      type="text"
                      value={typeof value === 'string' ? value : ''}
                      onChange={(e) => setFieldValue(s.key, e.target.value)}
                      placeholder={s.kind === 'url' ? 'https://…' : `Enter ${s.displayName.toLowerCase()}…`}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                    />
                  )}

                  {s.kind === 'number' && (
                    <input
                      type="number"
                      value={typeof value === 'number' ? value : ''}
                      onChange={(e) => setFieldValue(s.key, e.target.value === '' ? undefined : Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                    />
                  )}

                  {s.kind === 'boolean' && (
                    <div className="flex gap-2">
                      {s.options!.map((opt) => {
                        const selected = value === (opt.value === 'true')
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setFieldValue(s.key, opt.value === 'true')}
                            className={`flex-1 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-colors ${
                              selected ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 text-slate-600 hover:border-brand-300'
                            }`}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {s.kind === 'array' && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(value) ? (value as string[]) : []).map((item, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
                            {item}
                            <button
                              onClick={() => setFieldValue(s.key, (value as string[]).filter((_, idx) => idx !== i))}
                              className="hover:text-brand-900"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={arrayInputDrafts[s.key] || ''}
                        onChange={(e) => setArrayInputDrafts((prev) => ({ ...prev, [s.key]: e.target.value }))}
                        onKeyDown={(e) => {
                          const draft = (arrayInputDrafts[s.key] || '').trim()
                          if (e.key === 'Enter' && draft) {
                            e.preventDefault()
                            setFieldValue(s.key, [...(Array.isArray(value) ? (value as string[]) : []), draft])
                            setArrayInputDrafts((prev) => ({ ...prev, [s.key]: '' }))
                          }
                        }}
                        placeholder="Type a value and press Enter…"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                      />
                    </div>
                  )}

                  {s.kind === 'objectArray' && s.itemShape && (
                    <div className="space-y-2">
                      {(Array.isArray(value) ? (value as Record<string, unknown>[]) : []).map((row, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            {s.itemShape!.map((f) => (
                              <input
                                key={f.key}
                                type={f.type === 'number' ? 'number' : 'text'}
                                value={typeof row[f.key] === 'string' || typeof row[f.key] === 'number' ? String(row[f.key]) : ''}
                                onChange={(e) => {
                                  const rows = [...(Array.isArray(value) ? (value as Record<string, unknown>[]) : [])]
                                  rows[i] = { ...rows[i], [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }
                                  setFieldValue(s.key, rows)
                                }}
                                placeholder={f.label}
                                className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                              />
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              const rows = (Array.isArray(value) ? (value as Record<string, unknown>[]) : []).filter((_, idx) => idx !== i)
                              setFieldValue(s.key, rows)
                            }}
                            className="text-slate-400 hover:text-red-500 shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const rows = Array.isArray(value) ? (value as Record<string, unknown>[]) : []
                          const blank = Object.fromEntries(s.itemShape!.map((f) => [f.key, f.type === 'number' ? 0 : '']))
                          setFieldValue(s.key, [...rows, blank])
                        }}
                        className="px-3 py-2 rounded-lg border border-dashed border-slate-300 text-slate-500 hover:border-brand-300 hover:text-brand-600 font-semibold text-xs transition-colors"
                      >
                        + Add {s.displayName.toLowerCase()} entry
                      </button>
                    </div>
                  )}

                  {s.kind === 'reference' && (
                    <div>
                      {s.options && s.options.length > 0 ? (
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                          {s.options.map((opt) => {
                            const current = Array.isArray(value) ? (value as string[]) : []
                            const selected = current.includes(opt.value)
                            return (
                              <button
                                key={opt.value}
                                onClick={() => toggleArrayItem(s.key, current, opt.value)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold transition-colors ${
                                  selected ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300'
                                }`}
                              >
                                {selected && <Check className="h-3 w-3" />}
                                {opt.label}
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No published {s.displayName.toLowerCase()} to link yet.</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {statusStep && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Status</label>
                <div className="flex gap-2">
                  {statusStep.options!.map((opt) => {
                    const selected = fields.__status === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setFieldValue('__status', opt.value)}
                        className={`flex-1 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-colors ${
                          selected ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 text-slate-600 hover:border-brand-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {imageFields.length > 0 && (
              <p className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2.5">
                <ImageIcon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                Image fields ({imageFields.map((f) => f.displayName).join(', ')}) can&apos;t be set here — add them in Wix after creating.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={confirmCreate}
              disabled={creating}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors disabled:opacity-60"
            >
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {creating ? 'Creating…' : 'Confirm & Create'}
            </button>
            <button
              onClick={startOver}
              disabled={creating}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-white transition-colors"
            >
              Start Over
            </button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}

      {phase === 'done' && created && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <p className="font-bold text-slate-900 text-sm">Created in {displayName}</p>
          <p className="text-xs text-slate-500 mt-1">Item ID: {created.id}</p>
          {created.warning && <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-3 text-left">{created.warning}</p>}
          <button
            onClick={startOver}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-white transition-colors"
          >
            Create another
          </button>
        </div>
      )}
    </div>
  )
}
