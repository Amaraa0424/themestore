import React, { forwardRef, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface BackgroundElementsProps {}

const BackgroundElements = forwardRef<HTMLDivElement, BackgroundElementsProps>((props, ref) => {
  const backgroundAnimationRef = useRef<HTMLDivElement>(null)
  const actualRef = (ref as React.MutableRefObject<HTMLDivElement>) || backgroundAnimationRef

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create floating particles
      const createParticles = () => {
        const particles = []
        for (let i = 0; i < 50; i++) {
          const particle = document.createElement('div')
          particle.className = 'particle absolute w-2 h-2 bg-primary/20 rounded-full'
          particle.style.left = Math.random() * 100 + '%'
          particle.style.top = Math.random() * 100 + '%'
          actualRef.current?.appendChild(particle)
          particles.push(particle)
        }
        
        particles.forEach((particle, i) => {
          gsap.to(particle, {
            x: () => Math.random() * 400 - 200,
            y: () => Math.random() * 400 - 200,
            opacity: () => Math.random() * 0.5 + 0.1,
            scale: () => Math.random() * 2 + 0.5,
            duration: () => Math.random() * 10 + 5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.1
          })
        })
      }
      createParticles()

      // Rotating background shapes
      gsap.to('.morph-shape-1', {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: 'none'
      })

      gsap.to('.morph-shape-2', {
        rotation: -360,
        duration: 25,
        repeat: -1,
        ease: 'none'
      })

      // Continuous background animation
      gsap.to('.animated-gradient', {
        backgroundPosition: '200% 0%',
        duration: 8,
        repeat: -1,
        ease: 'none'
      })

      // Floating elements with advanced physics
      gsap.utils.toArray('.floating-advanced').forEach((element: any, index) => {
        const tl = gsap.timeline({ repeat: -1, yoyo: true })
        tl.to(element, {
          y: -30 - (index * 10),
          x: Math.sin(index) * 15,
          rotation: Math.cos(index) * 10,
          duration: 3 + (index * 0.5),
          ease: 'sine.inOut'
        })
      })

      // Advanced magnetic effect for interactive elements
      document.querySelectorAll('.magnetic-advanced').forEach((element: any) => {
        element.addEventListener('mouseenter', (e: MouseEvent) => {
          gsap.to(element, { 
            scale: 1.08, 
            rotationY: 5,
            rotationX: 5,
            duration: 0.4, 
            ease: 'power2.out' 
          })
        })
        
        element.addEventListener('mousemove', (e: MouseEvent) => {
          const rect = element.getBoundingClientRect()
          const x = e.clientX - rect.left - rect.width / 2
          const y = e.clientY - rect.top - rect.height / 2
          
          gsap.to(element, {
            x: x * 0.1,
            y: y * 0.1,
            rotationY: x * 0.02,
            rotationX: -y * 0.02,
            duration: 0.3,
            ease: 'power2.out'
          })
        })
        
        element.addEventListener('mouseleave', () => {
          gsap.to(element, { 
            scale: 1, 
            x: 0,
            y: 0,
            rotationY: 0,
            rotationX: 0,
            duration: 0.5, 
            ease: 'power2.out' 
          })
        })
      })

      // Text reveal animation for sections
      gsap.utils.toArray('.text-reveal').forEach((element: any) => {
        const text = element.textContent
        element.innerHTML = text.split('').map((char: string) => 
          `<span style="display: inline-block; opacity: 0; transform: translateY(50px);">${char === ' ' ? '&nbsp;' : char}</span>`
        ).join('')
        
        gsap.to(element.querySelectorAll('span'), {
          opacity: 1,
          y: 0,
          duration: 0.05,
          stagger: 0.02,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        })
      })

      // Smooth scroll reveal with enhanced effects
      gsap.utils.toArray('.reveal-enhanced').forEach((element: any) => {
        gsap.fromTo(element, 
          { 
            y: 80, 
            opacity: 0,
            scale: 0.95,
            rotationX: 15
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotationX: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      })

    }, actualRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={actualRef} className="fixed inset-0 pointer-events-none z-0">
      {/* Morphing Shapes */}
      <div className="morph-shape-1 absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
      <div className="morph-shape-2 absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      
      {/* Animated Gradient Background */}
      <div className="animated-gradient absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-pink-500/5 bg-[length:200%_200%]"></div>
    </div>
  )
})

BackgroundElements.displayName = 'BackgroundElements'

export default BackgroundElements 