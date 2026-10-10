import type { ReactNode } from 'react'

/** Sticky bottom bar for the primary action: one-thumb reach on a phone. */
export function ActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-bg/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
      <div className="mx-auto flex max-w-xl gap-3 px-4">{children}</div>
    </div>
  )
}
