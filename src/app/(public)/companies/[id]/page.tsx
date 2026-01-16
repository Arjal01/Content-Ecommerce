'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api, Company, Article } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Building2, Calendar, Tag } from 'lucide-react'
import { format } from 'date-fns'

interface CompanyWithArticles extends Company {
  articles: Article[]
}

export default function CompanyProfilePage() {
  const params = useParams()
  const [company, setCompany] = useState<CompanyWithArticles | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCompany() {
      try {
        const data = await api.get<CompanyWithArticles>(`/content/companies/${params.id}`)
        setCompany(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (params.id) {
      fetchCompany()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-6 h-12 w-1/2" />
        <Skeleton className="mt-4 h-24 w-full" />
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/companies">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Button>
        </Link>
        <div className="rounded-lg bg-red-50 p-4 text-center text-red-600">
          {error || 'Company not found'}
        </div>
      </div>
    )
  }

  const publishedArticles = company.articles?.filter((a: Article) => a.published) || []

  return (
    <div className="bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link href="/companies">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Button>
        </Link>

        <div className="mb-12 rounded-xl bg-white p-8 shadow-sm">
          <div className="flex items-start gap-6">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="h-24 w-24 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-primary/10">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              {company.description && (
                <p className="mt-2 text-gray-600">{company.description}</p>
              )}
              <div className="mt-4">
                <Badge variant="secondary">
                  {publishedArticles.length} published article{publishedArticles.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {publishedArticles.length > 0 ? (
          <section>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Articles by {company.name}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publishedArticles.map((article: Article) => (
                <Link key={article.id} href={`/articles/${article.id}`}>
                  <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(article.createdAt), 'MMM d, yyyy')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-3 text-sm text-gray-600">
                        {article.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                      {article.products && article.products.length > 0 && (
                        <div className="mt-4">
                          <Badge variant="secondary" className="text-xs">
                            <Tag className="mr-1 h-3 w-3" />
                            {article.products.length} product{article.products.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <div className="rounded-lg bg-gray-100 p-8 text-center">
            <p className="text-gray-500">No articles from this company yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
