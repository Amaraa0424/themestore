export const mockData = {
  categories: [
    {
      id: "1",
      name: "Landing Pages",
      description: "Beautiful landing page templates",
    },
    {
      id: "2",
      name: "E-commerce",
      description: "Online store and shopping templates",
    },
    {
      id: "3",
      name: "Dashboards",
      description: "Admin and analytics dashboard templates",
    },
    {
      id: "4",
      name: "Portfolios",
      description: "Creative portfolio and showcase templates",
    },
  ],

  attributes: [
    {
      id: "1",
      name: "Responsive",
      description: "Mobile-friendly design",
    },
    {
      id: "2",
      name: "Dark Mode",
      description: "Includes dark theme support",
    },
    {
      id: "3",
      name: "Animation",
      description: "Includes smooth animations",
    },
    {
      id: "4",
      name: "SEO Optimized",
      description: "Search engine optimized",
    },
    {
      id: "5",
      name: "Fast Loading",
      description: "Optimized for speed",
    },
    {
      id: "6",
      name: "Modern Design",
      description: "Contemporary and trendy design",
    },
  ],

  products: [
    {
      id: "1",
      name: "SaaS Landing Pro",
      description:
        "Modern SaaS landing page template with hero section, features, pricing, and testimonials. Perfect for software companies.",
      price: 49,
      categoryId: "1",
      attributes: ["1", "2", "3", "4"],
      previewUrl: "https://example.com/saas-landing-preview",
    },
    {
      id: "2",
      name: "E-Shop Master",
      description:
        "Complete e-commerce template with product catalog, shopping cart, checkout, and admin panel. Ready to launch your online store.",
      price: 89,
      categoryId: "2",
      attributes: ["1", "4", "5"],
      previewUrl: "https://example.com/eshop-preview",
    },
    {
      id: "3",
      name: "Analytics Dashboard",
      description:
        "Professional analytics dashboard with charts, tables, and data visualization components. Perfect for business intelligence.",
      price: 69,
      categoryId: "3",
      attributes: ["1", "2", "6"],
      previewUrl: "https://example.com/analytics-preview",
    },
    {
      id: "4",
      name: "Creative Portfolio",
      description:
        "Stunning portfolio template for designers, photographers, and creative professionals. Showcase your work beautifully.",
      price: 39,
      categoryId: "4",
      attributes: ["1", "3", "6"],
      previewUrl: "https://example.com/portfolio-preview",
    },
    {
      id: "5",
      name: "Startup Landing",
      description: "Clean and modern landing page template designed specifically for startups and new businesses.",
      price: 29,
      categoryId: "1",
      attributes: ["1", "4", "5"],
      previewUrl: "https://example.com/startup-preview",
    },
    {
      id: "6",
      name: "Fashion Store",
      description: "Elegant e-commerce template for fashion and clothing brands with beautiful product galleries.",
      price: 79,
      categoryId: "2",
      attributes: ["1", "2", "3", "6"],
      previewUrl: "https://example.com/fashion-preview",
    },
  ],

  orders: [
    {
      id: "1001",
      productId: "1",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      customerPhone: "+1234567890",
      amount: 49,
      status: "pending",
      date: "2024-01-15T10:30:00Z",
    },
    {
      id: "1002",
      productId: "2",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      customerPhone: "+1234567891",
      amount: 89,
      status: "completed",
      date: "2024-01-14T15:45:00Z",
    },
    {
      id: "1003",
      productId: "3",
      customerName: "Mike Johnson",
      customerEmail: "mike@example.com",
      customerPhone: "+1234567892",
      amount: 69,
      status: "pending",
      date: "2024-01-13T09:15:00Z",
    },
  ],
}
