'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from './Logo';
import { useRouter } from 'next/navigation';
import { LoginDialog } from './auth/login-dialog';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isScrolled = scrollPosition > 50;

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

 

  const navLinks = [
    { label: 'Features', id: 'features' },
    { label: 'Demo', id: 'demo' },
    { label: 'Platforms', id: 'platforms' },
    { label: 'FAQ', id: 'faq' },
  ];

  return (
    <nav className="fixed w-full z-50">
      <div className={cn(
        "absolute inset-0 transition-all duration-300",
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      )} />
      <div className="container mx-auto px-6 relative">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Logo 
            isScrolled={isScrolled} 
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
                  "transition-colors font-medium text-white/90 hover:text-white hover:bg-white/10",
                  isScrolled && "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
                )}
              >
                {link.label}
              </Button>
            ))}
            <LoginDialog />
            <Button 
              className={cn(
                "rounded-full font-semibold px-6",
                isScrolled
                  ? "bg-brand-blue text-white hover:bg-brand-blue-dark"
                  : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
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
              isScrolled ? "text-gray-800" : "text-white"
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
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

export default Navbar;