"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CreditCard, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Product, User } from "@/lib/redis"
import { useLanguage } from "@/contexts/language-context"

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.productId as string

  const [product, setProduct] = useState<Product | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [copied, setCopied] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  const bankAccount = "MN04 0005 00 5422544956"

  const { formatPrice, t, language } = useLanguage()

  useEffect(() => {
    // Check for user session
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setCustomerInfo({
        name: parsedUser.name,
        email: parsedUser.email,
        phone: "",
      })
    }

    // Load product
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      if (response.ok) {
        const productData = await response.json()
        setProduct(productData)
      } else {
        console.error("Product not found")
      }
    } catch (error) {
      console.error("Error loading product:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankAccount)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePlaceOrder = async () => {
    if (!customerInfo.name || !customerInfo.email) {
      alert("Please fill in all required fields")
      return
    }

    if (!product) return

    try {
      const orderData = {
        productId: product.id,
        userId: user?.id || "",
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        amount: product.price,
        status: "pending" as const,
        date: new Date().toISOString(),
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        setOrderPlaced(true)
      } else {
        alert("Failed to place order. Please try again.")
      }
    } catch (error) {
      console.error("Error placing order:", error)
      alert("Failed to place order. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t("loadingCheckout")}</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t("productNotFound")}</h1>
          <Link href="/">
            <Button>{t("backToStore")}</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("backToStore")}
              </Button>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">{t("orderPlacedSuccessfully")}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">{t("thankYouOrder")}</p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-semibold">
                    {t("transferAmount")} {formatPrice(product.price)} {t("to")}
                  </p>
                  <p className="text-2xl font-mono font-bold">{bankAccount}</p>
                </div>
                <p className="text-sm text-muted-foreground">{t("paymentConfirmation")}</p>
                <div className="flex gap-4 justify-center">
                  <Link href="/">
                    <Button variant="outline">{t("continueShopping")}</Button>
                  </Link>
                  {user?.role === "admin" && (
                    <Link href="/admin">
                      <Button>{t("viewInAdmin")}</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const description = language === "mn" && product.descriptionMn ? product.descriptionMn : product.description

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToStore")}
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{t("checkout")}</h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>{t("customerInformation")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">{t("fullNameRequired")}</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      placeholder={t("enterFullName")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">{t("emailRequired")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      placeholder={t("enterEmail")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">{t("phoneNumber")}</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder={t("enterPhoneNumber")}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    {t("paymentInstructions")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertDescription>{t("paymentInstructionsText")}</AlertDescription>
                  </Alert>

                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="font-semibold mb-2">{t("bankAccountDetails")}</p>
                    <div className="flex flex-col items-start justify-between">
                      <span className="font-mono text-lg">MN04 0005 00 5422544956</span>
                      <span className="text-sm text-muted-foreground mt-2">
                        {t("transferDescription")} {productId}
                      </span>
                      <Button variant="outline" size="sm" onClick={handleCopyAccount} className="mt-2 self-end">
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>{t("orderSummary")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">{t("template")}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>{t("subtotal")}</span>
                        <span>{formatPrice(product.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("tax")}</span>
                        <span>₮0</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-semibold">
                        <span>{t("total")}</span>
                        <span>{formatPrice(product.price)}</span>
                      </div>
                    </div>

                    <Button className="w-full" size="lg" onClick={handlePlaceOrder}>
                      {t("placeOrder")}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">{t("termsConditions")}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
