"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, ShoppingCart, Settings, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Product, Category, Attribute, User as UserType } from "@/lib/redis"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState("all")

  const { t, formatPrice, language } = useLanguage()

  useEffect(() => {
    // Check for user session
    const sessionId = localStorage.getItem("sessionId")
    const userData = localStorage.getItem("user")
    if (sessionId && userData) {
      setUser(JSON.parse(userData))
    }

    // Load data
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes, attributesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
        fetch("/api/attributes"),
      ])

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData)
      }

      if (attributesRes.ok) {
        const attributesData = await attributesRes.json()
        setAttributes(attributesData)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
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
      setUser(null)
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const description = language === "mn" && product.descriptionMn ? product.descriptionMn : product.description

      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory

      const matchesAttributes =
        selectedAttributes.length === 0 || selectedAttributes.every((attr) => product.attributes.includes(attr))

      const matchesPrice =
        priceRange === "all" ||
        (priceRange === "0-50" && product.price <= 50) ||
        (priceRange === "51-100" && product.price > 50 && product.price <= 100) ||
        (priceRange === "101+" && product.price > 100)

      return matchesSearch && matchesCategory && matchesAttributes && matchesPrice
    })
  }, [products, searchTerm, selectedCategory, selectedAttributes, priceRange, language])

  const handleAttributeChange = (attributeId: string, checked: boolean) => {
    if (checked) {
      setSelectedAttributes([...selectedAttributes, attributeId])
    } else {
      setSelectedAttributes(selectedAttributes.filter((id) => id !== attributeId))
    }
  }

  const handleProductClick = (previewUrl: string) => {
    window.open(previewUrl, "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t("loadingTemplates")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">{t("logoName")}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeSwitcher />
              <LanguageSwitcher />
              {user ? (
                <>
                  {user.role === "admin" && (
                    <Link href="/admin">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        {t("adminPanel")}
                      </Button>
                    </Link>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <User className="h-4 w-4 mr-2" />
                        {user.name}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        {t("logout")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex space-x-2">
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm">
                      {t("login")}
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm">{t("signUp")}</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 space-y-6">
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    {t("filters")}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>{t("filters")}</SheetTitle>
                  </SheetHeader>
                  <FilterContent
                    categories={categories}
                    attributes={attributes}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedAttributes={selectedAttributes}
                    handleAttributeChange={handleAttributeChange}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                  />
                </SheetContent>
              </Sheet>
            </div>

            <div className="hidden lg:block space-y-6">
              <FilterContent
                categories={categories}
                attributes={attributes}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedAttributes={selectedAttributes}
                handleAttributeChange={handleAttributeChange}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Results Header */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                {t("showingResults")} {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? t("template") : t("templates")}
              </p>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {filteredProducts.map((product) => {
                const category = categories.find((c) => c.id === product.categoryId)
                const description =
                  language === "mn" && product.descriptionMn ? product.descriptionMn : product.description

                return (
                  <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col">
                    <div onClick={() => handleProductClick(product.previewUrl)} className="flex flex-col flex-1">
                      <CardHeader className="p-0">
                        <div className="aspect-video bg-muted rounded-t-lg flex flex-col items-center justify-center">
                          <div className="text-muted-foreground">{t("templatePreview")}</div>
                          {category && (
                            <span className="text-xs bg-white/80 px-2 py-1 rounded mt-2 text-gray-700">
                              {category.name}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2 flex-1">{description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.attributes.map((attrId) => {
                            const attr = attributes.find((a) => a.id === attrId)
                            return attr ? (
                              <Badge key={attr.id} variant="outline" className="text-xs">
                                {attr.name}
                              </Badge>
                            ) : null
                          })}
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between items-center">
                        <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
                        <Link href={`/checkout/${product.id}`}>
                          <Button size="sm" onClick={(e) => e.stopPropagation()}>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {t("buyNow")}
                          </Button>
                        </Link>
                      </CardFooter>
                    </div>
                  </Card>
                )
              })}
            </div>

            {filteredProducts.length === 0 && products.length > 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t("noTemplatesFound")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterContent({
  categories,
  attributes,
  selectedCategory,
  setSelectedCategory,
  selectedAttributes,
  handleAttributeChange,
  priceRange,
  setPriceRange,
}: {
  categories: Category[]
  attributes: Attribute[]
  selectedCategory: string
  setSelectedCategory: (value: string) => void
  selectedAttributes: string[]
  handleAttributeChange: (attributeId: string, checked: boolean) => void
  priceRange: string
  setPriceRange: (value: string) => void
}) {
  const { t } = useLanguage()
  return (
    <>
      {/* Category Filter */}
      <div>
        <h3 className="font-semibold mb-3">{t("category")}</h3>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allCategories")}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="font-semibold mb-3">{t("priceRange")}</h3>
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger>
            <SelectValue placeholder="Select price range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allPrices")}</SelectItem>
            <SelectItem value="0-50">₮0 - ₮125,000</SelectItem>
            <SelectItem value="51-100">₮125,000 - ₮250,000</SelectItem>
            <SelectItem value="101+">₮250,000+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Attributes Filter */}
      <div>
        <h3 className="font-semibold mb-3">{t("features")}</h3>
        <div className="space-y-2">
          {attributes.map((attribute) => (
            <div key={attribute.id} className="flex items-center space-x-2">
              <Checkbox
                id={attribute.id}
                checked={selectedAttributes.includes(attribute.id)}
                onCheckedChange={(checked) => handleAttributeChange(attribute.id, checked as boolean)}
              />
              <Label htmlFor={attribute.id} className="text-sm">
                {attribute.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
