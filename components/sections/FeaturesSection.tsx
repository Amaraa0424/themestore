import React, { forwardRef, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/contexts/language-context'
import { 
  Palette, 
  Zap, 
  Shield, 
  Users, 
  Code,
  Layers
} from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

interface FeaturesSectionProps {
  features: Feature[]
}

const FeaturesSection = forwardRef<HTMLElement, FeaturesSectionProps>(({ features }, ref) => {
  const { t } = useLanguage()
  const featuresAnimationRef = useRef<HTMLElement>(null)
  const actualRef = (ref as React.MutableRefObject<HTMLElement>) || featuresAnimationRef

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Enhanced Feature Section Animations
      gsap.fromTo('.feature-card', 
        { 
          y: 100, 
          opacity: 0, 
          scale: 0.8
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power2.out',
          stagger: 0.2,
          scrollTrigger: {
            trigger: actualRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      )

      // Feature icons animation
      gsap.fromTo('.feature-icon', 
        { 
          scale: 0,
          rotation: 180,
          opacity: 0
        },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'back.out(1.7)',
          stagger: 0.1,
          scrollTrigger: {
            trigger: actualRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        }
      )

      // Advanced magnetic effect for feature cards
      document.querySelectorAll('.feature-card').forEach((element: any) => {
        element.addEventListener('mouseenter', (e: MouseEvent) => {
          gsap.to(element, { 
            scale: 1.05, 
            y: -10,
            rotationY: 5,
            duration: 0.4, 
            ease: 'power2.out' 
          })
        })
        
        element.addEventListener('mouseleave', () => {
          gsap.to(element, { 
            scale: 1, 
            y: 0,
            rotationY: 0,
            duration: 0.5, 
            ease: 'power2.out' 
          })
        })
      })

    }, actualRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={actualRef} className="py-24 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-reveal">
            {t("featuresTitle")}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card p-8 rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300 magnetic-advanced floating-advanced"
            >
              <div className="feature-icon text-primary mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

FeaturesSection.displayName = 'FeaturesSection'

export default FeaturesSection 