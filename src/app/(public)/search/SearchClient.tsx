'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, FileText, Package, Building2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  company: { id: string; name: string };
  products: { product: { id: string; name: string } }[];
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: string;
  discountPrice?: string;
  company: { id: string; name: string };
}

interface Company {
  id: string;
  name: string;
  description?: string;
}

interface SearchResults {
  articles?: { items: Article[]; total: number };
  products?: { items: Product[]; total: number };
  companies?: { items: Company[]; total: number };
}

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim().length < 2) return;

    setLoading(true);
    try {
      const type = activeTab === 'all' ? 'all' : activeTab;
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}`);
      const data = await res.json();
      setResults(data);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(parseFloat(price));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Search</h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles, products, companies..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading || query.trim().length < 2}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </form>

        {results && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="articles">
                Articles ({results.articles?.total || 0})
              </TabsTrigger>
              <TabsTrigger value="products">
                Products ({results.products?.total || 0})
              </TabsTrigger>
              <TabsTrigger value="companies">
                Companies ({results.companies?.total || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              {results.articles && results.articles.items.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Articles
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('articles')}>
                      View all <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="grid gap-4">
                    {results.articles.items.slice(0, 3).map((article) => (
                      <Card key={article.id}>
                        <CardContent className="p-4">
                          <Link href={`/articles/${article.id}`} className="hover:underline">
                            <h3 className="font-semibold">{article.title}</h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            {article.excerpt || 'No description available'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">{article.company.name}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {article.products.length} products
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {results.products && results.products.items.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Products
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('products')}>
                      View all <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {results.products.items.slice(0, 4).map((product) => (
                      <Card key={product.id}>
                        <CardContent className="p-4">
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {product.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {product.discountPrice ? (
                              <>
                                <span className="font-bold text-green-600">
                                  {formatPrice(product.discountPrice)}
                                </span>
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(product.price)}
                                </span>
                              </>
                            ) : (
                              <span className="font-bold">{formatPrice(product.price)}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {results.companies && results.companies.items.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Companies
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('companies')}>
                      View all <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {results.companies.items.slice(0, 4).map((company) => (
                      <Card key={company.id}>
                        <CardContent className="p-4">
                          <Link href={`/companies/${company.id}`} className="hover:underline">
                            <h3 className="font-semibold">{company.name}</h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            {company.description || 'No description'}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {(!results.articles?.items.length && 
                !results.products?.items.length && 
                !results.companies?.items.length) && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No results found for "{query}"</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="articles">
              <div className="grid gap-4">
                {results.articles?.items.map((article) => (
                  <Card key={article.id}>
                    <CardContent className="p-4">
                      <Link href={`/articles/${article.id}`} className="hover:underline">
                        <h3 className="font-semibold text-lg">{article.title}</h3>
                      </Link>
                      <p className="text-muted-foreground mt-1">
                        {article.excerpt || 'No description available'}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary">{article.company.name}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {article.products.length} products
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="products">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.products?.items.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {product.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        {product.discountPrice ? (
                          <>
                            <span className="font-bold text-green-600">
                              {formatPrice(product.discountPrice)}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold">{formatPrice(product.price)}</span>
                        )}
                      </div>
                      <Badge variant="outline" className="mt-2">{product.company.name}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="companies">
              <div className="grid gap-4 md:grid-cols-2">
                {results.companies?.items.map((company) => (
                  <Card key={company.id}>
                    <CardContent className="p-4">
                      <Link href={`/companies/${company.id}`} className="hover:underline">
                        <h3 className="font-semibold text-lg">{company.name}</h3>
                      </Link>
                      <p className="text-muted-foreground mt-1">
                        {company.description || 'No description'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
