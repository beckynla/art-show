import { prisma } from '@/lib/db'
import { Card, CardContent } from '@/components/ui'
import { InquiriesList } from '@/components/admin/InquiriesList'

async function getInquiries() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return inquiries.map((q) => ({
    id: q.id,
    name: q.name,
    email: q.email,
    message: q.message,
    productTitle: q.productTitle,
    status: q.status,
    createdAt: q.createdAt.toISOString(),
  }))
}

export default async function InquiriesPage() {
  const inquiries = await getInquiries()
  const newCount = inquiries.filter((q) => q.status === 'new').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
        <p className="text-gray-500 mt-1">
          Messages from visitors interested in your work
          {newCount > 0 && ` — ${newCount} new`}
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <InquiriesList initialInquiries={inquiries} />
        </CardContent>
      </Card>
    </div>
  )
}
