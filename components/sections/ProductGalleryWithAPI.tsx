import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Eye, ShoppingCart, Loader2 } from 'lucide-react'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

interface Product {
  id: string
  name: string
  imageUrl?: string
  price: number
  previewUrl: string
  categoryId: string
}

interface ProductGalleryWithAPIProps {
  title?: string
  subtitle?: string
  limit?: number
}

const ProductGalleryWithAPI: React.FC<ProductGalleryWithAPIProps> = ({ 
  title = "Featured Products",
  subtitle = "Discover our latest collection of premium themes",
  limit = 8
}) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (response.ok) {
          const data = await response.json()
          const productsWithImages = data.filter((product: Product) => product.imageUrl).slice(0, limit)
          setProducts(productsWithImages)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [limit])

  useEffect(() => {
    if (loading || products.length === 0) return

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        const section = sectionRef.current
        const row1 = section?.querySelector('.gallery-row-1') as HTMLElement
        const row2 = section?.querySelector('.gallery-row-2') as HTMLElement

        if (!section || !row1 || !row2) return

        // Force ScrollTrigger refresh
        ScrollTrigger.refresh()

        // Pin the section and animate rows within it
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          pin: true,
          pinSpacing: true
        })

        // Animate first row (moves UP)
        gsap.fromTo(row1, 
          { y: '0px' },
          {
            y: '-100px',
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1,
              invalidateOnRefresh: true
            }
          }
        )

        // Animate second row (moves DOWN - opposite direction)
        gsap.fromTo(row2,
          { y: '0px' },
          {
            y: '100px',
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: 'bottom bottom',
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
              scale: 0.8
            },
            {
              opacity: 1,
              scale: 1,
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
  }, [products, loading])

  const formatPrice = (price: number) => {
    return `₮${price.toLocaleString()}`
  }

  if (loading) {
    return (
      <section className="relative h-screen overflow-hidden bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-xl text-muted-foreground">Loading gallery...</p>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="relative h-screen overflow-hidden bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">No products with images found</p>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="relative h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

              {/* First Row - Moving Up */}
        <div className="gallery-row-1 flex gap-8 absolute top-1/2 -translate-y-20 left-1/2 -translate-x-1/2" style={{ width: 'max-content' }}>
        {products.slice(0, Math.ceil(products.length / 2)).map((product, index) => (
          <div key={product.id} className="gallery-item relative w-96 h-80 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
            <div className="gallery-image w-full h-full relative">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&auto=format`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </div>

            <div className="gallery-overlay absolute inset-0 bg-black/60 opacity-0 flex items-center justify-center gap-4">
              <a href={product.previewUrl} target="_blank" rel="noopener noreferrer" 
                 className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300">
                <Eye className="w-8 h-8 text-white" />
              </a>
              <Link href={`/checkout/${product.id}`}>
                <button className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </button>
              </Link>
            </div>

            <div className="gallery-content absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-2xl font-bold mb-2 truncate">{product.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-purple-300">{formatPrice(product.price)}</span>
                <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">Premium</div>
              </div>
            </div>

            <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg">
              {String(index + 1).padStart(2, '0')}
            </div>
          </div>
        ))}
        {/* Duplicate for seamless loop */}
        {products.slice(0, Math.ceil(products.length / 2)).map((product, index) => (
          <div key={`${product.id}-duplicate`} className="gallery-item relative w-96 h-80 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
            <div className="gallery-image w-full h-full relative">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&auto=format`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </div>
            <div className="gallery-overlay absolute inset-0 bg-black/60 opacity-0 flex items-center justify-center gap-4">
              <a href={product.previewUrl} target="_blank" rel="noopener noreferrer" 
                 className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300">
                <Eye className="w-8 h-8 text-white" />
              </a>
              <Link href={`/checkout/${product.id}`}>
                <button className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </button>
              </Link>
            </div>
            <div className="gallery-content absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-2xl font-bold mb-2 truncate">{product.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-purple-300">{formatPrice(product.price)}</span>
                <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">Premium</div>
              </div>
            </div>
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg">
              {String(index + 1).padStart(2, '0')}
            </div>
          </div>
        ))}
      </div>

              {/* Second Row - Moving Down */}
        <div className="gallery-row-2 flex gap-8 absolute top-1/2 translate-y-20 left-1/2 -translate-x-1/2" style={{ width: 'max-content' }}>
        {products.slice(Math.ceil(products.length / 2)).map((product, index) => (
          <div key={product.id} className="gallery-item relative w-96 h-80 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
            <div className="gallery-image w-full h-full relative">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&auto=format`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </div>
            <div className="gallery-overlay absolute inset-0 bg-black/60 opacity-0 flex items-center justify-center gap-4">
              <a href={product.previewUrl} target="_blank" rel="noopener noreferrer" 
                 className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300">
                <Eye className="w-8 h-8 text-white" />
              </a>
              <Link href={`/checkout/${product.id}`}>
                <button className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </button>
              </Link>
            </div>
            <div className="gallery-content absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-2xl font-bold mb-2 truncate">{product.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-purple-300">{formatPrice(product.price)}</span>
                <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">Premium</div>
              </div>
            </div>
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg">
              {String(index + Math.ceil(products.length / 2) + 1).padStart(2, '0')}
            </div>
          </div>
        ))}
        {/* Duplicate for seamless loop */}
        {products.slice(Math.ceil(products.length / 2)).map((product, index) => (
          <div key={`${product.id}-duplicate`} className="gallery-item relative w-96 h-80 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
            <div className="gallery-image w-full h-full relative">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&auto=format`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </div>
            <div className="gallery-overlay absolute inset-0 bg-black/60 opacity-0 flex items-center justify-center gap-4">
              <a href={product.previewUrl} target="_blank" rel="noopener noreferrer" 
                 className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300">
                <Eye className="w-8 h-8 text-white" />
              </a>
              <Link href={`/checkout/${product.id}`}>
                <button className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </button>
              </Link>
            </div>
            <div className="gallery-content absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-2xl font-bold mb-2 truncate">{product.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-purple-300">{formatPrice(product.price)}</span>
                <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">Premium</div>
              </div>
            </div>
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg">
              {String(index + Math.ceil(products.length / 2) + 1).padStart(2, '0')}
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}

export default ProductGalleryWithAPI 