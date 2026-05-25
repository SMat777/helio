import { useEffect, useRef, useState } from 'react'
import { AppShell } from '../ui/AppShell'
import { Button } from '../ui/Button'
import { Flag } from '../ui/Flag'
import { SectionHead } from '../ui/SectionHead'
import { Pill, type PillTone } from '../ui/Pill'
import { Icon } from '../ui/Icon'
import { getNcr, type Ncr } from '../lib/data'

// Severity model maps the domain enum → semantic pill tones (kilde: V5SeverityList).
const SEVERITIES: { value: Ncr['severity']; label: string; tone: PillTone }[] = [
  { value: 'critical', label: 'Critical', tone: 'bad' },
  { value: 'major', label: 'Major', tone: 'warn' },
  { value: 'minor', label: 'Minor', tone: 'good' },
]

const eur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function SupplierChip({ ncr }: { ncr: Ncr }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-line bg-paper py-[7px] pr-3 pl-2.5">
      <span className="grid h-[22px] w-[22px] place-items-center rounded border border-line bg-paper-2 font-serif text-[13px] text-ink-2">
        {ncr.supplierName.charAt(0)}
      </span>
      <div>
        <div className="text-[13px] font-medium leading-none">{ncr.supplierName}</div>
        <div className="mt-0.5 flex items-center font-mono text-[10.5px] text-ink-3">
          <Flag code={ncr.country} />
          {ncr.id} · {ncr.segment}
        </div>
      </div>
    </div>
  )
}

function SeverityList({ value, onSelect }: { value: Ncr['severity']; onSelect: (v: Ncr['severity']) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      {SEVERITIES.map(({ value: v, label, tone }) => {
        const active = v === value
        return (
          <button
            key={v}
            type="button"
            onClick={() => onSelect(v)}
            className={`flex cursor-pointer items-center gap-2.5 rounded-[7px] border px-2.5 py-1.5 text-left text-[13px] ${
              active ? 'border-line bg-card font-medium text-ink' : 'border-transparent text-ink-3 hover:bg-hover'
            }`}
          >
            <span
              className="grid h-[14px] w-[14px] flex-none place-items-center rounded-full border border-line"
              style={{ background: active ? 'var(--ink)' : 'var(--paper)', boxShadow: active ? 'inset 0 0 0 3px var(--paper)' : 'none' }}
            />
            <Pill tone={tone} dot>{label}</Pill>
          </button>
        )
      })}
    </div>
  )
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <span className="font-mono text-[12px] text-ink-3">{label}</span>
      <span className="text-right text-[13.5px] text-ink">{children}</span>
    </>
  )
}

type Flash = { kind: 'ok' | 'err'; msg: string } | null

