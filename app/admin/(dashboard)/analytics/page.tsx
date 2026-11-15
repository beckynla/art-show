import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/db'
import { getPrimaryImage } from '@/lib/images'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { DailyViewsChart, type DailyPoint } from '@/components/admin/DailyViewsChart'

// Days are grouped in the studio's local time
const TIME_ZONE = 'America/Los_Angeles'
const RANGES = [7, 30, 90]
const DEVICE_LABELS: Record<string, string> = { desktop: 'Computer', mobile: 'Phone', tablet: 'Tablet' }

const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }) // 2026-11-14
const dayLabel = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, month: 'short', day: 'numeric' })

function countBy<T>(items: T[], key: (item: T) => string): [string, number][] {
  const counts = new Map<string, number>()
  for (const item of items) counts.set(key(item), (counts.get(key(item)) || 0) + 1)
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
}

async function getAnalytics(days: number) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const views = await prisma.pageView.findMany({
    where: { createdAt: { gte: since } },
    select: { path: true, referrer: true, device: true, visitorId: true, createdAt: true },
  })

  // One bucket per day, oldest first, including days with no visits
  const buckets = new Map<string, { label: string; views: number; visitors: Set<string> }>()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    buckets.set(dayKey.format(date), { label: dayLabel.format(date), views: 0, visitors: new Set() })
  }
  for (const view of views) {
    const bucket = buckets.get(dayKey.format(view.createdAt))
    if (!bucket) continue
    bucket.views++
    bucket.visitors.add(view.visitorId)
  }
  const daily: DailyPoint[] = Array.from(buckets.values()).map((b) => ({
    label: b.label,
    views: b.views,
    visitors: b.visitors.size,
  }))

  // Visitor ids change daily, so total visitors is the sum of each day's visitors
  const totalVisitors = daily.reduce((sum, d) => sum + d.visitors, 0)

  // Most viewed artwork, matched to products by their page address
  const productViews = countBy(
    views.filter((v) => v.path.startsWith('/product/')),
    (v) => v.path.slice('/product/'.length)
  )
  const products = await prisma.product.findMany({
    where: { slug: { in: productViews.slice(0, 10).map(([slug]) => slug) } },
    select: { slug: true, title: true, images: true, id: true },
  })
  const topArtwork = productViews.slice(0, 10).flatMap(([slug, count]) => {
    const product = products.find((p) => p.slug === slug)
    return product ? [{ ...product, image: getPrimaryImage(product.images), count }] : []
  })

  return {
    totalViews: views.length,
    totalVisitors,
    artworkViews: productViews.reduce((sum, [, count]) => sum + count, 0),
    daily,
    topArtwork,
    referrers: countBy(views.filter((v) => v.referrer), (v) => v.referrer as string).slice(0, 10),
    directVisits: views.filter((v) => !v.referrer).length,
    devices: countBy(views, (v) => v.device),
  }
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  const params = await searchParams
  const days = RANGES.includes(Number(params.days)) ? Number(params.days) : 30
  const data = await getAnalytics(days)
  const percent = (n: number) => (data.totalViews ? Math.round((n / data.totalViews) * 100) : 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Visits to your public site. Your own visits while logged in aren&apos;t counted.</p>
        </div>
        <div className="flex rounded-lg border border-gray-200 bg-white p-1">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin/analytics?days=${r}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                r === days ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Last {r} days
            </Link>
          ))}
        </div>
      </div>

      {/* Headline numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Page views', value: data.totalViews },
          { label: 'Visitors', value: data.totalVisitors, note: 'Someone returning on another day counts again' },
          { label: 'Artwork page views', value: data.artworkViews },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
              {stat.note && <p className="mt-1 text-xs text-gray-400">{stat.note}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page views per day</CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <DailyViewsChart data={data.daily} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Most viewed artwork</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topArtwork.length === 0 ? (
              <p className="text-sm text-gray-500">No artwork views yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {data.topArtwork.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-2">
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                      <Image src={item.image} alt="" fill className="object-cover" sizes="40px" />
                    </div>
                    <Link href={`/admin/products/${item.id}`} className="flex-1 truncate text-sm text-gray-900 hover:text-primary-600">
                      {item.title || 'Untitled'}
                    </Link>
                    <span className="text-sm tabular-nums text-gray-600">{item.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Where visitors come from</CardTitle>
            </CardHeader>
            <CardContent>
              {data.totalViews === 0 ? (
                <p className="text-sm text-gray-500">No visits yet.</p>
              ) : (
                <ul className="divide-y divide-gray-100 text-sm">
                  {data.referrers.map(([host, count]) => (
                    <li key={host} className="flex justify-between py-2">
                      <span className="text-gray-900">{host}</span>
                      <span className="tabular-nums text-gray-600">{count}</span>
                    </li>
                  ))}
                  <li className="flex justify-between py-2">
                    <span className="text-gray-500">Direct, bookmarks, or browsing within your site</span>
                    <span className="tabular-nums text-gray-600">{data.directVisits}</span>
                  </li>
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Devices</CardTitle>
            </CardHeader>
            <CardContent>
              {data.devices.length === 0 ? (
                <p className="text-sm text-gray-500">No visits yet.</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {data.devices.map(([device, count]) => (
                    <li key={device}>
                      <div className="flex justify-between">
                        <span className="text-gray-900">{DEVICE_LABELS[device] || device}</span>
                        <span className="tabular-nums text-gray-600">
                          {count} ({percent(count)}%)
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                        <div className="h-1.5 rounded-full bg-primary-500" style={{ width: `${percent(count)}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
