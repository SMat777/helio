import { AppShell } from '../ui/AppShell'
import { Icon } from '../ui/Icon'

// Placeholder for sidebar routes that aren't designed yet (HANDOFF §4).
export default function Placeholder({ title }: { title: string }) {
  return (
    <AppShell crumb={<><b className="font-medium text-ink">Workspace</b> &nbsp;/&nbsp; {title}</>}>
      <div className="grid h-full place-items-center px-8 py-24">
        <div className="max-w-[380px] text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-rail text-ink-3">
            <Icon name="sparkle" size={20} />
          </div>
          <h1 className="m-0 font-serif text-[28px] tracking-[-0.01em]">{title}</h1>
          <p className="mt-2 text-[13.5px] leading-[1.5] text-ink-3">
            Designet ikke færdigt — denne skærm afventer design i claude.ai/design.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
