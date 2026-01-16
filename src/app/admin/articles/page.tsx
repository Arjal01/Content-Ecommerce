'use client'

import { useEffect, useState } from 'react'
import { adminApi, Article, Company, Product } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Plus, Pencil, Trash2, FileText, Loader2, Eye, EyeOff, Tag, X } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content: '',
    companyId: '',
    published: false,
  })
  const [selectedProductId, setSelectedProductId] = useState('')

  const fetchData = async () => {
    try {
      const [articlesData, companiesData, productsData] = await Promise.all([
        adminApi.getArticles(),
        adminApi.getCompanies(),
        adminApi.getProducts(),
      ])
      setArticles(articlesData)
      setCompanies(companiesData)
      setProducts(productsData)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openDialog = (article?: Article) => {
    if (article) {
      setEditingArticle(article)
      setForm({
        title: article.title,
        content: article.content,
        companyId: article.companyId,
        published: article.published,
      })
    } else {
      setEditingArticle(null)
      setForm({ title: '', content: '', companyId: '', published: false })
    }
    setDialogOpen(true)
  }

  const openProductDialog = (article: Article) => {
    setSelectedArticle(article)
    setSelectedProductId('')
    setProductDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingArticle) {
        await adminApi.updateArticle(editingArticle.id, form)
        toast.success('Article updated successfully')
      } else {
        await adminApi.createArticle(form)
        toast.success('Article created successfully')
      }
      setDialogOpen(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return
    try {
      await adminApi.deleteArticle(id)
      toast.success('Article deleted successfully')
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleTogglePublish = async (article: Article) => {
    try {
      await adminApi.updateArticle(article.id, { published: !article.published })
      toast.success(article.published ? 'Article unpublished' : 'Article published')
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleAddProduct = async () => {
    if (!selectedArticle || !selectedProductId) return
    setSaving(true)
    try {
      await adminApi.addProductToArticle(selectedArticle.id, selectedProductId)
      toast.success('Product added to article')
      setProductDialogOpen(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveProduct = async (articleId: string, productId: string) => {
    try {
      await adminApi.removeProductFromArticle(articleId, productId)
      toast.success('Product removed from article')
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const getAvailableProducts = (article: Article) => {
    const assignedIds = article.products.map((p) => p.productId)
    return products.filter((p) => !assignedIds.includes(p.id))
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Articles</h1>
        <Button onClick={() => openDialog()} disabled={companies.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Add Article
        </Button>
      </div>

      {companies.length === 0 && !loading && (
        <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-yellow-800">
          You need to create a company first before adding articles.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Articles</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500">No articles yet. Create your first article!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium max-w-xs truncate">{article.title}</TableCell>
                    <TableCell>{article.company?.name || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {article.products.length === 0 ? (
                          <span className="text-gray-400">None</span>
                        ) : (
                          article.products.slice(0, 2).map(({ product }) => (
                            <Badge key={product.id} variant="secondary" className="text-xs">
                              {product.name}
                              <button
                                onClick={() => handleRemoveProduct(article.id, product.id)}
                                className="ml-1 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))
                        )}
                        {article.products.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{article.products.length - 2}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => openProductDialog(article)}
                        >
                          <Tag className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={article.published ? 'default' : 'secondary'}>
                        {article.published ? (
                          <><Eye className="mr-1 h-3 w-3" /> Published</>
                        ) : (
                          <><EyeOff className="mr-1 h-3 w-3" /> Draft</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(article.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleTogglePublish(article)}
                        title={article.published ? 'Unpublish' : 'Publish'}
                      >
                        {article.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => openDialog(article)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(article.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingArticle ? 'Edit Article' : 'Add Article'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyId">Company</Label>
                <Select
                  value={form.companyId}
                  onValueChange={(value) => setForm({ ...form, companyId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content (HTML supported)</Label>
                <Textarea
                  id="content"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="published"
                  checked={form.published}
                  onCheckedChange={(checked) => setForm({ ...form, published: checked })}
                />
                <Label htmlFor="published">Publish immediately</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !form.companyId}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingArticle ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product to Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedArticle && getAvailableProducts(selectedArticle).length === 0 ? (
              <p className="text-gray-500">No more products available to add.</p>
            ) : (
              <div className="space-y-2">
                <Label>Select Product</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedArticle &&
                      getAvailableProducts(selectedArticle).map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ${Number(product.discountPrice || product.price).toFixed(2)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setProductDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct} disabled={saving || !selectedProductId}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
