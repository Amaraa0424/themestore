import React, { forwardRef, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface CTASectionProps { }

const CTASection = forwardRef<HTMLElement, CTASectionProps>((props, ref) => {
  const { t } = useLanguage()
  const ctaAnimationRef = useRef<HTMLElement>(null)
  const actualRef = (ref as React.MutableRefObject<HTMLElement>) || ctaAnimationRef

  useEffect(() => {
    const ctx = gsap.context(() => {
      // CTA section animation
      gsap.fromTo('.cta-content',
        {
          y: 80,
          opacity: 0,
          scale: 0.95
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: actualRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      )

      // CTA buttons animation
      gsap.fromTo('.cta-button',
        {
          y: 50,
          opacity: 0,
          scale: 0.9
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.2,
          scrollTrigger: {
            trigger: actualRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        }
      )

      // Advanced magnetic effect for CTA buttons
      document.querySelectorAll('.cta-button').forEach((element: any) => {
        element.addEventListener('mouseenter', (e: MouseEvent) => {
          gsap.to(element, {
            scale: 1.05,
            y: -5,
            duration: 0.3,
            ease: 'power2.out'
          })
        })

        element.addEventListener('mouseleave', () => {
          gsap.to(element, {
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out'
          })
        })
      })

    }, actualRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={actualRef} className="py-48 lg:py-64 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
      <div className="container mx-auto px-4">
        <div className="cta-content text-center space-y-12">
          <h2 className="text-4xl md:text-6xl font-bold text-reveal">
            {t("ctaTitle")}
          </h2>
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto">
            {t("ctaDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/products">
              <Button size="lg" className="cta-button magnetic-advanced text-xl px-12 py-8 rounded-full">
                {t("startBuildingToday")}
                <Download className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="cta-button magnetic-advanced text-xl px-12 py-8 rounded-full" onClick={() => {
              window.open('https://m.me/61577715569612', '_blank')
            }}>
              {t("contactSales")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
})

CTASection.displayName = 'CTASection'

export default CTASection 