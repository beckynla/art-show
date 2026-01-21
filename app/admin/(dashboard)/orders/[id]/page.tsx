import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatCurrency } from '@/lib/stripe'
import { formatDateTime } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, Badge, getStatusVariant } from '@/components/ui'
import { OrderStatusUpdate } from '@/components/admin/OrderStatusUpdate'

async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
  })

  if (!order) return null

  return {
    ...order,
    items: JSON.parse(order.items),
    shippingAddress: JSON.parse(order.shippingAddress),
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order {order.orderNumber}
          </h1>
          <p className="text-gray-500 mt-1">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>
        <Badge variant={getStatusVariant(order.status)} className="text-base px-4 py-1">
          {order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-200">
                {order.items.map((item: {
                  productId: string
                  title: string
                  price: number
                  quantity: number
                }, index: number) => (
                  <div key={index} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} x {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                </div>
                {order.shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-gray-900">{formatCurrency(order.shippingCost)}</span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span className="text-gray-900">{formatCurrency(order.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 whitespace-pre-wrap">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-gray-900">{order.customerName}</p>
              <a
                href={`mailto:${order.customerEmail}`}
                className="text-primary-600 hover:text-primary-700"
              >
                {order.customerEmail}
              </a>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <address className="text-gray-600 not-italic">
                <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </address>
            </CardContent>
          </Card>

          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
