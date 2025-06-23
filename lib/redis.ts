import { Redis } from "@upstash/redis"

// Initialize Redis client with error handling
export const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

// Test Redis connection
export async function testRedisConnection() {
  try {
    await redis.ping()
    console.log("Redis connection successful")
    return true
  } catch (error) {
    console.error("Redis connection failed:", error)
    return false
  }
}

// Data structure interfaces
export interface User {
  id: string
  email: string
  password: string
  name: string
  role: "admin" | "user"
  createdAt: string
  [key: string]: unknown
}

export interface Product {
  id: string
  name: string
  description: string
  descriptionMn?: string
  price: number
  categoryId: string
  attributes: string[]
  previewUrl: string
  createdAt: string
  [key: string]: unknown
}

export interface Category {
  id: string
  name: string
  description: string
  createdAt: string
  [key: string]: unknown
}

export interface Attribute {
  id: string
  name: string
  description: string
  createdAt: string
  [key: string]: unknown
}

export interface Order {
  id: string
  productId: string
  userId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  amount: number
  status: "pending" | "completed" | "cancelled"
  date: string
  [key: string]: unknown
}

export interface PageView {
  id: string
  path: string
  userAgent: string
  ip: string
  country: string
  referrer: string
  timestamp: string
  sessionId: string
  userId?: string
  [key: string]: unknown
}

export interface AnalyticsData {
  totalPageViews: number
  uniqueVisitors: number
  topPages: { path: string; views: number }[]
  dailyViews: { date: string; views: number }[]
  referrers: { source: string; views: number }[]
  countries: { country: string; views: number; percentage: number }[]
}

// Helper function to ensure array from Redis
function ensureArray(data: unknown): string[] {
  if (Array.isArray(data)) {
    return data.filter((item) => item != null).map((item) => String(item))
  }
  if (data == null) {
    return []
  }
  return [String(data)]
}

// Helper function to get country from IP address
async function getCountryFromIP(ip: string): Promise<string> {
  try {
    // Skip for local/private IPs
    if (
      ip === "unknown" ||
      ip === "127.0.0.1" ||
      ip === "::1" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.") ||
      ip.startsWith("172.") ||
      ip.startsWith("localhost") ||
      !ip ||
      ip === "null"
    ) {
      return "Unknown"
    }

    // Use a free IP geolocation service with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    try {
      const response = await fetch(`https://ipapi.co/${ip}/country_name/`, {
        signal: controller.signal,
        headers: {
          "User-Agent": "TemplateMarket/1.0",
        },
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const country = await response.text()
        return country.trim() || "Unknown"
      }

      // Fallback to another service
      const fallbackResponse = await fetch(`http://ip-api.com/json/${ip}?fields=country`, {
        signal: controller.signal,
      })

      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json()
        return data.country || "Unknown"
      }

      return "Unknown"
    } catch (fetchError) {
      console.warn("IP geolocation failed:", fetchError)
      return "Unknown"
    }
  } catch (error) {
    console.error("Error getting country from IP:", error)
    return "Unknown"
  }
}

// Helper to convert any object into a Record<string, string> so that the
// upstash redis typings are happy. Non-string primitives are JSON-stringified.
function toRedisHash(obj: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue
    result[key] =
      typeof value === "string" ? value : JSON.stringify(value)
  }
  return result
}

