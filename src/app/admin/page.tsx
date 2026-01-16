'use client'

import { useEffect, useState } from 'react'
import { adminApi, Article, Company, Product } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Building2, Package, MousePointer } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    articles: 0,
    companies: 0,
    products: 0,
    clicks: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [articles, companies, products] = await Promise.all([
          adminApi.getArticles().catch(() => []),
          adminApi.getCompanies().catch(() => []),
          adminApi.getProducts().catch(() => []),
        ])
        setStats({
          articles: (articles as Article[]).length,
          companies: (companies as Company[]).length,
          products: (products as Product[]).length,
          clicks: 0,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { title: 'Total Articles', value: stats.articles, icon: FileText, color: 'text-blue-600 bg-blue-100' },
    { title: 'Total Companies', value: stats.companies, icon: Building2, color: 'text-green-600 bg-green-100' },
    { title: 'Total Products', value: stats.products, icon: Package, color: 'text-purple-600 bg-purple-100' },
    { title: 'Total Clicks', value: stats.clicks, icon: MousePointer, color: 'text-orange-600 bg-orange-100' },
  ]

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
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
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <a href="/admin/articles" className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Manage Articles</div>
                <div className="text-sm text-gray-500">Create, edit, or delete promotional articles</div>
              </div>
            </a>
            <a href="/admin/companies" className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50">
              <Building2 className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Manage Companies</div>
                <div className="text-sm text-gray-500">Add or update company profiles</div>
              </div>
            </a>
            <a href="/admin/products" className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50">
              <Package className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-medium">Manage Products</div>
                <div className="text-sm text-gray-500">Add products with affiliate links</div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-3 pl-4 text-gray-600">
              <li>Create a <strong>Company</strong> - Add the businesses you&apos;re promoting</li>
              <li>Add <strong>Products</strong> - Include affiliate links and pricing</li>
              <li>Write <strong>Articles</strong> - Create compelling promotional content</li>
              <li>Assign <strong>Products to Articles</strong> - Link products within articles</li>
              <li><strong>Publish</strong> - Make your articles visible to users</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
