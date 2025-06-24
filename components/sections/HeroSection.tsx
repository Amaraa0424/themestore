import React, { forwardRef, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { Navbar } from '@/components/navbar'
import type { User as UserType } from '@/lib/redis'
import { 
  ArrowRight,
  Sparkles,
  Rocket,
  Heart,
  Globe
} from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface HeroSectionProps {
  user?: UserType | null
  onLogout?: () => void
}

const HeroSection = forwardRef<HTMLElement, HeroSectionProps>(({ user, onLogout }, ref) => {
  const { t } = useLanguage()
  const heroAnimationRef = useRef<HTMLElement>(null)
  const actualRef = (ref as React.MutableRefObject<HTMLElement>) || heroAnimationRef

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Advanced Hero animations with split text effect
      const heroTitle = document.querySelector('.hero-title h1')
      if (heroTitle) {
        const words = heroTitle.textContent?.split(' ') || []
        heroTitle.innerHTML = words.map(word => 
          `<span class="word">${word.split('').map(char => 
            `<span class="char" style="display: inline-block;">${char}</span>`
          ).join('')}</span>`
        ).join(' ')
      }

      const masterTl = gsap.timeline()
      
      // Hero entrance with dramatic effect
      masterTl
        .fromTo('.hero-title .char', 
          { 
            y: 200, 
            opacity: 0, 
            rotation: 180,
            scale: 0.3
          },
          { 
            y: 0, 
            opacity: 1, 
            rotation: 0,
            scale: 1,
            duration: 1.2, 
            ease: 'back.out(2)',
            stagger: {
              each: 0.03,
              from: 'center'
            }
          }
        )
        .fromTo('.hero-subtitle', 
          { y: 100, opacity: 0, rotationX: 90 },
          { y: 0, opacity: 1, rotationX: 0, duration: 1, ease: 'power3.out' },
          '-=0.8'
        )
        .fromTo('.hero-buttons', 
          { y: 80, opacity: 0, scale: 0.8 },
          { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' },
          '-=0.5'
        )

      // Advanced parallax with multiple layers
      gsap.to('.parallax-slow', {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: actualRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      })

      gsap.to('.parallax-fast', {
        yPercent: -70,
        ease: 'none',
        scrollTrigger: {
          trigger: actualRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5
        }
      })

    }, actualRef)

    return () => ctx.revert()
  }, [])

  return (
    <>
      {/* Use shared navbar component */}
      <Navbar user={user} onLogout={onLogout} />

      {/* Hero Section - Responsive */}
      <section ref={actualRef} className="relative py-24 md:py-48 lg:py-64 min-h-screen flex items-center justify-center overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8 md:space-y-12">
            {/* Enhanced Decorative Elements - Hidden on mobile */}
            <div className="hidden md:block absolute top-32 left-10 floating-advanced">
              <Sparkles className="h-8 md:h-12 w-8 md:w-12 text-primary/40" />
            </div>
            <div className="hidden md:block absolute top-48 right-16 floating-advanced">
              <Rocket className="h-6 md:h-10 w-6 md:w-10 text-primary/30" />
            </div>
            <div className="hidden lg:block absolute top-60 left-1/4 floating-advanced">
              <Heart className="h-6 md:h-8 w-6 md:w-8 text-pink-500/40" />
            </div>
            <div className="hidden lg:block absolute top-80 right-1/3 floating-advanced">
              <Globe className="h-6 md:h-10 w-6 md:w-10 text-blue-500/30" />
            </div>
            
            <div className="hero-title">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-tight px-4">
                {t("heroTitle")}
              </h1>
            </div>
            
            <div className="hero-subtitle">
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-4">
                {t("heroDescription")}
              </p>
            </div>
            
            <div className="hero-buttons flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center px-4">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto magnetic-advanced text-lg md:text-xl px-8 md:px-12 py-6 md:py-8 rounded-full">
                  {t("browseTemplates")}
                  <ArrowRight className="ml-2 md:ml-3 h-5 md:h-6 w-5 md:w-6" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto magnetic-advanced text-lg md:text-xl px-8 md:px-12 py-6 md:py-8 rounded-full">
                {t("learnMore")}
                <Sparkles className="ml-2 md:ml-3 h-5 md:h-6 w-5 md:w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Parallax Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="parallax-slow absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl" />
          <div className="parallax-fast absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-lg" />
          <div className="parallax-slow absolute bottom-32 left-1/4 w-28 h-28 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-lg" />
        </div>
      </section>
    </>
  )
})

HeroSection.displayName = 'HeroSection'

export default HeroSection 