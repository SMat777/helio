import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../ui/AppShell'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { SectionHead } from '../ui/SectionHead'
import { RiskScore } from '../ui/RiskScore'
import { riskBand, riskColor } from '../lib/risk'
import { fmtMoneyM } from '../lib/format'
import { useSuppliersQuery, useAddSupplier } from '../lib/data/suppliersRepo'
import type { Segment, Tier, Supplier } from '../lib/types'

const SEGMENTS: { value: Segment; sub: string }[] = [
  { value: 'Strategic', sub: 'High spend · High risk' },
  { value: 'Bottleneck', sub: 'Low spend · High risk' },
  { value: 'Leverage', sub: 'High spend · Low risk' },
  { value: 'Routine', sub: 'Low spend · Low risk' },
]
const TIERS: Tier[] = [1, 2, 3]

// A flat-ish 12-point risk history seeded from the scorecard, so a new supplier
// renders a plausible sparkline instead of an empty one.
function makeTrend(scorecard: number): number[] {
  return Array.from({ length: 12 }, (_, i) =>
    Math.min(100, Math.max(0, Math.round(scorecard - (6 - i) * 0.2))),
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-3">{label}</div>
      {children}
      {hint && <div className="mt-1 text-[11px] text-ink-4">{hint}</div>}
    </label>
  )
}

const inputCls =
  'w-full rounded-md border border-line bg-card px-2.5 py-[7px] font-sans text-[13px] text-ink outline-none placeholder:text-ink-4 focus:border-line-3'
const numCls = `${inputCls} font-mono tabular-nums`

type Flash = { kind: 'err'; msg: string } | null

