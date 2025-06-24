import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Eye, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

interface Product {
  id: string
  name: string
  imageUrl?: string
  price: number
  previewUrl: string
}

interface ProductGalleryProps {
  products: Product[]
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ products }) => {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!products || products.length === 0) return

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        const section = sectionRef.current
        if (!section) return

        const row1 = section.querySelector('.gallery-row-1') as HTMLElement
        const row2 = section.querySelector('.gallery-row-2') as HTMLElement

        if (!row1 || !row2) return

        // Pin the entire section with proper spacing
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: '+=300vh',
          pin: true,
          pinSpacing: true,
          anticipatePin: 1
        })

        // Row 1 - moves LEFT (negative x)
        gsap.fromTo(row1,
          { x: '0%' },
          {
            x: '-50%',
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: '+=300vh',
              scrub: 1,
              invalidateOnRefresh: true
            }
          }
        )

        // Row 2 - moves RIGHT (positive x) - opposite direction
        gsap.fromTo(row2,
          { x: '-20%' },
          {
            x: '20%',
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: '+=300vh',
              scrub: 1,
              invalidateOnRefresh: true
            }
          }
        )

        // Gallery items entrance animation
        const items = section.querySelectorAll('.gallery-item')
        if (items.length > 0) {
          gsap.fromTo(items,
            {
              opacity: 0,
              scale: 0.8,
              y: 50
            },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 1,
              ease: 'power2.out',
              stagger: 0.1,
              scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
              }
            }
          )
        }

        // Hover animations
        items.forEach((item: any) => {
          const image = item.querySelector('.gallery-image')
          const overlay = item.querySelector('.gallery-overlay')

          if (image && overlay) {
            item.addEventListener('mouseenter', () => {
              gsap.to(image, {
                scale: 1.05,
                duration: 0.4,
                ease: 'power2.out'
              })
              gsap.to(overlay, {
                opacity: 1,
                duration: 0.3,
                ease: 'power2.out'
              })
            })

            item.addEventListener('mouseleave', () => {
              gsap.to(image, {
                scale: 1,
                duration: 0.4,
                ease: 'power2.out'
              })
              gsap.to(overlay, {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.out'
              })
            })
          }
        })

      }, sectionRef)

      return () => ctx.revert()
    }, 100)

    return () => clearTimeout(timer)
  }, [products])

  const formatPrice = (price: number) => {
    return `₮${price.toLocaleString()}`
  }

  // Split products for two rows - ensure we have enough products
  const validProducts = products.filter(product => product.imageUrl)
  const row1Products = validProducts.slice(0, Math.ceil(validProducts.length / 2))
  const row2Products = validProducts.slice(Math.ceil(validProducts.length / 2))

  // Duplicate products for seamless carousel effect
  const extendedRow1 = [...row1Products, ...row1Products, ...row1Products]
  const extendedRow2 = [...row2Products, ...row2Products, ...row2Products]

  return (
    <section
      ref={sectionRef}
      className="relative h-screen bg-background overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Gallery Content */}
      <div className="absolute inset-0 flex flex-col justify-center">
        {/* Row 1 - Moving Left */}
        <div className="gallery-row-1 flex gap-8 mb-8" style={{ width: 'max-content' }}>
          {extendedRow1.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className="gallery-item relative w-96 h-80 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0"
            >
              {/* Product Image */}
              <div className="gallery-image w-full h-full relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&auto=format`
                  }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              </div>

              {/* Hover Overlay */}
              <div className="gallery-overlay absolute inset-0 bg-black/60 opacity-0 flex items-center justify-center gap-4">
                <a
                  href={product.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Eye className="w-8 h-8 text-white" />
                </a>
                <Link href={`/checkout/${product.id}`}>
                  <button className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300">
                    <ShoppingCart className="w-8 h-8 text-white" />
                  </button>
                </Link>
              </div>

              {/* Content */}
              <div className="gallery-content absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2 truncate">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-purple-300">
                    {formatPrice(product.price)}
                  </span>
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                    Premium
                  </div>
                </div>
              </div>

              {/* Index Number */}
              <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg">
                {String((index % row1Products.length) + 1).padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>

        {/* Row 2 - Moving Right */}
        <div className="gallery-row-2 flex gap-8" style={{ width: 'max-content' }}>
          {extendedRow2.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className="gallery-item relative w-96 h-80 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0"
            >
              {/* Product Image */}
              <div className="gallery-image w-full h-full relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&auto=format`
                  }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              </div>

              {/* Hover Overlay */}
              <div className="gallery-overlay absolute inset-0 bg-black/60 opacity-0 flex items-center justify-center gap-4">
                <a
                  href={product.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Eye className="w-8 h-8 text-white" />
                </a>
                <Link href={`/checkout/${product.id}`}>
                  <button className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300">
                    <ShoppingCart className="w-8 h-8 text-white" />
                  </button>
                </Link>
              </div>

              {/* Content */}
              <div className="gallery-content absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2 truncate">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-purple-300">
                    {formatPrice(product.price)}
                  </span>
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                    Premium
                  </div>
                </div>
              </div>

              {/* Index Number */}
              <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg">
                {String((index % row2Products.length) + row1Products.length + 1).padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductGallery 