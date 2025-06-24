import React, { forwardRef, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Stat {
  number: number
  label: string
  suffix: string
}

interface StatsSectionProps {
  stats: Stat[]
}

const StatsSection = forwardRef<HTMLElement, StatsSectionProps>(({ stats }, ref) => {
  const statsAnimationRef = useRef<HTMLElement>(null)
  const actualRef = (ref as React.MutableRefObject<HTMLElement>) || statsAnimationRef

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stats section animations
      gsap.fromTo('.stat-container', 
        { 
          y: 80,
          opacity: 0,
          scale: 0.9
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

      // Stats numbers counter animation
      gsap.fromTo('.stat-number', 
        { 
          textContent: 0
        },
        {
          textContent: (i: number, target: any) => target.getAttribute('data-value'),
          duration: 2,
          ease: 'power2.out',
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: actualRef.current,
            start: 'top 70%',
            toggleActions: 'play none none none'
          }
        }
      )

      // Stats labels animation
      gsap.fromTo('.stat-label', 
        { 
          y: 30,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: actualRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        }
      )

    }, actualRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={actualRef} className="py-24 lg:py-32 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="stat-container text-center">
              <div className="text-4xl md:text-6xl font-bold text-primary mb-2">
                <span 
                  className="stat-number" 
                  data-value={stat.number}
                >
                  0
                </span>
                {stat.suffix}
              </div>
              <p className="stat-label text-lg text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

StatsSection.displayName = 'StatsSection'

export default StatsSection 