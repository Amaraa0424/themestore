"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Edit, Trash2, Eye, LogOut, Users, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import type { Product, Category, Attribute, Order, User, AnalyticsData } from "@/lib/redis"
import { useLanguage } from "@/contexts/language-context"

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsDays, setAnalyticsDays] = useState(7)

  // Form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    descriptionMn: "",
    price: "",
    categoryId: "",
    attributes: [] as string[],
    previewUrl: "",
  })

  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" })

  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null)
  const [attributeForm, setAttributeForm] = useState({ name: "", description: "" })

  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "admin" | "user",
  })

  const { formatPrice, t } = useLanguage()

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const sessionId = localStorage.getItem("sessionId")
    return sessionId ? {
      'Authorization': `Bearer ${sessionId}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    }
  }

  useEffect(() => {
    // Check authentication with server
    const checkAuth = async () => {
      const sessionId = localStorage.getItem("sessionId")
      if (!sessionId) {
        router.push("/auth/login")
        return
      }

      try {
        // Verify session with server and get user info
        const response = await fetch("/api/users", {
          headers: {
            'Authorization': `Bearer ${sessionId}`
          }
        })

        if (!response.ok) {
          // Session invalid or user not admin
          localStorage.removeItem("sessionId")
          localStorage.removeItem("user")
          router.push("/auth/login")
          return
        }

        // If we can access admin endpoint, user is admin
        const userData = localStorage.getItem("user")
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          loadData()
          loadAnalytics()
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        localStorage.removeItem("sessionId")
        localStorage.removeItem("user")
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [router])

  const loadData = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId")
      const authHeaders = sessionId ? {
        'Authorization': `Bearer ${sessionId}`
      } : {}

      const [productsRes, categoriesRes, attributesRes, ordersRes, usersRes] = await Promise.all([
        fetch("/api/products", { headers: authHeaders }),
        fetch("/api/categories", { headers: authHeaders }),
        fetch("/api/attributes", { headers: authHeaders }),
        fetch("/api/orders", { headers: authHeaders }),
        fetch("/api/users", { headers: authHeaders }),
      ])

      if (productsRes.ok) setProducts(await productsRes.json())
      if (categoriesRes.ok) setCategories(await categoriesRes.json())
      if (attributesRes.ok) setAttributes(await attributesRes.json())
      if (ordersRes.ok) setOrders(await ordersRes.json())
      if (usersRes.ok) setUsers(await usersRes.json())
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async (days = 7) => {
    setAnalyticsLoading(true)
    try {
      const sessionId = localStorage.getItem("sessionId")
      const authHeaders = sessionId ? {
        'Authorization': `Bearer ${sessionId}`
      } : {}

      const response = await fetch(`/api/analytics?days=${days}`, {
        headers: authHeaders
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Error loading analytics:", error)

      // Set empty analytics on error
      setAnalytics({
        totalPageViews: 0,
        uniqueVisitors: 0,
        topPages: [],
        dailyViews: [],
        referrers: [],
        countries: [],
      })
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId")
      if (sessionId) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionId}`
          }
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("sessionId")
      localStorage.removeItem("user")
      router.push("/")
    }
  }

  const handleProductSubmit = async () => {
    try {
      const productData = {
        ...productForm,
        price: Number.parseFloat(productForm.price),
      }

      if (editingProduct) {
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(productData),
        })
        if (response.ok) {
          const updated = await response.json()
          setProducts(products.map((p) => (p.id === editingProduct.id ? updated : p)))
        }
      } else {
        const response = await fetch("/api/products", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(productData),
        })
        if (response.ok) {
          const newProduct = await response.json()
          setProducts([...products, newProduct])
        }
      }

      setEditingProduct(null)
      setProductForm({
        name: "",
        description: "",
        descriptionMn: "",
        price: "",
        categoryId: "",
        attributes: [],
        previewUrl: "",
      })
    } catch (error) {
      console.error("Error saving product:", error)
    }
  }

  const handleUserSubmit = async () => {
    try {
      if (editingUser) {
        const updateData = { ...userForm }
        if (!updateData.password) {
          delete updateData.password
        }

        const response = await fetch(`/api/users/${editingUser.id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(updateData),
        })
        if (response.ok) {
          const updated = await response.json()
          setUsers(users.map((u) => (u.id === editingUser.id ? updated : u)))
        }
      } else {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(userForm),
        })
        if (response.ok) {
          const newUser = await response.json()
          setUsers([...users, newUser])
        }
      }

      setEditingUser(null)
      setUserForm({ name: "", email: "", password: "", role: "user" })
    } catch (error) {
      console.error("Error saving user:", error)
    }
  }

  const deleteUser = async (id: string) => {
    if (confirm(t("confirmDeleteUser"))) {
      try {
        const response = await fetch(`/api/users/${id}`, { 
          method: "DELETE",
          headers: getAuthHeaders()
        })
        if (response.ok) {
          setUsers(users.filter((u) => u.id !== id))
        }
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
  }

  const handleCategorySubmit = async () => {
    try {
      if (editingCategory) {
        const response = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(categoryForm),
        })
        if (response.ok) {
          const updated = await response.json()
          setCategories(categories.map((c) => (c.id === editingCategory.id ? updated : c)))
        }
      } else {
        const response = await fetch("/api/categories", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(categoryForm),
        })
        if (response.ok) {
          const newCategory = await response.json()
          setCategories([...categories, newCategory])
        }
      }

      setEditingCategory(null)
      setCategoryForm({ name: "", description: "" })
    } catch (error) {
      console.error("Error saving category:", error)
    }
  }

  const handleAttributeSubmit = async () => {
    try {
      if (editingAttribute) {
        const response = await fetch(`/api/attributes/${editingAttribute.id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(attributeForm),
        })
        if (response.ok) {
          const updated = await response.json()
          setAttributes(attributes.map((a) => (a.id === editingAttribute.id ? updated : a)))
        }
      } else {
        const response = await fetch("/api/attributes", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(attributeForm),
        })
        if (response.ok) {
          const newAttribute = await response.json()
          setAttributes([...attributes, newAttribute])
        }
      }

      setEditingAttribute(null)
      setAttributeForm({ name: "", description: "" })
    } catch (error) {
      console.error("Error saving attribute:", error)
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, { 
        method: "DELETE",
        headers: getAuthHeaders()
      })
      if (response.ok) {
        setProducts(products.filter((p) => p.id !== id))
      }
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`, { 
        method: "DELETE",
        headers: getAuthHeaders()
      })
      if (response.ok) {
        setCategories(categories.filter((c) => c.id !== id))
      }
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  const deleteAttribute = async (id: string) => {
    try {
      const response = await fetch(`/api/attributes/${id}`, { 
        method: "DELETE",
        headers: getAuthHeaders()
      })
      if (response.ok) {
        setAttributes(attributes.filter((a) => a.id !== id))
      }
    } catch (error) {
      console.error("Error deleting attribute:", error)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        const updated = await response.json()
        setOrders(orders.map((order) => (order.id === orderId ? updated : order)))
      }
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("backToStore")}
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">{t("adminPanel")}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                {t("logout")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              {t("analytics")}
            </TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{t("webTraffic")}</h2>
                <Select
                  value={analyticsDays.toString()}
                  onValueChange={(value) => {
                    const days = Number.parseInt(value)
                    setAnalyticsDays(days)
                    loadAnalytics(days)
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">{t("last7Days")}</SelectItem>
                    <SelectItem value="30">{t("last30Days")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {analyticsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Stats Cards */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t("totalPageViews")}</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.totalPageViews.toLocaleString()}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t("uniqueVisitors")}</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.uniqueVisitors.toLocaleString()}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t("topPages")}</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.topPages.length}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t("referrers")}</CardTitle>
                      <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.referrers.length}</div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">{t("noData")}</p>
                  </CardContent>
                </Card>
              )}

              {analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Daily Traffic Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("dailyTraffic")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.dailyViews}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Top Pages */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("topPages")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.topPages.slice(0, 5)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="path" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="views" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Countries Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Visitors by Country</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.countries.slice(0, 5)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="country" />
                          <YAxis />
                          <Tooltip formatter={(value, name) => [`${value} views`, name]} />
                          <Bar dataKey="views" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Countries Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Country Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Country</TableHead>
                            <TableHead>{t("views")}</TableHead>
                            <TableHead>Percentage</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analytics.countries.slice(0, 10).map((country, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{country.country}</TableCell>
                              <TableCell>{country.views}</TableCell>
                              <TableCell>{country.percentage}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Referrers Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("referrers")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Source</TableHead>
                            <TableHead>{t("views")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analytics.referrers.slice(0, 5).map((referrer, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{referrer.source || "Direct"}</TableCell>
                              <TableCell>{referrer.views}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Top Pages Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("pages")} Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Page</TableHead>
                            <TableHead>{t("views")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analytics.topPages.slice(0, 10).map((page, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{page.path}</TableCell>
                              <TableCell>{page.views}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t("productsManagement")}</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingProduct(null)
                        setProductForm({
                          name: "",
                          description: "",
                          descriptionMn: "",
                          price: "",
                          categoryId: "",
                          attributes: [],
                          previewUrl: "",
                        })
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("addProduct")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingProduct ? t("editProduct") : t("addNewProduct")}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">{t("name")}</Label>
                        <Input
                          id="name"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">{t("descriptionEn")}</Label>
                        <Textarea
                          id="description"
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="descriptionMn">{t("descriptionMn")}</Label>
                        <Textarea
                          id="descriptionMn"
                          value={productForm.descriptionMn}
                          onChange={(e) => setProductForm({ ...productForm, descriptionMn: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="price">{t("price")}</Label>
                        <Input
                          id="price"
                          type="number"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="previewUrl">{t("previewUrl")}</Label>
                        <Input
                          id="previewUrl"
                          value={productForm.previewUrl}
                          onChange={(e) => setProductForm({ ...productForm, previewUrl: e.target.value })}
                          placeholder={t("previewUrlPlaceholder")}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category">{t("category")}</Label>
                        <Select
                          value={productForm.categoryId}
                          onValueChange={(value) => setProductForm({ ...productForm, categoryId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("selectCategory")} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>{t("attributes")}</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {attributes.map((attribute) => (
                            <div key={attribute.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={attribute.id}
                                checked={productForm.attributes.includes(attribute.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setProductForm({
                                      ...productForm,
                                      attributes: [...productForm.attributes, attribute.id],
                                    })
                                  } else {
                                    setProductForm({
                                      ...productForm,
                                      attributes: productForm.attributes.filter((id) => id !== attribute.id),
                                    })
                                  }
                                }}
                              />
                              <Label htmlFor={attribute.id} className="text-sm">
                                {attribute.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button onClick={handleProductSubmit}>
                        {editingProduct ? t("updateProduct") : t("addProduct")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("name")}</TableHead>
                      <TableHead>{t("category")}</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Preview URL</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => {
                      const category = categories.find((c) => c.id === product.categoryId)
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{category && <Badge variant="secondary">{category.name}</Badge>}</TableCell>
                          <TableCell>{formatPrice(product.price)}</TableCell>
                          <TableCell>
                            <a
                              href={product.previewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              <Eye className="h-4 w-4 inline mr-1" />
                              {t("preview")}
                            </a>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingProduct(product)
                                      setProductForm({
                                        name: product.name,
                                        description: product.description,
                                        descriptionMn: product.descriptionMn || "",
                                        price: product.price.toString(),
                                        categoryId: product.categoryId,
                                        attributes: product.attributes,
                                        previewUrl: product.previewUrl,
                                      })
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>{t("editProduct")}</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-name">{t("name")}</Label>
                                      <Input
                                        id="edit-name"
                                        value={productForm.name}
                                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-description">{t("descriptionEn")}</Label>
                                      <Textarea
                                        id="edit-description"
                                        value={productForm.description}
                                        onChange={(e) =>
                                          setProductForm({ ...productForm, description: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-descriptionMn">{t("descriptionMn")}</Label>
                                      <Textarea
                                        id="edit-descriptionMn"
                                        value={productForm.descriptionMn}
                                        onChange={(e) =>
                                          setProductForm({ ...productForm, descriptionMn: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-price">{t("price")}</Label>
                                      <Input
                                        id="edit-price"
                                        type="number"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-previewUrl">{t("previewUrl")}</Label>
                                      <Input
                                        id="edit-previewUrl"
                                        value={productForm.previewUrl}
                                        onChange={(e) => setProductForm({ ...productForm, previewUrl: e.target.value })}
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-category">{t("category")}</Label>
                                      <Select
                                        value={productForm.categoryId}
                                        onValueChange={(value) => setProductForm({ ...productForm, categoryId: value })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder={t("selectCategory")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                              {category.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="grid gap-2">
                                      <Label>{t("attributes")}</Label>
                                      <div className="grid grid-cols-2 gap-2">
                                        {attributes.map((attribute) => (
                                          <div key={attribute.id} className="flex items-center space-x-2">
                                            <Checkbox
                                              id={`edit-${attribute.id}`}
                                              checked={productForm.attributes.includes(attribute.id)}
                                              onCheckedChange={(checked) => {
                                                if (checked) {
                                                  setProductForm({
                                                    ...productForm,
                                                    attributes: [...productForm.attributes, attribute.id],
                                                  })
                                                } else {
                                                  setProductForm({
                                                    ...productForm,
                                                    attributes: productForm.attributes.filter(
                                                      (id) => id !== attribute.id,
                                                    ),
                                                  })
                                                }
                                              }}
                                            />
                                            <Label htmlFor={`edit-${attribute.id}`} className="text-sm">
                                              {attribute.name}
                                            </Label>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <Button onClick={handleProductSubmit}>{t("updateProduct")}</Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button variant="outline" size="sm" onClick={() => deleteProduct(product.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Categories Management</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingCategory(null)
                        setCategoryForm({ name: "", description: "" })
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="cat-name">{t("name")}</Label>
                        <Input
                          id="cat-name"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cat-description">{t("description")}</Label>
                        <Textarea
                          id="cat-description"
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleCategorySubmit}>
                        {editingCategory ? "Update Category" : "Add Category"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("name")}</TableHead>
                      <TableHead>{t("description")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingCategory(category)
                                    setCategoryForm({ name: category.name, description: category.description })
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Category</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-cat-name">{t("name")}</Label>
                                    <Input
                                      id="edit-cat-name"
                                      value={categoryForm.name}
                                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-cat-description">{t("description")}</Label>
                                    <Textarea
                                      id="edit-cat-description"
                                      value={categoryForm.description}
                                      onChange={(e) =>
                                        setCategoryForm({ ...categoryForm, description: e.target.value })
                                      }
                                    />
                                  </div>
                                  <Button onClick={handleCategorySubmit}>Update Category</Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" onClick={() => deleteCategory(category.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attributes Tab */}
          <TabsContent value="attributes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Attributes Management</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingAttribute(null)
                        setAttributeForm({ name: "", description: "" })
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Attribute
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingAttribute ? "Edit Attribute" : "Add New Attribute"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="attr-name">{t("name")}</Label>
                        <Input
                          id="attr-name"
                          value={attributeForm.name}
                          onChange={(e) => setAttributeForm({ ...attributeForm, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="attr-description">{t("description")}</Label>
                        <Textarea
                          id="attr-description"
                          value={attributeForm.description}
                          onChange={(e) => setAttributeForm({ ...attributeForm, description: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleAttributeSubmit}>
                        {editingAttribute ? "Update Attribute" : "Add Attribute"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("name")}</TableHead>
                      <TableHead>{t("description")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attributes.map((attribute) => (
                      <TableRow key={attribute.id}>
                        <TableCell className="font-medium">{attribute.name}</TableCell>
                        <TableCell>{attribute.description}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingAttribute(attribute)
                                    setAttributeForm({ name: attribute.name, description: attribute.description })
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Attribute</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-attr-name">{t("name")}</Label>
                                    <Input
                                      id="edit-attr-name"
                                      value={attributeForm.name}
                                      onChange={(e) => setAttributeForm({ ...attributeForm, name: e.target.value })}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-attr-description">{t("description")}</Label>
                                    <Textarea
                                      id="edit-attr-description"
                                      value={attributeForm.description}
                                      onChange={(e) =>
                                        setAttributeForm({ ...attributeForm, description: e.target.value })
                                      }
                                    />
                                  </div>
                                  <Button onClick={handleAttributeSubmit}>Update Attribute</Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" onClick={() => deleteAttribute(attribute.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Orders Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const product = products.find((p) => p.id === order.productId)
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>{product?.name || "Unknown Product"}</TableCell>
                          <TableCell>{formatPrice(order.amount)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                order.status === "completed"
                                  ? "default"
                                  : order.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t("usersManagement")}</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingUser(null)
                        setUserForm({ name: "", email: "", password: "", role: "user" })
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("addUser")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingUser ? t("editUser") : t("addNewUser")}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="user-name">{t("name")}</Label>
                        <Input
                          id="user-name"
                          value={userForm.name}
                          onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="user-email">{t("email")}</Label>
                        <Input
                          id="user-email"
                          type="email"
                          value={userForm.email}
                          onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="user-password">
                          {t("password")} {editingUser && "(Leave empty to keep current)"}
                        </Label>
                        <Input
                          id="user-password"
                          type="password"
                          value={userForm.password}
                          onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="user-role">{t("role")}</Label>
                        <Select
                          value={userForm.role}
                          onValueChange={(value: "admin" | "user") => setUserForm({ ...userForm, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">{t("user")}</SelectItem>
                            <SelectItem value="admin">{t("admin")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleUserSubmit}>{editingUser ? t("updateUser") : t("addUser")}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("name")}</TableHead>
                      <TableHead>{t("email")}</TableHead>
                      <TableHead>{t("role")}</TableHead>
                      <TableHead>{t("createdAt")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingUser(user)
                                    setUserForm({
                                      name: user.name,
                                      email: user.email,
                                      password: "",
                                      role: user.role,
                                    })
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{t("editUser")}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-user-name">{t("name")}</Label>
                                    <Input
                                      id="edit-user-name"
                                      value={userForm.name}
                                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-user-email">{t("email")}</Label>
                                    <Input
                                      id="edit-user-email"
                                      type="email"
                                      value={userForm.email}
                                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-user-password">
                                      {t("password")} (Leave empty to keep current)
                                    </Label>
                                    <Input
                                      id="edit-user-password"
                                      type="password"
                                      value={userForm.password}
                                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-user-role">{t("role")}</Label>
                                    <Select
                                      value={userForm.role}
                                      onValueChange={(value: "admin" | "user") =>
                                        setUserForm({ ...userForm, role: value })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="user">{t("user")}</SelectItem>
                                        <SelectItem value="admin">{t("admin")}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button onClick={handleUserSubmit}>{t("updateUser")}</Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" onClick={() => deleteUser(user.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
