'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from '../Logo';
import { useRouter, usePathname } from 'next/navigation';
import { LoginDialog } from '../auth/login-dialog';
import { useSession, signOut } from 'next-auth/react';
import UserDropdown from '../dashboard/UserDropdown';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  // Pages that need solid navbar background
  const solidNavbarPages = ['/support', '/privacy', '/terms', '/refund', '/dashboard', '/admin'];
  const needsSolidBackground = solidNavbarPages.some(page => pathname?.startsWith(page));
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isScrolled = scrollPosition > 50;
  // Show solid background on specific pages OR when scrolled on any page OR when NOT on homepage
  const shouldShowSolidBackground = needsSolidBackground || isScrolled || !isHomePage;

  const scrollToSection = (sectionId: string) => {
    setIsOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // account for navbar height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { label: 'Features', id: 'promise' },
    { label: 'Platforms', id: 'platforms' },
    { label: 'Play Now', id: 'games' },
    { label: 'FAQs', id: 'faq' },
  ];

  return (
    <nav className={cn(
      "w-full z-50",
      isHomePage ? "fixed top-0" : "sticky top-0"
    )}>
      <div className={cn(
        "absolute inset-0 transition-all duration-300",
        shouldShowSolidBackground 
          ? "bg-white/95 backdrop-blur-md shadow-sm" 
          : "bg-transparent"
      )} />
      <div className="container mx-auto px-6 relative">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Logo 
            isScrolled={shouldShowSolidBackground} 
            onClick={() => router.push('/')}
          />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3 lg:gap-6">
            {navLinks.map(link => (
              <Button
                key={link.id}
                variant="ghost"
                onClick={() => scrollToSection(link.id)}
                className={cn(
                  "transition-colors font-medium",
                  shouldShowSolidBackground 
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50" 
                    : "text-white/90 hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
              </Button>
            ))}

            <UserDropdown />            
           
            <Button 
              className={cn(
                "rounded-full font-semibold px-6",
                shouldShowSolidBackground
                  ? "bg-brand-blue text-white hover:bg-brand-blue-dark"
                  : "bg-brand-blue text-white hover:bg-brand-blue-dark"
              )}
              onClick={() => scrollToSection('cta')}
            >
              Try Demo
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost"
            size="icon"
            className={cn(
              "md:hidden",
              shouldShowSolidBackground ? "text-gray-800" : "text-white"
            )}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="!w-8 !h-8" /> : <Menu className="!w-8 !h-8" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-16 sm:top-20 bg-black/90 backdrop-blur-md border-t border-white/10">
            <div className="container mx-auto py-4 px-4 sm:px-6">
              <div className="flex flex-col gap-2">
                {navLinks.map(link => (
                  <Button
                    key={link.id}
                    variant="ghost"
                    onClick={() => scrollToSection(link.id)}
                    className="justify-start text-base sm:text-lg text-white/80 hover:text-white hover:bg-white/10 h-12"
                  >
                    {link.label}
                  </Button>
                ))}
                
                {user ? (
                  <>
                    <Button 
                      variant="ghost"
                      onClick={() => router.push('/dashboard')}
                      className="justify-start text-base sm:text-lg text-white/80 hover:text-white hover:bg-white/10 h-12"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={handleLogout}
                      className="justify-start text-base sm:text-lg text-white/80 hover:text-white hover:bg-white/10 h-12"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="px-3 py-2">
                    <LoginDialog />
                  </div>
                )}
                
                <Button 
                  className="w-full rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm h-12 mt-2"
                  onClick={() => scrollToSection('cta')}
                >
                  Try Demo
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      
    </nav>
  );
};

export default Header;