'use client';

import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";

export function Hero() {
  return (
    <section id="hero" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
        >
          <source
            src="https://videos.pexels.com/video-files/3678329/3678329-uhd_2732_1440_25fps.mp4"
            type="video/mp4"
          />
        </video>
        {/* Enhanced Mobile-friendly Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,transparent_30%,rgba(0,0,0,0.4)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/20 via-transparent to-brand-green/20" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* New Badge */}
          <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12 animate-fade-in">
            <div className="inline-block scale-90 sm:scale-100">
              <div className="inline-flex items-center rounded-full border border-white/30 bg-white/5 backdrop-blur-sm p-1 pr-3 sm:pr-4">
                <span className="bg-brand-blue text-white rounded-full px-2 sm:px-3 py-0.5 text-xs sm:text-sm font-medium mr-1.5 sm:mr-2">
                  New
                </span>
                <span className="text-white/90 text-xs sm:text-sm">Interactive Learning Games Added!</span>
              </div>
            </div>

            {/* Hero Title */}
            <h1 className="text-3xl sm :text-5xl lg:text-6xl font-bold tracking-tight px-4">
              <span className="block text-white mb-2 sm:mb-4">Make Learning Fun with</span>
              <span className="bg-gradient-to-r from-brand-blue via-white to-brand-green bg-clip-text text-transparent inline-flex gap-2 items-center">
                ScioSprints!<span className="text-2xl sm:text-4xl">🚀</span>
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-base sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed px-4">
              Transform your revision journey into an exciting adventure with our gamified learning platform. 
              Join thousands of students who learn while having fun!
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 mb-12 sm:mb-16 animate-fade-in">
            <Button 
              size="lg"
              className="bg-brand-blue hover:bg-brand-blue-dark text-white text-lg h-12 px-8 rounded-full"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/30 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 text-lg h-12 px-8 rounded-full"
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Play className="mr-2 h-4 w-4" /> Watch Demo
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto px-4 animate-fade-in">
            {[
              { number: '10K+', label: 'Active Students' },
              { number: '500+', label: 'Quiz Games' },
              { number: '98%', label: 'Success Rate' }
            ].map((stat, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden group">
                <CardContent className="p-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-brand-green/10 translate-y-full transform transition-transform duration-300 group-hover:translate-y-0" />
                  <div className="relative">
                    <div className="text-3xl font-bold bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