// User operations with better error handling
export const userOperations = {
  async create(user: Omit<User, "id" | "createdAt">): Promise<User> {
    try {
      const id = Date.now().toString()
      const newUser: User = {
        ...user,
        id,
        createdAt: new Date().toISOString(),
      } as User

      await redis.hset(`user:${id}`, toRedisHash(newUser))
      await redis.sadd("users", id)

      console.log("User created successfully:", id)
      return newUser
    } catch (error) {
      console.error("Error creating user:", error)
      throw new Error("Failed to create user")
    }
  },

  async findByEmail(email: string): Promise<User | null> {
    try {
      const userIdsRaw = await redis.smembers("users")
      const userIds = ensureArray(userIdsRaw)

      for (const id of userIds) {
        try {
          const user = (await redis.hgetall(`user:${id}`)) as unknown as User
          if (user && user.email === email) {
            return user
          }
        } catch (userError) {
          console.warn(`Error fetching user ${id}:`, userError)
          continue
        }
      }
      return null
    } catch (error) {
      console.error("Error finding user by email:", error)
      throw new Error("Failed to find user")
    }
  },

  async findById(id: string): Promise<User | null> {
    try {
      const user = (await redis.hgetall(`user:${id}`)) as unknown as User
      return user && user.id ? user : null
    } catch (error) {
      console.error("Error finding user by ID:", error)
      throw new Error("Failed to find user")
    }
  },

  async getAll(): Promise<User[]> {
    try {
      const userIdsRaw = await redis.smembers("users")
      const userIds = ensureArray(userIdsRaw)
      const users: User[] = []

      for (const id of userIds) {
        try {
          const user = (await redis.hgetall(`user:${id}`)) as unknown as User
          if (user && user.id) users.push(user)
        } catch (userError) {
          console.warn(`Error fetching user ${id}:`, userError)
          continue
        }
      }
      return users
    } catch (error) {
      console.error("Error getting all users:", error)
      throw new Error("Failed to get users")
    }
  },

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const existing = await this.findById(id)
      if (!existing) return null

      const updated = { ...existing, ...updates }
      await redis.hset(`user:${id}`, toRedisHash(updated))
      return updated
    } catch (error) {
      console.error("Error updating user:", error)
      throw new Error("Failed to update user")
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await redis.del(`user:${id}`)
      await redis.srem("users", id)
      return true
    } catch (error) {
      console.error("Error deleting user:", error)
      throw new Error("Failed to delete user")
    }
  },
}

// Product operations
export const productOperations = {
  async create(product: Omit<Product, "id" | "createdAt">): Promise<Product> {
    try {
      const id = Date.now().toString()
      const newProduct: Product = {
        ...product,
        id,
        createdAt: new Date().toISOString(),
      } as Product

      // Store attributes as JSON string for Redis
      const toStore = { ...newProduct, attributes: JSON.stringify(newProduct.attributes) }
      await redis.hset(`product:${id}`, toRedisHash(toStore))
      await redis.sadd("products", id)

      return newProduct
    } catch (error) {
      console.error("Error creating product:", error)
      throw new Error("Failed to create product")
    }
  },

  async getAll(): Promise<Product[]> {
    try {
      const productIdsRaw = await redis.smembers("products")
      const productIds = ensureArray(productIdsRaw)
      const products: Product[] = []

      for (const id of productIds) {
        try {
          const product = (await redis.hgetall(`product:${id}`)) as Record<string, unknown>
          if (product && product.name) {
            // Convert price back to number and attributes back to array
            product.price = Number(product.price) || 0
            if (typeof product.attributes === "string") {
              try {
                product.attributes = JSON.parse(product.attributes)
              } catch {
                product.attributes = []
              }
            } else if (!Array.isArray(product.attributes)) {
              product.attributes = []
            }
            products.push(product as Product)
          }
        } catch (productError) {
          console.warn(`Error fetching product ${id}:`, productError)
          continue
        }
      }

      return products
    } catch (error) {
      console.error("Error getting all products:", error)
      return []
    }
  },

  async findById(id: string): Promise<Product | null> {
    try {
      const product = (await redis.hgetall(`product:${id}`)) as Record<string, unknown>
      if (product && product.name) {
        product.price = Number(product.price) || 0
        if (typeof product.attributes === "string") {
          try {
            product.attributes = JSON.parse(product.attributes)
          } catch {
            product.attributes = []
          }
        } else if (!Array.isArray(product.attributes)) {
          product.attributes = []
        }
        return product as Product
      }
      return null
    } catch (error) {
      console.error("Error finding product:", error)
      return null
    }
  },

  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const existing = await this.findById(id)
      if (!existing) return null

      const updated = { ...existing, ...updates }
      // Store attributes as JSON string
      const toStore = { ...updated, attributes: JSON.stringify(updated.attributes) }
      await redis.hset(`product:${id}`, toRedisHash(toStore))
      return updated
    } catch (error) {
      console.error("Error updating product:", error)
      throw new Error("Failed to update product")
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await redis.del(`product:${id}`)
      await redis.srem("products", id)
      return true
    } catch (error) {
      console.error("Error deleting product:", error)
      throw new Error("Failed to delete product")
    }
  },
}

