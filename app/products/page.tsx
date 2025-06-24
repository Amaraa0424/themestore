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
import { Navbar } from "@/components/navbar"
import { 
  useProductCardAnimation, 
  usePageLoadAnimation, 
  useFilterAnimation,
  ScrollProgressIndicator,
  LoadingSpinner,
  useMagneticEffect
} from "@/components/gsap-animations"
import Image from "next/image"

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

  // Initialize GSAP animations
  usePageLoadAnimation()
  useProductCardAnimation()
  useFilterAnimation()
  useMagneticEffect()

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
        (priceRange === "0-50000" && product.price <= 50000) ||
        (priceRange === "50001-150000" && product.price > 50000 && product.price <= 150000) ||
        (priceRange === "150001+" && product.price > 150000)

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
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-background">
      <ScrollProgressIndicator />
      {/* Shared Navbar */}
      <Navbar user={user} onLogout={handleLogout} />

      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Filters Sidebar */}
          <div className="sidebar-filters lg:w-64 space-y-6">
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

            <div className="filters-container hidden lg:block space-y-6">
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
            <div className="search-filters mb-12 lg:mb-16">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-4 text-lg"
                />
              </div>
            </div>

            {/* Results Header */}
            <div className="mb-12 lg:mb-16 text-center">
              <p className="text-muted-foreground text-lg">
                {t("showingResults")} {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? t("template") : t("templates")}
              </p>
            </div>

            {/* Product Grid */}
            <div className="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 auto-rows-fr">
              {filteredProducts.map((product) => {
                const category = categories.find((c) => c.id === product.categoryId)
                const description =
                  language === "mn" && product.descriptionMn ? product.descriptionMn : product.description

                return (
                  <Card key={product.id} className="product-card cursor-pointer hover:shadow-lg transition-shadow flex flex-col">
                    <div onClick={() => handleProductClick(product.previewUrl)} className="flex flex-col flex-1">
                      <CardHeader className="p-0">
                        <div className="aspect-video bg-muted rounded-t-lg flex flex-col items-center justify-center relative overflow-hidden">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="product-image w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <div className={`text-muted-foreground ${product.imageUrl ? 'hidden' : ''}`}>
                            {t("templatePreview")}
                          </div>
                          {category && (
                            <span className="absolute top-2 left-2 text-xs bg-white/80 px-2 py-1 rounded text-gray-700">
                              {category.name}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="product-content p-6 lg:p-8 flex-1 flex flex-col">
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
                      <CardFooter className="p-6 lg:p-8 pt-0 flex justify-between items-center">
                        <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
                        <Link href={`/checkout/${product.id}`}>
                          <Button size="sm" className="magnetic-btn" onClick={(e) => e.stopPropagation()}>
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
              <div className="text-center py-20 lg:py-32">
                <p className="text-muted-foreground text-lg">{t("noTemplatesFound")}</p>
              </div>
            )}
          </div>
          
          {/* Bottom Spacer */}
          <div className="py-20 lg:py-32"></div>
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
      <div className="filter-item">
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
      <div className="filter-item">
        <h3 className="font-semibold mb-3">{t("priceRange")}</h3>
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger>
            <SelectValue placeholder="Select price range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allPrices")}</SelectItem>
            <SelectItem value="0-50000">₮0 - ₮50,000</SelectItem>
            <SelectItem value="50001-150000">₮50,001 - ₮150,000</SelectItem>
            <SelectItem value="150001+">₮150,001+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Attributes Filter */}
      <div className="filter-item">
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
