'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { BarChart3, MousePointer, ShoppingCart, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

interface ClickData {
  id: string
  productId: string
  articleId: string
  createdAt: string
  product: { name: string }
  article: { title: string }
}

interface OrderData {
  id: string
  productId: string
  amount: number
  status: string
  createdAt: string
  product: { name: string }
  user: { email: string }
}

export default function AdminAnalyticsPage() {
  const [clicks, setClicks] = useState<ClickData[]>([])
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/admin/analytics', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        const data = await res.json()
        if (data.success) {
          setClicks(data.data.clicks || [])
          setOrders(data.data.orders || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  const totalRevenue = orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + Number(o.amount), 0)

  const stats = [
    { title: 'Total Clicks', value: clicks.length, icon: MousePointer, color: 'text-blue-600 bg-blue-100' },
    { title: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-green-600 bg-green-100' },
    { title: 'Completed Orders', value: orders.filter((o) => o.status === 'COMPLETED').length, icon: TrendingUp, color: 'text-purple-600 bg-purple-100' },
    { title: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: BarChart3, color: 'text-orange-600 bg-orange-100' },
  ]

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Analytics</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : clicks.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <MousePointer className="mx-auto h-8 w-8 mb-2" />
                No clicks recorded yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Article</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clicks.slice(0, 10).map((click) => (
                    <TableRow key={click.id}>
                      <TableCell className="font-medium">{click.product?.name || 'Unknown'}</TableCell>
                      <TableCell className="max-w-xs truncate">{click.article?.title || 'Unknown'}</TableCell>
                      <TableCell>{format(new Date(click.createdAt), 'MMM d, HH:mm')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <ShoppingCart className="mx-auto h-8 w-8 mb-2" />
                No orders recorded yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, 10).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.product?.name || 'Unknown'}</TableCell>
                      <TableCell>${Number(order.amount).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === 'COMPLETED'
                              ? 'default'
                              : order.status === 'PENDING'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(order.createdAt), 'MMM d, HH:mm')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