// Category operations
export const categoryOperations = {
  async create(category: Omit<Category, "id" | "createdAt">): Promise<Category> {
    try {
      const id = Date.now().toString()
      const newCategory: Category = {
        ...category,
        id,
        createdAt: new Date().toISOString(),
      } as Category
      await redis.hset(`category:${id}`, toRedisHash(newCategory))
      await redis.sadd("categories", id)
      return newCategory
    } catch (error) {
      console.error("Error creating category:", error)
      throw new Error("Failed to create category")
    }
  },

  async getAll(): Promise<Category[]> {
    try {
      const categoryIdsRaw = await redis.smembers("categories")
      const categoryIds = ensureArray(categoryIdsRaw)
      const categories: Category[] = []

      for (const id of categoryIds) {
        try {
          const category = (await redis.hgetall(`category:${id}`)) as unknown as Category
          if (category && category.name) {
            categories.push(category)
          }
        } catch (categoryError) {
          console.warn(`Error fetching category ${id}:`, categoryError)
          continue
        }
      }

      return categories
    } catch (error) {
      console.error("Error getting all categories:", error)
      return []
    }
  },

  async findById(id: string): Promise<Category | null> {
    try {
      const category = (await redis.hgetall(`category:${id}`)) as unknown as Category
      return category && category.name ? category : null
    } catch (error) {
      console.error("Error finding category:", error)
      return null
    }
  },

  async update(id: string, updates: Partial<Category>): Promise<Category | null> {
    try {
      const existing = await this.findById(id)
      if (!existing) return null

      const updated = { ...existing, ...updates }
      await redis.hset(`category:${id}`, toRedisHash(updated))
      return updated
    } catch (error) {
      console.error("Error updating category:", error)
      throw new Error("Failed to update category")
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await redis.del(`category:${id}`)
      await redis.srem("categories", id)
      return true
    } catch (error) {
      console.error("Error deleting category:", error)
      throw new Error("Failed to delete category")
    }
  },
}

// Attribute operations
export const attributeOperations = {
  async create(attribute: Omit<Attribute, "id" | "createdAt">): Promise<Attribute> {
    try {
      const id = Date.now().toString()
      const newAttribute: Attribute = {
        ...attribute,
        id,
        createdAt: new Date().toISOString(),
      } as Attribute
      await redis.hset(`attribute:${id}`, toRedisHash(newAttribute))
      await redis.sadd("attributes", id)
      return newAttribute
    } catch (error) {
      console.error("Error creating attribute:", error)
      throw new Error("Failed to create attribute")
    }
  },

  async getAll(): Promise<Attribute[]> {
    try {
      const attributeIdsRaw = await redis.smembers("attributes")
      const attributeIds = ensureArray(attributeIdsRaw)
      const attributes: Attribute[] = []

      for (const id of attributeIds) {
        try {
          const attribute = (await redis.hgetall(`attribute:${id}`)) as unknown as Attribute
          if (attribute && attribute.name) {
            attributes.push(attribute)
          }
        } catch (attributeError) {
          console.warn(`Error fetching attribute ${id}:`, attributeError)
          continue
        }
      }

      return attributes
    } catch (error) {
      console.error("Error getting all attributes:", error)
      return []
    }
  },

  async findById(id: string): Promise<Attribute | null> {
    try {
      const attribute = (await redis.hgetall(`attribute:${id}`)) as unknown as Attribute
      return attribute && attribute.name ? attribute : null
    } catch (error) {
      console.error("Error finding attribute:", error)
      return null
    }
  },

  async update(id: string, updates: Partial<Attribute>): Promise<Attribute | null> {
    try {
      const existing = await this.findById(id)
      if (!existing) return null

      const updated = { ...existing, ...updates }
      await redis.hset(`attribute:${id}`, toRedisHash(updated))
      return updated
    } catch (error) {
      console.error("Error updating attribute:", error)
      throw new Error("Failed to update attribute")
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await redis.del(`attribute:${id}`)
      await redis.srem("attributes", id)
      return true
    } catch (error) {
      console.error("Error deleting attribute:", error)
      throw new Error("Failed to delete attribute")
    }
  },
}

