'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { contentApi, trackingApi, Article } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Building2, Calendar, ExternalLink, Tag, Percent } from 'lucide-react'
import { format } from 'date-fns'

export default function ArticleDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchArticle() {
      try {
        const data = await contentApi.getArticle(params.id as string)
        setArticle(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (params.id) {
      fetchArticle()
    }
  }, [params.id])

  const handleProductClick = async (productId: string, affiliateLink: string) => {
    try {
      await trackingApi.trackClick(params.id as string, productId, user?.id)
    } catch (e) {
      console.error('Failed to track click', e)
    }
    window.open(affiliateLink, '_blank')
  }

  const calculateDiscount = (price: number, discountPrice: number) => {
    return Math.round(((price - discountPrice) / price) * 100)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-6 h-12 w-3/4" />
        <Skeleton className="mt-4 h-6 w-1/2" />
        <Skeleton className="mt-8 h-64 w-full" />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Button>
        </Link>
        <div className="rounded-lg bg-red-50 p-4 text-center text-red-600">
          {error || 'Article not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 py-8">
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Button>
        </Link>

        <header className="mb-8">
          <Link href={`/companies/${article.company.id}`}>
            <Badge variant="secondary" className="mb-4 cursor-pointer hover:bg-secondary/80">
              <Building2 className="mr-1 h-3 w-3" />
              {article.company.name}
            </Badge>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{article.title}</h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(article.createdAt), 'MMMM d, yyyy')}
            </span>
            {article.products.length > 0 && (
              <span className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                {article.products.length} featured product{article.products.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </header>

        <div
          className="prose prose-lg max-w-none rounded-lg bg-white p-6 shadow-sm"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {article.products.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Featured Products</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {article.products.map(({ product }) => (
                <Card key={product.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        {product.description && (
                          <CardDescription className="mt-1">
                            {product.description}
                          </CardDescription>
                        )}
                      </div>
                      {product.discountPrice && (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <Percent className="mr-1 h-3 w-3" />
                          {calculateDiscount(Number(product.price), Number(product.discountPrice))}% OFF
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        {product.discountPrice ? (
                          <>
                            <span className="text-2xl font-bold text-primary">
                              ${Number(product.discountPrice).toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              ${Number(product.price).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-primary">
                            ${Number(product.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={() => handleProductClick(product.id, product.affiliateLink)}
                      >
                        Buy Now
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  )
}
