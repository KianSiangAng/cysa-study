import type { ReactNode } from 'react'

type Tab = 'study' | 'notes'

export function Layout({ tab, hideNav = false, children }: { tab: Tab; hideNav?: boolean; children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
      <main className="flex-1 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-24">{children}</main>
      {!hideNav && (
      <nav className="fixed inset-x-0 bottom-0 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto grid max-w-xl grid-cols-2">
          <TabLink href="#/" active={tab === 'study'} label="Study" />
          <TabLink href="#/notes" active={tab === 'notes'} label="Notes" />
        </div>
      </nav>
      )}
    </div>
  )
}

function TabLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-14 items-center justify-center text-base font-semibold ${
        active ? 'text-accent' : 'text-muted'
      }`}
    >
      {label}
    </a>
  )
}
