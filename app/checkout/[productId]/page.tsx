"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLanguage } from "@/contexts/language-context"

interface Product {
  id: string
  name: string
  description: string
  descriptionMn?: string
  price: number
  categoryId: string
  attributes: string[]
  previewUrl: string
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.productId as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  })

  const { t, formatPrice, language } = useLanguage()

  const loadProduct = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      if (response.ok) {
        const productData = await response.json()
        setProduct(productData)
      } else {
        setError("Product not found")
      }
    } catch (error) {
      console.error("Error loading product:", error)
      setError("Failed to load product")
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    loadProduct()
  }, [loadProduct])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setSubmitting(true)
    setError("")

    try {
      // Get user data if logged in
      const userData = localStorage.getItem("user")
      let userId = ""
      if (userData) {
        const user = JSON.parse(userData)
        userId = user.id
      }

      const orderData = {
        productId: product.id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        amount: product.price,
        userId: userId,
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        setSuccess(true)
        setFormData({ customerName: "", customerEmail: "", customerPhone: "" })
        
        // Redirect to success page after a delay
        setTimeout(() => {
          router.push("/")
        }, 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create order")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      setError("Failed to create order")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
              <p className="text-muted-foreground mb-4">The product you&apos;re looking for doesn&apos;t exist.</p>
              <Link href="/">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Store
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Order Placed Successfully!</h2>
              <p className="text-muted-foreground mb-4">
                Thank you for your purchase. We&apos;ll contact you soon with download instructions.
              </p>
              <p className="text-sm text-muted-foreground">Redirecting to home page...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const description = language === "mn" && product.descriptionMn ? product.descriptionMn : product.description

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToStore")}
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t("orderSummary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-muted-foreground">{description}</p>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="outline">Digital Download</Badge>
                <Badge variant="outline">Instant Access</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t("checkoutDetails")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="customerName">{t("fullName")}</Label>
                  <Input
                    id="customerName"
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder={t("enterFullName")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">{t("email")}</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder={t("enterEmail")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">{t("phoneNumber")}</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder={t("enterPhoneNumber")}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t("processing")}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {t("placeOrder")} - {formatPrice(product.price)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  {t("orderNote")}
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
