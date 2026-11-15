'use client'

import { useState } from 'react'

export interface DailyPoint {
  label: string // e.g. "Nov 14"
  views: number
  visitors: number
}

// Page views per day as thin bars, with a hover tooltip for each day
export function DailyViewsChart({ data }: { data: DailyPoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const max = Math.max(1, ...data.map((d) => d.views))
  const active = hovered !== null ? data[hovered] : null

  return (
    <div>
      <div className="relative h-48">
        {/* Recessive guide lines at the top and middle of the scale */}
        <div className="absolute inset-x-0 top-0 border-t border-dashed border-gray-200" />
        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-gray-200" />
        <span className="absolute -top-2 right-0 bg-white pl-1 text-[11px] text-gray-400">{max}</span>

        <div className="absolute inset-0 flex items-end gap-[2px]" onMouseLeave={() => setHovered(null)}>
          {data.map((d, i) => (
            <div
              key={i}
              className="flex h-full flex-1 items-end"
              onMouseEnter={() => setHovered(i)}
              aria-label={`${d.label}: ${d.views} page views, ${d.visitors} visitors`}
            >
              <div
                className={`w-full rounded-t ${hovered === i ? 'bg-primary-700' : 'bg-primary-500'}`}
                style={{ height: d.views > 0 ? `max(2px, ${(d.views / max) * 100}%)` : 0 }}
              />
            </div>
          ))}
        </div>

        {active && hovered !== null && (
          <div
            className="pointer-events-none absolute -top-14 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow"
            style={{ left: `${((hovered + 0.5) / data.length) * 100}%` }}
          >
            <div className="font-medium">{active.label}</div>
            <div>
              {active.views} page views · {active.visitors} visitors
            </div>
          </div>
        )}
      </div>

      {/* Baseline and first / last day labels */}
      <div className="border-t border-gray-300" />
      <div className="mt-1 flex justify-between text-[11px] text-gray-400">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  )
}
