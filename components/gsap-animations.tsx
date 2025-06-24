"use client"

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Enhanced Product Card Animation
export const useProductCardAnimation = () => {
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Product cards entrance with stagger
      gsap.fromTo('.product-card', 
        { 
          y: 120, 
          opacity: 0, 
          scale: 0.8,
          rotationY: 25,
          rotationX: 15
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotationY: 0,
          rotationX: 0,
          duration: 1.2,
          ease: 'power3.out',
          stagger: {
            amount: 1.2,
            from: 'start'
          },
          scrollTrigger: {
            trigger: '.products-grid',
            start: 'top 90%',
            end: 'bottom 10%',
            toggleActions: 'play none none reverse'
          }
        }
      )

      // Parallax effect for product grid
      gsap.to('.products-grid', {
        y: -100,
        ease: 'none',
        scrollTrigger: {
          trigger: '.products-grid',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2
        }
      })

      // Enhanced scroll-triggered animations for individual elements
      gsap.utils.toArray('.product-card').forEach((card: any, index: number) => {
        gsap.fromTo(card, 
          { y: 50 + (index % 3) * 20, opacity: 0.8 },
          {
            y: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1
            }
          }
        )
      })

      // Hover animations for product cards
      document.querySelectorAll('.product-card').forEach((card: any) => {
        const image = card.querySelector('.product-image')
        const content = card.querySelector('.product-content')
        
        card.addEventListener('mouseenter', () => {
          gsap.to(card, { 
            y: -10, 
            scale: 1.02,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            duration: 0.3, 
            ease: 'power2.out' 
          })
          if (image) {
            gsap.to(image, { 
              scale: 1.05, 
              duration: 0.3, 
              ease: 'power2.out' 
            })
          }
          if (content) {
            gsap.to(content, { 
              y: -5, 
              duration: 0.3, 
              ease: 'power2.out' 
            })
          }
        })
        
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { 
            y: 0, 
            scale: 1,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            duration: 0.3, 
            ease: 'power2.out' 
          })
          if (image) {
            gsap.to(image, { 
              scale: 1, 
              duration: 0.3, 
              ease: 'power2.out' 
            })
          }
          if (content) {
            gsap.to(content, { 
              y: 0, 
              duration: 0.3, 
              ease: 'power2.out' 
            })
          }
        })
      })
    })

    return () => ctx.revert()
  }, [])
}

// Page Load Animation
export const usePageLoadAnimation = () => {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      
      tl.fromTo('.page-header', 
        { y: -80, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }
      )
      .fromTo('.search-filters', 
        { y: 60, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo('.sidebar-filters', 
        { x: -60, opacity: 0, rotationY: -15 },
        { x: 0, opacity: 1, rotationY: 0, duration: 0.7, ease: 'power3.out' },
        '-=0.3'
      )

      // Background color is handled by CSS themes
    })

    return () => ctx.revert()
  }, [])
}

// Scroll Progress Indicator
export const ScrollProgressIndicator = () => {
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(progressRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        }
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
      <div 
        ref={progressRef}
        className="h-full bg-gradient-to-r from-primary to-primary/60 origin-left scale-x-0"
      />
    </div>
  )
}

// Filter Animation
export const useFilterAnimation = () => {
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Filter items animation
      gsap.fromTo('.filter-item', 
        { x: -20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.filters-container',
            start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    })

    return () => ctx.revert()
  }, [])
}

// Loading Animation
export const LoadingSpinner = () => {
  const spinnerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(spinnerRef.current, {
        rotation: 360,
        duration: 1,
        ease: 'none',
        repeat: -1
      })

      gsap.fromTo('.loading-text', 
        { opacity: 0.5 },
        { 
          opacity: 1, 
          duration: 1,
          yoyo: true,
          repeat: -1,
          ease: 'power2.inOut'
        }
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div 
          ref={spinnerRef}
          className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-4"
        />
        <p className="loading-text text-lg text-muted-foreground">
          Loading premium themes...
        </p>
      </div>
    </div>
  )
}

// Magnetic Button Effect
export const useMagneticEffect = () => {
  useEffect(() => {
    const ctx = gsap.context(() => {
      document.querySelectorAll('.magnetic-btn').forEach((button: any) => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = button.getBoundingClientRect()
          const x = e.clientX - rect.left - rect.width / 2
          const y = e.clientY - rect.top - rect.height / 2
          
          gsap.to(button, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.3,
            ease: 'power2.out'
          })
        }

        const handleMouseLeave = () => {
          gsap.to(button, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.3)'
          })
        }

        button.addEventListener('mousemove', handleMouseMove)
        button.addEventListener('mouseleave', handleMouseLeave)
      })
    })

    return () => ctx.revert()
  }, [])
}
