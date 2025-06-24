"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useLanguage } from '@/contexts/language-context'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  Menu,
  X,
  Settings,
  User,
  LogOut,
  ShoppingBag
} from 'lucide-react'
import type { User as UserType } from '@/lib/redis'

interface NavbarProps {
  user?: UserType | null
  onLogout?: () => void
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const { t } = useLanguage()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isMobileMenuOpen && !target.closest('header')) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  const handleLogout = () => {
    setIsMobileMenuOpen(false)
    onLogout?.()
  }

  return (
    <header className="relative z-50 border-b bg-background/80 backdrop-blur-md sticky top-0">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/Logo.png" alt="logo" width={55} height={55} className="object-cover floating-advanced" />
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              ThemeStore
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Navigation Links */}
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-foreground hover:text-primary transition-colors">
                {t("home") || "Home"}
              </Link>
              <Link href="/products" className="text-foreground hover:text-primary transition-colors flex items-center space-x-1">
                <ShoppingBag className="h-4 w-4" />
                <span>{t("browseTemplates")}</span>
              </Link>
            </nav>

            {/* Theme and Language Switchers */}
            <div className="flex items-center space-x-2">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>

            {/* User Section */}
            {user ? (
              <div className="flex items-center space-x-2">
                {user.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="magnetic-advanced">
                      <Settings className="h-4 w-4 mr-2" />
                      {t("adminPanel")}
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      {user.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="magnetic-advanced">
                    {t("login")}
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="magnetic-advanced">
                    {t("signUp")}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border shadow-lg transform transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'opacity-100 translate-y-0 visible' 
            : 'opacity-0 -translate-y-2 invisible'
        }`}>
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col space-y-6">
              {/* Mobile Navigation Links */}
              <nav className="flex flex-col space-y-4 pb-4 border-b border-border">
                <Link 
                  href="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground hover:text-primary transition-colors py-2"
                >
                  {t("home") || "Home"}
                </Link>
                <Link 
                  href="/products" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground hover:text-primary transition-colors flex items-center space-x-2 py-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{t("browseTemplates")}</span>
                </Link>
              </nav>

              {/* Mobile Theme and Language Switchers */}
              <div className="flex items-center justify-center space-x-4 pb-4 border-b border-border">
                <ThemeSwitcher />
                <LanguageSwitcher />
              </div>
              
              {/* Mobile User Section */}
              {user ? (
                <div className="flex flex-col space-y-3">
                  {user.role === "admin" && (
                    <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full magnetic-advanced">
                        <Settings className="h-4 w-4 mr-2" />
                        {t("adminPanel")}
                      </Button>
                    </Link>
                  )}
                  <div className="flex items-center justify-center space-x-2 py-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{user.name}</span>
                  </div>
                  <Button variant="outline" onClick={handleLogout} className="w-full">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("logout")}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full magnetic-advanced">
                      {t("login")}
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full magnetic-advanced">
                      {t("signUp")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 