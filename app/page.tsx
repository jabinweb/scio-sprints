'use client';

import React, { useState } from 'react';
import { Sparkles, Target, Book } from 'lucide-react';
import { TabSection } from '@/components/TabSection';
import { Hero } from '@/components/Hero';
import { CallToAction } from '@/components/CallToAction';
import { FAQ } from '@/components/FAQ';
import { DemoVideo } from '@/components/DemoVideo';

export default function Home() {
  const [activeTab, setActiveTab] = useState('features');

  const tabs = [
    { id: 'features', label: 'Features', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'curriculum', label: 'Curriculum', icon: <Book className="w-5 h-5" /> },
    { id: 'benefits', label: 'Benefits', icon: <Target className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-white">
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
      <section id="platforms" className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Multi-Platform Learning 🎮
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {[
              "Baamboozle",
              "Educaplay",
              "Wordwall",
              "Blooket",
              "GimKit",
              "Formative"
            ].map((platform, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg p-4 rounded-xl hover:bg-white/20 transition-colors">
                <p className="font-semibold text-lg">{platform}</p>
              </div>
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