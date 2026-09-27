import { Children } from 'react'

interface MasonryGridProps {
  children: React.ReactNode
  /** Vertical space between items in a column */
  itemGapClass?: string
}

// Column count per breakpoint; only the layout matching the screen width is shown
const LAYOUTS = [
  { columns: 1, className: 'grid sm:hidden' },
  { columns: 2, className: 'hidden sm:grid lg:hidden' },
  { columns: 3, className: 'hidden lg:grid xl:hidden' },
  { columns: 4, className: 'hidden xl:grid' },
]

const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

/**
 * Masonry layout that keeps each item's natural height but reads left-to-right:
 * items are dealt across the columns in turn, so the first items form the top row.
 * (CSS `columns` would instead fill the first column top-to-bottom.)
 * Images inside hidden layouts are lazy-loaded, so they don't download.
 */
export function MasonryGrid({ children, itemGapClass = 'gap-8' }: MasonryGridProps) {
  const items = Children.toArray(children)

  return (
    <>
      {LAYOUTS.map(({ columns, className }) => (
        <div key={columns} className={`${className} ${GRID_COLS[columns]} gap-6 items-start`}>
          {Array.from({ length: columns }, (_, col) => (
            <div key={col} className={`flex flex-col ${itemGapClass}`}>
              {items.filter((_, i) => i % columns === col)}
            </div>
          ))}
        </div>
      ))}
    </>
  )
}
