import { useRegisterSW } from 'virtual:pwa-register/react'

/** Shown when a new version has downloaded; tapping applies it. */
export function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null
  return (
    <div role="status" className="fixed inset-x-4 top-[max(0.75rem,env(safe-area-inset-top))] z-20 mx-auto flex max-w-xl items-center gap-3 rounded-xl border border-line bg-surface-2 p-3 shadow-lg">
      <span className="flex-1 text-sm">Update ready.</span>
      <button type="button" onClick={() => setNeedRefresh(false)} className="min-h-11 px-3 text-sm text-muted">
        Later
      </button>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="min-h-11 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-ink"
      >
        Refresh
      </button>
    </div>
  )
}
