'use client';

import React from 'react';
import { Gamepad2, BookOpen, Users, Brain, Trophy, Rocket, Target, Book } from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';
import { Card, CardHeader, CardContent } from "@/components/ui/card";

type TabContent = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

interface TabSectionProps {
  tabs: TabContent[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabSection({ tabs, activeTab, onTabChange }: TabSectionProps) {
  return (
    <section className="py-12 sm:py-20 relative overflow-hidden">
      {/* Background with playful gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/5 via-brand-green/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(75,157,206,0.1)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(76,174,84,0.1)_0%,transparent_50%)]" />

      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Scrollable Tab Navigation for Mobile */}
        <div className="flex justify-start sm:justify-center mb-8 sm:mb-16 -mx-4 sm:mx-0">
          <div className="flex overflow-x-auto px-4 sm:px-0 pb-4 sm:pb-0 scrollbar-hide sm:overflow-x-visible w-full sm:w-auto">
            <div className="inline-flex bg-white rounded-2xl p-2 shadow-xl border-2 border-brand-blue/20 gap-2 mx-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={clsx(
                    "relative group flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 whitespace-nowrap min-w-[120px] sm:min-w-0",
                    "text-sm sm:text-base font-medium",
                    activeTab === tab.id
                      ? "bg-gradient-to-br from-brand-blue to-brand-green text-white shadow-lg scale-105"
                      : "hover:bg-gradient-to-br hover:from-brand-blue/10 hover:to-brand-green/10 text-gray-600"
                  )}
                >
                  {/* Playful hover effect */}
                  <div className={clsx(
                    "absolute inset-0 rounded-xl transition-opacity duration-300",
                    "bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2)_0%,transparent_100%)]",
                    "opacity-0 group-hover:opacity-100"
                  )} />
                  
                  {/* Icon wrapper with bounce effect */}
                  <div className={clsx(
                    "relative p-1.5 sm:p-2 rounded-full transition-transform duration-300",
                    "group-hover:scale-110 group-hover:rotate-3",
                    activeTab === tab.id
                      ? "text-white"
                      : "text-brand-blue group-hover:text-brand-blue"
                  )}>
                    {tab.icon}
                  </div>
                  
                  {/* Label with fun animation */}
                  <span className="relative font-semibold">
                    {tab.label}
                  </span>

                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content area with softer shadows and rounded corners */}
        <div className="relative bg-white/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl border-2 border-white/20">
          {/* Features Tab Content */}
          <div className={clsx(
            'tab-content transition-all duration-300',
            activeTab === 'features' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 absolute top-0 left-0 right-0'
          )}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
              { [
                {
                  icon: <Gamepad2 className="w-12 h-12 text-primary" />,
                  title: "Learn Smarter, Play Better",
                  description: "Engaging games and quizzes that make learning fun, interactive, and rewarding."
                },
                {
                  icon: <Brain className="w-12 h-12 text-primary" />,
                  title: "Think Sharp, Stay Ahead",
                  description: "Boost critical thinking and retention through challenge-based, concept-driven modules."
                },
                {
                  icon: <BookOpen className="w-12 h-12 text-primary" />,
                  title: "Syllabus Simplified",
                  description: "Aligned with CBSE curriculum offering chapter-wise learning activities."
                }
              ].map((feature, index) => (
                <Card key={index} className="bg-white/50 backdrop-blur-sm border border-white/20 hover:shadow-xl transition-all duration-200">
                  <CardHeader>
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-2xl font-semibold text-brand-blue">{feature.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Curriculum Tab Content */}
          <div className={clsx(
            'tab-content transition-all duration-300',
            activeTab === 'curriculum' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 absolute top-0 left-0 right-0'
          )}>
            <div className="bg-background rounded-2xl p-8 shadow-lg">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-primary">Comprehensive Curriculum Coverage</h3>
                  <ul className="space-y-4">
                    { [
                      "CBSE : Classes 4–8",
                      "Subject & Chapter-wise Activities",
                      "Covers Key Terms & Concepts",
                      "HOTS Questions for Deeper Thinking",
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-lg">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Book className="w-6 h-6 text-primary" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative h-[300px] rounded-xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80"
                    alt="Students studying"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Tab Content */}
          <div className={clsx(
            'tab-content transition-all duration-300',
            activeTab === 'benefits' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 absolute top-0 left-0 right-0'
          )}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              { [
                {
                  icon: <Target className="w-10 h-10 text-primary" />,
                  title: "Improved Focus",
                  description: "Gamified challenges keep learners engaged and attentive."
                },
                {
                  icon: <Brain className="w-10 h-10 text-primary" />,
                  title: "Better Retention",
                  description: "Interactive activities boost memory and deepen understanding."
                },
                {
                  icon: <Trophy className="w-10 h-10 text-primary" />,
                  title: "Confidence Boost",
                  description: "Progress tracking and rewards build learner confidence."
                },
                {
                  icon: <Users className="w-10 h-10 text-primary" />,
                  title: "Peer Learning",
                  description: "Collaborative features encourage group interaction and learning."
                },
                {
                  icon: <Rocket className="w-10 h-10 text-primary" />,
                  title: "Faster Progress",
                  description: "Milestone-based tracking accelerates learning outcomes."
                },
                {
                  icon: <BookOpen className="w-10 h-10 text-primary" />,
                  title: "Complete Coverage",
                  description: "Covers the entire curriculum through fun, bite-sized revision."
                }
              ].map((benefit, index) => (
                <Card key={index} className="bg-white/50 backdrop-blur-sm border border-white/20 group hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="bg-brand-blue/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-blue/20 transition-colors">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-brand-blue">{benefit.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
