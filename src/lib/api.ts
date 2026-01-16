const API_BASE = '/api'

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  const json: ApiResponse<T> = await res.json()

  if (!json.success) {
    throw new Error(json.error || 'Something went wrong')
  }

  return json.data as T
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
}

export interface User {
  id: string
  email: string
  role: 'USER' | 'ADMIN'
}

export interface Company {
  id: string
  name: string
  description?: string
  logo?: string
  createdAt: string
  articles?: Article[]
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  discountPrice?: number
  affiliateLink: string
  createdAt: string
}

export interface ArticleProduct {
  articleId: string
  productId: string
  product: Product
}

export interface Article {
  id: string
  title: string
  content: string
  published: boolean
  companyId: string
  company: Company
  products: ArticleProduct[]
  createdAt: string
}

export interface Click {
  id: string
  productId: string
  articleId: string
  userId?: string
  createdAt: string
}

export interface Order {
  id: string
  productId: string
  userId: string
  amount: number
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  product?: Product
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User; token: string }>('/auth/login', { email, password }),
  register: (email: string, password: string) =>
    api.post<{ user: User; token: string }>('/auth/register', { email, password }),
}

export const contentApi = {
  getFeed: () => api.get<Article[]>('/content/feed'),
  getArticle: (id: string) => api.get<Article>(`/content/articles/${id}`),
}

export const adminApi = {
  getArticles: () => api.get<Article[]>('/admin/articles'),
  createArticle: (data: { title: string; content: string; companyId: string }) =>
    api.post<Article>('/admin/articles', data),
  updateArticle: (id: string, data: Partial<Article>) =>
    api.put<Article>(`/admin/articles/${id}`, data),
  deleteArticle: (id: string) => api.delete(`/admin/articles/${id}`),

  getCompanies: () => api.get<Company[]>('/admin/companies'),
  createCompany: (data: { name: string; description?: string; logo?: string }) =>
    api.post<Company>('/admin/companies', data),
  updateCompany: (id: string, data: Partial<Company>) =>
    api.put<Company>(`/admin/companies/${id}`, data),
  deleteCompany: (id: string) => api.delete(`/admin/companies/${id}`),

  getProducts: () => api.get<Product[]>('/admin/products'),
  createProduct: (data: {
    name: string
    description?: string
    price: number
    discountPrice?: number
    affiliateLink: string
  }) => api.post<Product>('/admin/products', data),
  updateProduct: (id: string, data: Partial<Product>) =>
    api.put<Product>(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),

  addProductToArticle: (articleId: string, productId: string) =>
    api.post(`/admin/articles/${articleId}/products`, { productId }),
  removeProductFromArticle: (articleId: string, productId: string) =>
    api.delete(`/admin/articles/${articleId}/products/${productId}`),

  getAnalytics: () => api.get<{ clicks: Click[]; orders: Order[] }>('/admin/analytics'),
}

export const trackingApi = {
  trackClick: (articleId: string, productId: string, userId?: string) =>
    api.post<Click>('/tracking/click', { articleId, productId, userId }),
  trackOrder: (productId: string, amount: number) =>
    api.post<Order>('/tracking/order', { productId, amount }),
}
