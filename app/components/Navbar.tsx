'use client';

import React, { useState } from 'react';
import { Menu, X, Rocket } from 'lucide-react';
import Link from 'next/link';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Rocket className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-orange-500" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              ScioLabs
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-700 hover:text-orange-500 text-lg transition-colors">Home</Link>
            <Link href="#features" className="text-gray-700 hover:text-orange-500 text-lg transition-colors">Features</Link>
            <Link href="#teachers" className="text-gray-700 hover:text-orange-500 text-lg transition-colors">For Teachers</Link>
            <Link href="#contact" className="text-gray-700 hover:text-orange-500 text-lg transition-colors">Contact</Link>
            <button className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 text-lg transition-colors">
              Try Demo
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col gap-4">
              <Link href="/" className="text-gray-700 hover:text-orange-500 py-2 text-lg">Home</Link>
              <Link href="#features" className="text-gray-700 hover:text-orange-500 py-2 text-lg">Features</Link>
              <Link href="#teachers" className="text-gray-700 hover:text-orange-500 py-2 text-lg">For Teachers</Link>
              <Link href="#contact" className="text-gray-700 hover:text-orange-500 py-2 text-lg">Contact</Link>
              <button className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 w-full text-lg transition-colors">
                Try Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;