import React from 'react';
import { Rocket, Mail, Globe, MapPin } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-orange-900 text-orange-100">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="w-8 h-8 text-orange-400" />
              <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                ScioLabs
              </span>
            </div>
            <p className="text-lg mb-4">
              Revolutionizing student revision with interactive gamified learning.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-orange-400" />
                N-304, Ashiyana, Sector N, Lucknow, UP - 226012
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-orange-400" />
                info@sciolabs.in
              </li>
              <li className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-orange-400" />
                www.sciolabs.in
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-orange-400 transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-orange-400 transition-colors">For Schools</Link></li>
              <li><Link href="#" className="hover:text-orange-400 transition-colors">Teacher Training</Link></li>
              <li><Link href="#" className="hover:text-orange-400 transition-colors">Try Demo</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-orange-800 mt-12 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} ScioLabs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;