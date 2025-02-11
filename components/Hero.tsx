'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section id="hero" className="relative min-h-[600px] flex items-center justify-center">
      {/* Video Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://videos.pexels.com/video-files/3678329/3678329-uhd_2732_1440_25fps.mp4"
            type="video/mp4"
          />
        </video>
        {/* Multiple layers of gradients for better effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-950/80 to-orange-900/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-950/50 via-transparent to-orange-950/50" />
        <div className="absolute inset-0 bg-black/20" /> {/* Additional overlay for better text contrast */}
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 
            className="text-6xl font-bold mb-6 leading-tight animate-fade-in" 
            style={{ fontFamily: 'Comic Sans MS, cursive' }}
          >
            Make Learning Fun with 
            <span className="text-orange-400"> ScioSprints!</span> 🚀
          </h1>
          <p className="text-xl mb-8 text-orange-50/90 max-w-2xl mx-auto">
            Transform your revision journey into an exciting adventure with our gamified learning platform. 
            Join thousands of students who learn while having fun!
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-lg h-12 px-8"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started <ArrowRight className="ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-orange-400 text-orange-400 hover:bg-orange-500/10 text-lg h-12 px-8"
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Watch Demo
            </Button>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { number: '10K+', label: 'Active Students' },
              { number: '500+', label: 'Quiz Games' },
              { number: '98%', label: 'Success Rate' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-orange-400 mb-1">{stat.number}</div>
                <div className="text-sm text-orange-100/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