export function NewNcr() {
  const ncr = getNcr()
  const initialTitle = ncr.sections[0]?.body ? 'Polymer batch out-of-spec viscosity' : ''
  const initialBodies: Record<number, string> = Object.fromEntries(
    ncr.sections.map((s) => [s.n, s.body ?? '']),
  )

  const [title, setTitle] = useState(initialTitle)
  const [bodies, setBodies] = useState<Record<number, string>>(initialBodies)
  const [severity, setSeverity] = useState<Ncr['severity']>(ncr.severity)
  const [savedState, setSavedState] = useState<'unsaved' | 'saved' | 'submitted'>('unsaved')
  const [flash, setFlash] = useState<Flash>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function showFlash(kind: 'ok' | 'err', msg: string) {
    setFlash({ kind, msg })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setFlash(null), 2800)
  }

  function setBody(n: number, v: string) {
    setBodies((b) => ({ ...b, [n]: v }))
    setSavedState('unsaved')
  }

  function saveDraft() {
    setSavedState('saved')
    showFlash('ok', 'Draft saved')
  }

  function submit() {
    const filled = ncr.sections.filter((s) => (bodies[s.n] ?? '').trim().length > 0).length
    if (!title.trim()) {
      showFlash('err', 'Add a title before submitting')
      return
    }
    if (filled < 3) {
      showFlash('err', 'Complete the first sections before submitting')
      return
    }
    setSavedState('submitted')
    showFlash('ok', 'NCR submitted for review')
  }

  function discard() {
    setTitle(initialTitle)
    setBodies(initialBodies)
    setSeverity(ncr.severity)
    setSavedState('unsaved')
    showFlash('ok', 'Changes discarded')
  }

  const crumbStatus =
    savedState === 'submitted' ? 'Submitted' : savedState === 'saved' ? 'Draft · saved' : 'Draft · unsaved'

  return (
    <AppShell
      slim
      crumb={
        <>
          <b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp; NCRs &nbsp;/&nbsp; New &nbsp;·&nbsp;{' '}
          <span className="text-ink-3">{crumbStatus}</span>
        </>
      }
      actions={
        <>
          <Button variant="ghost" onClick={discard}>Discard</Button>
          <Button onClick={saveDraft}>Save draft</Button>
          <Button variant="primary" onClick={submit} disabled={savedState === 'submitted'}>
            {savedState === 'submitted' ? 'Submitted' : 'Submit'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-[1fr_300px] items-start">
        {/* ── Document column ──────────────────────────────────────── */}
        <div className="mx-auto w-full max-w-[720px] px-16 pt-12 pb-16">
          <div className="mb-3.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-3">
            NCR · {savedState === 'submitted' ? 'Submitted' : 'Draft'} · {ncr.id}
          </div>

          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setSavedState('unsaved')
            }}
            placeholder="Untitled non-conformance report"
            className="m-0 mb-7 w-full bg-transparent font-serif text-[40px] font-semibold leading-[1.08] tracking-[-0.02em] text-ink outline-none placeholder:text-ink-4"
          />

          {ncr.sections.map((s) => (
            <section key={s.n} className="mb-7">
              <h3 className="m-0 mb-2 font-serif text-[22px] leading-[1.2] tracking-[-0.01em] text-ink">
                <span className="mr-3 font-normal tabular-nums text-ink-3">{s.n}.</span>
                {s.title}
              </h3>
              <textarea
                value={bodies[s.n] ?? ''}
                onChange={(e) => setBody(s.n, e.target.value)}
                placeholder={s.placeholder ?? 'Add detail…'}
                rows={3}
                className="m-0 w-full resize-none bg-transparent text-[16px] leading-[1.7] text-ink-2 outline-none placeholder:italic placeholder:text-ink-4 [field-sizing:content]"
              />
            </section>
          ))}
        </div>

        {/* ── Right rail (sticky) ── */}
        <aside className="sticky top-0 flex flex-col gap-6 self-start border-l border-line bg-paper-2 px-6 pt-11 pb-10">
          <div>
            <SectionHead>Supplier</SectionHead>
            <SupplierChip ncr={ncr} />
          </div>

          <div>
            <SectionHead>Severity</SectionHead>
            <SeverityList value={severity} onSelect={(v) => { setSeverity(v); setSavedState('unsaved') }} />
          </div>

          <div>
            <SectionHead>Details</SectionHead>
            <div className="grid grid-cols-[max-content_1fr] items-baseline gap-x-3.5 gap-y-2.5">
              <MetaRow label="NCR"><span className="font-mono tabular-nums">{ncr.id}</span></MetaRow>
              <MetaRow label="Status"><span className="capitalize">{savedState === 'submitted' ? 'open' : ncr.status}</span></MetaRow>
              <MetaRow label="Opened">{fmtDate(ncr.openedAt)}</MetaRow>
              <MetaRow label="Due">{fmtDate(ncr.dueAt)}</MetaRow>
              <MetaRow label="D-phase"><span className="font-mono">{ncr.dPhase}</span></MetaRow>
              <MetaRow label="Cost impact"><span className="tabular-nums">{eur.format(ncr.costImpactEur)}</span></MetaRow>
            </div>
          </div>
        </aside>
      </div>

      {/* Transient confirmation toast */}
      {flash && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-[13px] font-medium shadow-[0_8px_24px_-8px_rgba(40,30,20,0.3)] ${
            flash.kind === 'ok' ? 'border-good bg-card text-good' : 'border-bad bg-card text-bad'
          }`}
        >
          <Icon name={flash.kind === 'ok' ? 'check' : 'warn'} size={15} />
          {flash.msg}
        </div>
      )}
    </AppShell>
  )
}

export default NewNcr
