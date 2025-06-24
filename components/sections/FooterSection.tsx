import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { useLanguage } from '@/contexts/language-context'

gsap.registerPlugin(ScrollTrigger)

const FooterSection: React.FC = () => {
  const { t } = useLanguage()
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Footer animation
      gsap.fromTo('.footer-content', 
        { 
          y: 60,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        }
      )

      // Footer stars animation
      gsap.fromTo('.footer-star', 
        { 
          scale: 0,
          opacity: 0
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'back.out(1.7)',
          stagger: 0.1,
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      )

      // Continuous star twinkling animation
      gsap.utils.toArray('.footer-star').forEach((star: any, index) => {
        gsap.to(star, {
          opacity: 0.3,
          scale: 0.8,
          duration: 2 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut',
          delay: Math.random() * 2
        })
      })

    }, footerRef)

    return () => ctx.revert()
  }, [])

  return (
    <footer ref={footerRef} className="py-16 bg-muted/30 border-t border-border relative overflow-hidden">
      {/* Footer Stars */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="footer-star absolute top-10 left-10 w-2 h-2 bg-primary rounded-full"></div>
        <div className="footer-star absolute top-20 right-20 w-1 h-1 bg-purple-400 rounded-full"></div>
        <div className="footer-star absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
        <div className="footer-star absolute bottom-32 right-1/3 w-1 h-1 bg-pink-400 rounded-full"></div>
        <div className="footer-star absolute top-1/2 left-16 w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
        <div className="footer-star absolute top-1/3 right-16 w-2 h-2 bg-yellow-400 rounded-full"></div>
      </div>

      <div className="container mx-auto px-4">
        <div className="footer-content text-center">
          <div className="mb-8">
            <Image
              src="/Logo.png"
              alt="ThemeStore Logo"
              width={150}
              height={50}
              className="mx-auto"
            />
          </div>
          <p className="text-muted-foreground mb-8">
            {t("footerTagline")}
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              © 2024 ThemeStore. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default FooterSection 