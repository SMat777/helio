// Country ISO-2 code chip in a mono pill — no real flags (kilde: Flag i tether-primitives.jsx).
export function Flag({ code }: { code: string }) {
  return (
    <span className="mr-1.5 rounded-[3px] border border-line-3 px-[5px] py-px font-mono text-[10.5px] font-medium tracking-[0.04em] text-ink-2">
      {code}
    </span>
  )
}