// Order operations
export const orderOperations = {
  async create(order: Omit<Order, "id">): Promise<Order> {
    try {
      const id = Date.now().toString()
      const newOrder: Order = {
        ...order,
        id,
      } as Order
      await redis.hset(`order:${id}`, toRedisHash(newOrder))
      await redis.sadd("orders", id)
      return newOrder
    } catch (error) {
      console.error("Error creating order:", error)
      throw new Error("Failed to create order")
    }
  },

  async getAll(): Promise<Order[]> {
    try {
      const orderIdsRaw = await redis.smembers("orders")
      const orderIds = ensureArray(orderIdsRaw)
      const orders: Order[] = []

      for (const id of orderIds) {
        try {
          const order = (await redis.hgetall(`order:${id}`)) as Record<string, unknown>
          if (order && order.customerName) {
            order.amount = Number(order.amount) || 0
            orders.push(order as Order)
          }
        } catch (orderError) {
          console.warn(`Error fetching order ${id}:`, orderError)
          continue
        }
      }
      return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } catch (error) {
      console.error("Error getting all orders:", error)
      return []
    }
  },

  async findById(id: string): Promise<Order | null> {
    try {
      const order = (await redis.hgetall(`order:${id}`)) as Record<string, unknown>
      if (order && order.customerName) {
        order.amount = Number(order.amount) || 0
        return order as Order
      }
      return null
    } catch (error) {
      console.error("Error finding order:", error)
      return null
    }
  },

  async update(id: string, updates: Partial<Order>): Promise<Order | null> {
    try {
      const existing = await this.findById(id)
      if (!existing) return null

      const updated = { ...existing, ...updates }
      await redis.hset(`order:${id}`, toRedisHash(updated))
      return updated
    } catch (error) {
      console.error("Error updating order:", error)
      throw new Error("Failed to update order")
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await redis.del(`order:${id}`)
      await redis.srem("orders", id)
      return true
    } catch (error) {
      console.error("Error deleting order:", error)
      throw new Error("Failed to delete order")
    }
  },
}