export function NewSupplier() {
  const navigate = useNavigate()
  const { data: all = [] } = useSuppliersQuery()
  const addMut = useAddSupplier()

  const categories = useMemo(() => [...new Set(all.map((s) => s.category))].sort(), [all])
  const countries = useMemo(() => [...new Set(all.map((s) => s.country))].sort(), [all])

  // Next free SUP-NNN id, derived from the active source (Supabase or mock).
  const nextId = useMemo(() => {
    const max = all.reduce((m, s) => {
      const n = parseInt(s.id.replace(/\D/g, ''), 10)
      return Number.isFinite(n) ? Math.max(m, n) : m
    }, 0)
    return `SUP-${max + 1}`
  }, [all])

  const [name, setName] = useState('')
  // Category/country default to the first option until the user picks one — the
  // list arrives async, so we derive the effective value instead of seeding state.
  const [categoryPick, setCategoryPick] = useState('')
  const [countryPick, setCountryPick] = useState('')
  const category = categoryPick || categories[0] || ''
  const country = countryPick || countries[0] || 'DE'
  const [segment, setSegment] = useState<Segment>('Strategic')
  const [tier, setTier] = useState<Tier>(1)
  const [riskScore, setRiskScore] = useState(45)
  const [scorecard, setScorecard] = useState(80)
  const [onTimePct, setOnTimePct] = useState(95)
  const [qualityPct, setQualityPct] = useState(90)
  const [spendEur, setSpendEur] = useState(1_000_000)
  const [flash, setFlash] = useState<Flash>(null)

  const band = riskBand(riskScore)
  const color = riskColor(riskScore)

  function create() {
    if (!name.trim()) {
      setFlash({ kind: 'err', msg: 'Add a supplier name before creating' })
      return
    }
    const id = nextId
    const supplier: Supplier = {
      id,
      name: name.trim(),
      country,
      category,
      segment,
      tier,
      scorecard,
      riskScore,
      onTimePct,
      qualityPct,
      ncrs: 0,
      spend: fmtMoneyM(spendEur),
      spendEur,
      trend: makeTrend(scorecard),
    }
    addMut.mutate(supplier, { onSuccess: () => navigate(`/suppliers/${id}`) })
  }

  return (
    <AppShell
      slim
      crumb={
        <>
          <b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp; Suppliers &nbsp;/&nbsp; New
        </>
      }
      actions={
        <>
          <Button variant="ghost" onClick={() => navigate('/suppliers')}>Cancel</Button>
          <Button variant="primary" onClick={create}>
            <Icon name="plus" /> Create supplier
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-[1fr_300px] items-start">
        {/* ── Document column ── */}
        <div className="mx-auto w-full max-w-[720px] px-16 pt-12 pb-16">
          <div className="mb-3.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-3">
            New supplier · {nextId}
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Supplier name"
            className="m-0 mb-8 w-full bg-transparent font-serif text-[40px] font-semibold leading-[1.08] tracking-[-0.02em] text-ink outline-none placeholder:text-ink-4"
          />

          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Field label="Category">
              <select value={category} onChange={(e) => setCategoryPick(e.target.value)} className={inputCls}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Country">
              <select value={country} onChange={(e) => setCountryPick(e.target.value)} className={inputCls}>
                {countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Risk score" hint="0–100 · drives the band">
              <input type="number" min={0} max={100} value={riskScore}
                onChange={(e) => setRiskScore(clamp(e.target.value))} className={numCls} />
            </Field>
            <Field label="Scorecard" hint="0–100 composite">
              <input type="number" min={0} max={100} value={scorecard}
                onChange={(e) => setScorecard(clamp(e.target.value))} className={numCls} />
            </Field>

            <Field label="On-time %">
              <input type="number" min={0} max={100} step={0.1} value={onTimePct}
                onChange={(e) => setOnTimePct(clamp(e.target.value))} className={numCls} />
            </Field>
            <Field label="Quality %">
              <input type="number" min={0} max={100} value={qualityPct}
                onChange={(e) => setQualityPct(clamp(e.target.value))} className={numCls} />
            </Field>

            <Field label="Annual spend (€)" hint={`Shows as ${fmtMoneyM(spendEur)}`}>
              <input type="number" min={0} step={100_000} value={spendEur}
                onChange={(e) => setSpendEur(Math.max(0, Number(e.target.value) || 0))} className={numCls} />
            </Field>
          </div>
        </div>

        {/* ── Right rail (sticky) ── */}
        <aside className="sticky top-0 flex flex-col gap-6 self-start border-l border-line bg-paper-2 px-6 pt-11 pb-10">
          <div>
            <SectionHead>Risk preview</SectionHead>
            <div className="flex items-end gap-3">
              <span className="font-serif text-[44px] font-bold leading-none tabular-nums" style={{ color }}>
                {riskScore}
              </span>
              <span className="mb-1 text-[13px] font-semibold" style={{ color }}>{band}</span>
            </div>
            <div className="mt-3"><RiskScore score={riskScore} /></div>
          </div>

          <div>
            <SectionHead>Segment</SectionHead>
            <div className="flex flex-col gap-1.5">
              {SEGMENTS.map(({ value, sub }) => {
                const active = value === segment
                return (
                  <button key={value} type="button" onClick={() => setSegment(value)}
                    className={`flex flex-col rounded-[7px] border px-2.5 py-1.5 text-left ${
                      active ? 'border-line bg-card' : 'border-transparent hover:bg-hover'
                    }`}>
                    <span className={`text-[13px] ${active ? 'font-medium text-ink' : 'text-ink-2'}`}>{value}</span>
                    <span className="font-mono text-[10px] text-ink-3">{sub}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <SectionHead>Tier</SectionHead>
            <div className="flex gap-1.5">
              {TIERS.map((t) => (
                <button key={t} type="button" onClick={() => setTier(t)}
                  className={`flex-1 rounded-md border py-1.5 font-mono text-[12px] ${
                    t === tier ? 'border-ink bg-ink text-white' : 'border-line bg-card text-ink-2 hover:bg-hover'
                  }`}>
                  T{t}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {flash && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-bad bg-card px-3.5 py-2.5 text-[13px] font-medium text-bad shadow-[0_8px_24px_-8px_rgba(40,30,20,0.3)]">
          <Icon name="warn" size={15} />
          {flash.msg}
        </div>
      )}
    </AppShell>
  )
}

// Clamp a numeric input string into 0..100.
function clamp(v: string): number {
  return Math.min(100, Math.max(0, Number(v) || 0))
}

export default NewSupplier
