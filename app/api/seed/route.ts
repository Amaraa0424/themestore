import { NextResponse } from "next/server"
import { productOperations, categoryOperations, attributeOperations, userOperations } from "@/lib/redis"
import { hashPassword } from "@/lib/auth"
import { withAdminAuth } from "@/lib/auth-middleware"

// Only allow seeding in development mode and only by admins
async function handlePost() {
  // Security check: Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ 
      error: "Seeding is only allowed in development mode" 
    }, { status: 403 })
  }

  try {
    // Create demo users
    const adminPassword = await hashPassword("admin123")
    const userPassword = await hashPassword("user123")

    await userOperations.create({
      email: "admin@demo.com",
      password: adminPassword,
      name: "Admin User",
      role: "admin",
    })

    await userOperations.create({
      email: "user@demo.com",
      password: userPassword,
      name: "Demo User",
      role: "user",
    })

    // Create categories
    const categories = [
      {
        name: "Landing Pages",
        description: "Beautiful landing page templates",
      },
      {
        name: "E-commerce",
        description: "Online store and shopping templates",
      },
      {
        name: "Dashboards",
        description: "Admin and analytics dashboard templates",
      },
      {
        name: "Portfolios",
        description: "Creative portfolio and showcase templates",
      },
    ]

    const createdCategories = []
    for (const category of categories) {
      const created = await categoryOperations.create(category)
      createdCategories.push(created)
    }

    // Create attributes
    const attributes = [
      {
        name: "Responsive",
        description: "Mobile-friendly design",
      },
      {
        name: "Dark Mode",
        description: "Includes dark theme support",
      },
      {
        name: "Animation",
        description: "Includes smooth animations",
      },
      {
        name: "SEO Optimized",
        description: "Search engine optimized",
      },
      {
        name: "Fast Loading",
        description: "Optimized for speed",
      },
      {
        name: "Modern Design",
        description: "Contemporary and trendy design",
      },
    ]

    const createdAttributes = []
    for (const attribute of attributes) {
      const created = await attributeOperations.create(attribute)
      createdAttributes.push(created)
    }

    // Create products with both English and Mongolian descriptions
    const products = [
      {
        name: "SaaS Landing Pro",
        description:
          "Modern SaaS landing page template with hero section, features, pricing, and testimonials. Perfect for software companies.",
        descriptionMn:
          "Орчин үеийн SaaS нүүр хуудасны загвар. Баатар хэсэг, онцлогууд, үнэ, гэрчилгээтэй. Програм хангамжийн компаниудад тохиромжтой.",
        price: 49,
        categoryId: createdCategories[0].id,
        attributes: [
          createdAttributes[0].id,
          createdAttributes[1].id,
          createdAttributes[2].id,
          createdAttributes[3].id,
        ],
        previewUrl: "https://example.com/saas-landing-preview",
      },
      {
        name: "E-Shop Master",
        description:
          "Complete e-commerce template with product catalog, shopping cart, checkout, and admin panel. Ready to launch your online store.",
        descriptionMn:
          "Бүрэн цахим худалдааны загвар. Бүтээгдэхүүний каталог, сагс, төлбөр тооцоо, админ самбартай. Онлайн дэлгүүр нээхэд бэлэн.",
        price: 89,
        categoryId: createdCategories[1].id,
        attributes: [createdAttributes[0].id, createdAttributes[3].id, createdAttributes[4].id],
        previewUrl: "https://example.com/eshop-preview",
      },
      {
        name: "Analytics Dashboard",
        description:
          "Professional analytics dashboard with charts, tables, and data visualization components. Perfect for business intelligence.",
        descriptionMn:
          "Мэргэжлийн аналитик самбар. График, хүснэгт, өгөгдлийн дүрслэлтэй. Бизнесийн оюун ухаанд тохиромжтой.",
        price: 69,
        categoryId: createdCategories[2].id,
        attributes: [createdAttributes[0].id, createdAttributes[1].id, createdAttributes[5].id],
        previewUrl: "https://example.com/analytics-preview",
      },
      {
        name: "Creative Portfolio",
        description:
          "Stunning portfolio template for designers, photographers, and creative professionals. Showcase your work beautifully.",
        descriptionMn:
          "Гайхалтай портфолио загвар. Дизайнер, гэрэл зурагчин, бүтээлч мэргэжилтнүүдэд зориулсан. Бүтээлээ гоёмсог харуулна уу.",
        price: 39,
        categoryId: createdCategories[3].id,
        attributes: [createdAttributes[0].id, createdAttributes[2].id, createdAttributes[5].id],
        previewUrl: "https://example.com/portfolio-preview",
      },
      {
        name: "Startup Landing",
        description: "Clean and modern landing page template designed specifically for startups and new businesses.",
        descriptionMn: "Цэвэрхэн, орчин үеийн нүүр хуудасны загвар. Шинэ бизнес, стартапуудад тусгайлан зориулсан.",
        price: 29,
        categoryId: createdCategories[0].id,
        attributes: [createdAttributes[0].id, createdAttributes[3].id, createdAttributes[4].id],
        previewUrl: "https://example.com/startup-preview",
      },
      {
        name: "Fashion Store",
        description: "Elegant e-commerce template for fashion and clothing brands with beautiful product galleries.",
        descriptionMn: "Загварын дэлгүүрт зориулсан дэгжин цахим худалдааны загвар. Гоё бүтээгдэхүүний галерейтай.",
        price: 79,
        categoryId: createdCategories[1].id,
        attributes: [
          createdAttributes[0].id,
          createdAttributes[1].id,
          createdAttributes[2].id,
          createdAttributes[5].id,
        ],
        previewUrl: "https://example.com/fashion-preview",
      },
    ]

    for (const product of products) {
      await productOperations.create(product)
    }

    return NextResponse.json({ 
      message: "Database seeded successfully (development mode only)",
      warning: "This endpoint is disabled in production"
    })
  } catch (error) {
    console.error("Seeding error:", error)
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
  }
}

export const POST = withAdminAuth(handlePost)