// Analytics operations
export const analyticsOperations = {
  async trackPageView(pageView: {
    path?: string
    userAgent?: string
    ip?: string
    referrer?: string
    timestamp?: string
    sessionId?: string
    userId?: string
  }): Promise<void> {
    try {
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Get country from IP address
      const country = await getCountryFromIP(pageView.ip || "unknown")

      // Filter out null/undefined values and ensure all values are strings
      const cleanPageView: PageView = {
        id,
        path: pageView.path || "/",
        userAgent: pageView.userAgent || "",
        ip: pageView.ip || "unknown",
        country: country,
        referrer: pageView.referrer || "",
        timestamp: pageView.timestamp || new Date().toISOString(),
        sessionId: pageView.sessionId || "",
        userId: pageView.userId || "",
      }

      // Convert to string values for Redis
      const redisData: Record<string, string> = {
        id: cleanPageView.id,
        path: cleanPageView.path,
        userAgent: cleanPageView.userAgent,
        ip: cleanPageView.ip,
        country: cleanPageView.country,
        referrer: cleanPageView.referrer,
        timestamp: cleanPageView.timestamp,
        sessionId: cleanPageView.sessionId,
        userId: cleanPageView.userId || "",
      }

      await redis.hset(`pageview:${id}`, toRedisHash(redisData))
      await redis.sadd("pageviews", id)

      // Also store in daily aggregation for faster queries
      const date = new Date(cleanPageView.timestamp).toISOString().split("T")[0]
      await redis.hincrby(`daily_views:${date}`, cleanPageView.path, 1)
      await redis.hincrby(`daily_total:${date}`, "views", 1)

      // Track unique visitors by session
      await redis.sadd(`unique_visitors:${date}`, cleanPageView.sessionId)

      // Track referrers (only if not empty)
      if (cleanPageView.referrer && cleanPageView.referrer.trim() !== "") {
        await redis.hincrby(`referrers:${date}`, cleanPageView.referrer, 1)
      }

      // Track countries
      await redis.hincrby(`countries:${date}`, cleanPageView.country, 1)
    } catch (error) {
      console.error("Error tracking page view:", error)
    }
  },

  async getAnalytics(days = 7): Promise<AnalyticsData> {
    try {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000)

      let totalPageViews = 0
      let uniqueVisitors = 0
      const dailyViews: { date: string; views: number }[] = []
      const topPages: { [key: string]: number } = {}
      const referrers: { [key: string]: number } = {}
      const countries: { [key: string]: number } = {}

      // Get data for each day
      const currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0]

        try {
          // Get daily total views
          const dailyTotal = await redis.hget(`daily_total:${dateStr}`, "views")
          const views = dailyTotal ? Number.parseInt(dailyTotal.toString()) : 0
          totalPageViews += views

          dailyViews.push({
            date: dateStr,
            views: views,
          })

          // Get unique visitors for this day
          const uniqueVisitorsSetRaw = await redis.smembers(`unique_visitors:${dateStr}`)
          const uniqueVisitorsSet = ensureArray(uniqueVisitorsSetRaw)
          uniqueVisitors += uniqueVisitorsSet.length

          // Get page views for this day
          const dailyPageViews = await redis.hgetall(`daily_views:${dateStr}`)
          if (dailyPageViews && typeof dailyPageViews === "object") {
            for (const [path, count] of Object.entries(dailyPageViews)) {
              if (path && count) {
                const countNum = Number.parseInt(count.toString())
                if (!isNaN(countNum)) {
                  topPages[path] = (topPages[path] || 0) + countNum
                }
              }
            }
          }

          // Get referrers for this day
          const dailyReferrers = await redis.hgetall(`referrers:${dateStr}`)
          if (dailyReferrers && typeof dailyReferrers === "object") {
            for (const [referrer, count] of Object.entries(dailyReferrers)) {
              if (referrer && count) {
                const countNum = Number.parseInt(count.toString())
                if (!isNaN(countNum)) {
                  referrers[referrer] = (referrers[referrer] || 0) + countNum
                }
              }
            }
          }

          // Get countries for this day
          const dailyCountries = await redis.hgetall(`countries:${dateStr}`)
          if (dailyCountries && typeof dailyCountries === "object") {
            for (const [country, count] of Object.entries(dailyCountries)) {
              if (country && count) {
                const countNum = Number.parseInt(count.toString())
                if (!isNaN(countNum)) {
                  countries[country] = (countries[country] || 0) + countNum
                }
              }
            }
          }
        } catch (dayError) {
          console.error(`Error processing date ${dateStr}:`, dayError)
          // Continue with next day instead of failing completely
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Sort and limit top pages
      const sortedPages = Object.entries(topPages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([path, views]) => ({ path, views }))

      // Sort and limit referrers
      const sortedReferrers = Object.entries(referrers)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([source, views]) => ({ source, views }))

      // Sort and calculate percentages for countries
      const totalCountryViews = Object.values(countries).reduce((sum, count) => sum + count, 0)
      const sortedCountries = Object.entries(countries)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([country, views]) => ({
          country,
          views,
          percentage: totalCountryViews > 0 ? Math.round((views / totalCountryViews) * 100) : 0,
        }))

      return {
        totalPageViews,
        uniqueVisitors,
        topPages: sortedPages,
        dailyViews: dailyViews.sort((a, b) => a.date.localeCompare(b.date)),
        referrers: sortedReferrers,
        countries: sortedCountries,
      }
    } catch (error) {
      console.error("Error getting analytics:", error)
      return {
        totalPageViews: 0,
        uniqueVisitors: 0,
        topPages: [],
        dailyViews: [],
        referrers: [],
        countries: [],
      }
    }
  },
}

// Session operations
export const sessionOperations = {
  async create(userId: string): Promise<string> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await redis.setex(`session:${sessionId}`, 86400 * 7, userId) // 7 days
      return sessionId
    } catch (error) {
      console.error("Error creating session:", error)
      throw new Error("Failed to create session")
    }
  },

  async get(sessionId: string): Promise<string | null> {
    try {
      return await redis.get(`session:${sessionId}`)
    } catch (error) {
      console.error("Error getting session:", error)
      return null
    }
  },

  async delete(sessionId: string): Promise<void> {
    try {
      await redis.del(`session:${sessionId}`)
    } catch (error) {
      console.error("Error deleting session:", error)
    }
  },
}