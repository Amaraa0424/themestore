"use client"

import React, { useState, useEffect } from 'react'
import {
  Palette,
  Zap,
  Shield,
  Users,
  Code,
  Layers,
  Search,
  Rocket
} from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import type { User as UserType } from '@/lib/redis'

// Import section components
import HeroSection from '@/components/sections/HeroSection'
import FeaturesSection from '@/components/sections/FeaturesSection'
import StatsSection from '@/components/sections/StatsSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import ProcessSection from '@/components/sections/ProcessSection'
import CTASection from '@/components/sections/CTASection'
import FooterSection from '@/components/sections/FooterSection'
import BackgroundElements from '@/components/sections/BackgroundElements'
import ProductGallery from '@/components/sections/ProductGallery'

const HomePage = () => {
  const { t } = useLanguage()
  const [user, setUser] = useState<UserType | null>(null)

  useEffect(() => {
    // Check for user session
    const sessionId = localStorage.getItem("sessionId")
    const userData = localStorage.getItem("user")
    if (sessionId && userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

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

  // Sample products data for gallery (you can replace this with API data)
  const sampleProducts = [
    {
      id: "1",
      name: "SaaS Landing Pro",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop",
      price: 120000,
      previewUrl: "https://example.com/saas-landing-preview"
    },
    {
      id: "2",
      name: "E-Shop Master",
      imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&h=300&fit=crop",
      price: 50000,
      previewUrl: "https://example.com/eshop-preview"
    },
    {
      id: "3",
      name: "Analytics Dashboard",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop",
      price: 75000,
      previewUrl: "https://example.com/analytics-preview"
    },
    {
      id: "4",
      name: "Creative Portfolio",
      imageUrl: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=500&h=300&fit=crop",
      price: 300000,
      previewUrl: "https://example.com/portfolio-preview"
    },
    {
      id: "5",
      name: "Startup Landing",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop",
      price: 290000,
      previewUrl: "https://example.com/startup-preview"
    },
    {
      id: "6",
      name: "Mobile App Landing",
      imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=300&fit=crop",
      price: 5000000,
      previewUrl: "https://example.com/mobile-app-preview"
    }
  ]

  // Data for each section
  const features = [
    {
      icon: <Palette className="h-8 w-8" />,
      title: t("premiumThemes"),
      description: t("premiumThemesDesc")
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: t("lightningFast"),
      description: t("lightningFastDesc")
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: t("secureReliable"),
      description: t("secureReliableDesc")
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: t("developerFriendly"),
      description: t("developerFriendlyDesc")
    },
    {
      icon: <Layers className="h-8 w-8" />,
      title: t("multiPurpose"),
      description: t("multiPurposeDesc")
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: t("support247"),
      description: t("support247Desc")
    }
  ]

  const stats = [
    { number: 20, label: t("premiumThemesCount"), suffix: "+" },
    { number: 85, label: t("happyCustomers"), suffix: "+" },
    { number: 75, label: t("satisfactionRate"), suffix: "%" },
    { number: 24, label: t("supportHours"), suffix: "/7" }
  ]

  const testimonials = [
    {
      name: t("testimonialSarahName"),
      role: t("testimonialSarahRole"),
      content: t("testimonialSarah"),
      rating: 5
    },
    {
      name: t("testimonialMichaelName"),
      role: t("testimonialMichaelRole"),
      content: t("testimonialMichael"),
      rating: 5
    },
    {
      name: t("testimonialEmilyName"),
      role: t("testimonialEmilyRole"),
      content: t("testimonialEmily"),
      rating: 5
    }
  ]

  const processSteps = [
    {
      step: "01",
      title: t("browseChoose"),
      description: t("browseChooseDesc"),
      icon: <Search className="h-10 w-10" />
    },
    {
      step: "02",
      title: t("customizeBuild"),
      description: t("customizeBuildDesc"),
      icon: <Code className="h-10 w-10" />
    },
    {
      step: "03",
      title: t("launchSucceed"),
      description: t("launchSucceedDesc"),
      icon: <Rocket className="h-10 w-10" />
    }
  ]

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <BackgroundElements />
      <HeroSection user={user} onLogout={handleLogout} />
      <FeaturesSection features={features} />
      <ProductGallery products={sampleProducts} />
      <StatsSection stats={stats} />
      <TestimonialsSection testimonials={testimonials} />
      <ProcessSection steps={processSteps} />
      <CTASection />
      <FooterSection />
    </div>
  )
}

export default HomePage