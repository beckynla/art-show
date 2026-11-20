import { cn } from '@/lib/utils'

// Form buttons that stay pinned to the bottom of the screen on phones,
// so Save is always in reach on long forms; a normal row on larger screens
export function StickyActions({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-10 -mx-4 flex items-center justify-between gap-3 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur',
        'sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none',
        className
      )}
    >
      {children}
    </div>
  )
}
