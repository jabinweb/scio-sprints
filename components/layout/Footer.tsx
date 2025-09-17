import React from 'react';
import { Mail, Globe, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-32 h-12">
                <Image
                  src="/logo.png"
                  alt="ScioSprints Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-slate-200 mb-6 max-w-md leading-relaxed">
              Making revision fun, focused, and effective — with curriculum-aligned games that build memory, confidence, and better grades.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-full flex items-center justify-center hover:from-teal-500/30 hover:to-blue-500/30 transition-colors cursor-pointer border border-teal-500/30">
                <Globe className="w-5 h-5 text-teal-300" />
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-full flex items-center justify-center hover:from-teal-500/30 hover:to-blue-500/30 transition-colors cursor-pointer border border-blue-500/30">
                <Mail className="w-5 h-5 text-blue-300" />
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-4">
                Built with <span className="text-red-400">❤️</span> for Indian students 
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-slate-200 hover:text-teal-300 transition-colors">Home</Link></li>
              <li><Link href="/#cta" className="text-slate-200 hover:text-teal-300 transition-colors">Try Demo</Link></li>
              {/* <li><Link href="/dashboard" className="text-slate-200 hover:text-blue-300 transition-colors">Dashboard</Link></li> */}
              <li><Link href="/#features" className="text-slate-200 hover:text-teal-300 transition-colors">Features</Link></li>
              <li><Link href="/#platforms" className="text-slate-200 hover:text-blue-300 transition-colors">Platforms</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-200 text-sm leading-relaxed">
                  N-304, Ashiyana<br />
                  Sector N, Lucknow<br />
                  UP - 226012, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <a href="mailto:info@sciolabs.in" className="text-slate-200 hover:text-blue-300 transition-colors">
                  info@sciolabs.in
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <a href="tel:+919495212484" className="text-slate-200 hover:text-teal-300 transition-colors">
                  +91 94952 12484
                </a>
              </li>
              {/* <li className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <a href="https://www.sciosprints.com" className="text-slate-200 hover:text-blue-300 transition-colors">
                  www.sciosprints.com
                </a>
              </li> */}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-300 text-sm">
              &copy; {new Date().getFullYear()} ScioSprints. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-slate-300 hover:text-teal-300 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-slate-300 hover:text-blue-300 transition-colors">
                Terms of Service
              </Link>
              <Link href="/support" className="text-slate-300 hover:text-teal-300 transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;