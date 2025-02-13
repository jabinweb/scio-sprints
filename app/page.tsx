'use client';

import React, { useState } from 'react';
import { Sparkles, Target, Book } from 'lucide-react';
import { TabSection } from '@/components/TabSection';
import { Hero } from '@/components/Hero';
import { CallToAction } from '@/components/CallToAction';
import { FAQ } from '@/components/FAQ';
import { DemoVideo } from '@/components/DemoVideo';
import Image from 'next/image';

export default function Home() {
  const [activeTab, setActiveTab] = useState('features');

  const tabs = [
    { id: 'features', label: 'Features', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'curriculum', label: 'Curriculum', icon: <Book className="w-5 h-5" /> },
    { id: 'benefits', label: 'Benefits', icon: <Target className="w-5 h-5" /> },
  ];

  const platforms = [
    { 
      name: "Baamboozle", 
      logo: "/logos/baamboozle.svg",
      url: "https://www.baamboozle.com"
    },
    { 
      name: "Gimkit", 
      logo: "/logos/gimkit.svg",
      url: "https://www.gimkit.com"
    },
    { 
      name: "Wordwall", 
      logo: "/logos/wordwall.png",
      url: "https://wordwall.net"
    },
    { 
      name: "Blooket", 
      logo: "/logos/blooket.png",
      url: "https://www.blooket.com"
    },
    { 
      name: "Educaplay", 
      logo: "/logos/educaplay.svg",
      url: "https://www.educaplay.com"
    },
    { 
      name: "Formative", 
      logo: "/logos/formative.svg",
      url: "https://www.formative.com"
    }
  ];

  return (
    <div className="bg-background">
      <Hero />
      
      <section id="features">
        <TabSection
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </section>

      <section id="demo">
        <DemoVideo />
      </section>

      {/* Platforms Section */}
      <section id="platforms" className="py-20 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 via-transparent to-brand-green/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(75,157,206,0.1)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(76,174,84,0.1)_0%,transparent_50%)]" />
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent ">Multi-Platform Learning</span> 🎮
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn and play across your favorite educational platforms
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {platforms.map((platform, index) => (
              <a
                key={index}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-white/50 backdrop-blur-sm p-6 rounded-2xl hover:shadow-xl transition-all duration-300 border-2 border-white/20 overflow-hidden flex items-center justify-center"
              >
                {/* Hover Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-brand-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Platform Logo */}
                <div className="relative h-12 w-full transition-all duration-300 group-hover:scale-110">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src={platform.logo}
                      alt={`${platform.name} logo`}
                      fill
                      className="object-contain [filter:brightness(0)_saturate(100%)_invert(45%)_sepia(22%)_saturate(791%)_hue-rotate(170deg)_brightness(97%)_contrast(87%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(48%)_sepia(96%)_saturate(427%)_hue-rotate(157deg)_brightness(91%)_contrast(91%)] transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Decorative dot pattern */}
                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-gradient-to-br from-brand-blue/20 to-brand-green/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="cta">
        <CallToAction />
      </section>

      <section id="faq">
        <FAQ />
      </section>
    </div>
  );
}