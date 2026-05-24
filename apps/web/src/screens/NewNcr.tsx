import { useState } from 'react'
import { AppShell } from '../ui/AppShell'
import { Button } from '../ui/Button'
import { Flag } from '../ui/Flag'
import { SectionHead } from '../ui/SectionHead'
import { Pill, type PillTone } from '../ui/Pill'
import { getNcr, type Ncr } from '../lib/data'

// Severity model maps the domain enum → semantic pill tones (kilde: V5SeverityList).
const SEVERITIES: { value: Ncr['severity']; label: string; tone: PillTone }[] = [
  { value: 'critical', label: 'Critical', tone: 'bad' },
  { value: 'major', label: 'Major', tone: 'warn' },
  { value: 'minor', label: 'Minor', tone: 'good' },
]

const eur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

// "2024-04-28" → "Apr 28, 2024" — read-only display only.
function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Small serif "H" tile + name + country + id · segment (kilde: V5SupplierChip).
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

// Read-only selectable severity list — radio-dot + tone-dot + label (kilde: V5SeverityList).
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

// One metadata row: mono label left, value right (kilde: V5 rail field grid).
function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <span className="font-mono text-[11px] text-ink-3">{label}</span>
      <span className="text-right text-[12.5px] text-ink">{children}</span>
    </>
  )
}

export function NewNcr() {
  const ncr = getNcr()
  // Read-only mock: severity highlight is local-only, seeded from the record.
  const [severity, setSeverity] = useState<Ncr['severity']>(ncr.severity)

  return (
    <AppShell
      slim
      crumb={
        <>
          <b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp; NCRs &nbsp;/&nbsp; New &nbsp;·&nbsp;{' '}
          <span className="text-ink-3">Draft · auto-saving</span>
        </>
      }
      actions={
        <>
          <Button variant="ghost">Discard</Button>
          <Button>Save draft</Button>
          <Button variant="primary">Submit</Button>
        </>
      }
    >
      <div className="grid grid-cols-[1fr_300px] items-start">
        {/* ── Document column ──────────────────────────────────────── */}
        <div className="mx-auto w-full max-w-[720px] px-16 pt-12 pb-16">
          <div className="mb-3.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-3">
            NCR · Draft · {ncr.id}
          </div>

          <h1 className="m-0 mb-7 font-serif text-[40px] font-normal leading-[1.08] tracking-[-0.02em] text-ink">
            {ncr.sections[0]?.body
              ? 'Polymer batch out-of-spec viscosity'
              : 'New non-conformance report'}
          </h1>

          {ncr.sections.map((s) => (
            <section key={s.n} className="mb-7">
              <h3 className="m-0 mb-2 font-serif text-[22px] leading-[1.2] tracking-[-0.01em] text-ink">
                <span className="mr-3 font-normal tabular-nums text-ink-3">{s.n}.</span>
                {s.title}
              </h3>
              <p
                className={`m-0 text-[15px] leading-[1.65] ${
                  s.body ? 'text-ink-2' : 'italic text-ink-4'
                }`}
              >
                {s.body || s.placeholder}
              </p>
            </section>
          ))}
        </div>

        {/* ── Right rail (sticky — does NOT scroll with the document) ── */}
        <aside className="sticky top-0 flex flex-col gap-6 self-start border-l border-line bg-paper-2 px-6 pt-11 pb-10">
          <div>
            <SectionHead>Supplier</SectionHead>
            <SupplierChip ncr={ncr} />
          </div>

          <div>
            <SectionHead>Severity</SectionHead>
            <SeverityList value={severity} onSelect={setSeverity} />
          </div>

          <div>
            <SectionHead>Details</SectionHead>
            <div className="grid grid-cols-[max-content_1fr] items-baseline gap-x-3.5 gap-y-2.5">
              <MetaRow label="NCR">
                <span className="font-mono tabular-nums">{ncr.id}</span>
              </MetaRow>
              <MetaRow label="Status">
                <span className="capitalize">{ncr.status}</span>
              </MetaRow>
              <MetaRow label="Opened">{fmtDate(ncr.openedAt)}</MetaRow>
              <MetaRow label="Due">{fmtDate(ncr.dueAt)}</MetaRow>
              <MetaRow label="D-phase">
                <span className="font-mono">{ncr.dPhase}</span>
              </MetaRow>
              <MetaRow label="Cost impact">
                <span className="tabular-nums">{eur.format(ncr.costImpactEur)}</span>
              </MetaRow>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  )
}

export default NewNcr
