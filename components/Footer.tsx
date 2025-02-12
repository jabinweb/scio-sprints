import React from 'react';
import { Rocket, Mail, Globe, MapPin } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-primary/90 text-primary-foreground">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="w-8 h-8 text-primary-foreground/90" />
              <span className="text-2xl font-bold text-primary-foreground" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                ScioLabs
              </span>
            </div>
            <p className="text-lg mb-4 text-muted-foreground">
              Revolutionizing student revision with interactive gamified learning.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-primary-foreground">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-primary-foreground transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary-foreground transition-colors">For Schools</Link></li>
              <li><Link href="#" className="hover:text-primary-foreground transition-colors">Teacher Training</Link></li>
              <li><Link href="#" className="hover:text-primary-foreground transition-colors">Try Demo</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-primary-foreground">Contact Us</h3>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary-foreground/90" />
                N-304, Ashiyana, Sector N, Lucknow, UP - 226012
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-foreground/90" />
                info@sciolabs.in
              </li>
              <li className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary-foreground/90" />
                www.sciolabs.in
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ScioLabs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;