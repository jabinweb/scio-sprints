'use client';

import React from 'react';
import { Gamepad2, BookOpen, Users, Brain, Trophy, Rocket, Target, Book } from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';

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
    <section className="py-20 bg-orange-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white rounded-full p-2 shadow-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={clsx(
                  'flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300',
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
                )}
              >
                {tab.icon}
                <span className="font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          {/* Features Tab Content */}
          <div className={clsx(
            'tab-content transition-all duration-300',
            activeTab === 'features' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 absolute top-0 left-0 right-0'
          )}>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Gamepad2 className="w-12 h-12 text-orange-500" />,
                  title: "Fun Learning Games",
                  description: "Learn through exciting games and quizzes on multiple platforms"
                },
                {
                  icon: <Trophy className="w-12 h-12 text-orange-500" />,
                  title: "Win & Learn",
                  description: "Compete with friends and earn points while mastering concepts"
                },
                {
                  icon: <Brain className="w-12 h-12 text-orange-500" />,
                  title: "Brain Power",
                  description: "Develop critical thinking skills through interactive challenges"
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-orange-200">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-semibold mb-3 text-orange-600">{feature.title}</h3>
                  <p className="text-gray-600 text-lg">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Tab Content */}
          <div className={clsx(
            'tab-content transition-all duration-300',
            activeTab === 'curriculum' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 absolute top-0 left-0 right-0'
          )}>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-orange-600">Aligned with Your School</h3>
                  <ul className="space-y-4">
                    {[
                      "CBSE & ICSE Curriculum Coverage",
                      "Subject-wise Learning Modules",
                      "Interactive Chapter Reviews",
                      "Practice Tests & Assessments",
                      "Concept-based Learning"
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-lg">
                        <div className="bg-orange-100 p-2 rounded-full">
                          <Book className="w-6 h-6 text-orange-500" />
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Target className="w-10 h-10 text-orange-500" />,
                  title: "Improved Focus",
                  description: "Gamified learning keeps students engaged and focused"
                },
                {
                  icon: <Brain className="w-10 h-10 text-orange-500" />,
                  title: "Better Retention",
                  description: "Interactive content enhances memory and understanding"
                },
                {
                  icon: <Trophy className="w-10 h-10 text-orange-500" />,
                  title: "Confidence Boost",
                  description: "Achievement system builds student confidence"
                },
                {
                  icon: <Users className="w-10 h-10 text-orange-500" />,
                  title: "Peer Learning",
                  description: "Collaborative features promote group learning"
                },
                {
                  icon: <Rocket className="w-10 h-10 text-orange-500" />,
                  title: "Rapid Progress",
                  description: "Track and celebrate learning milestones"
                },
                {
                  icon: <BookOpen className="w-10 h-10 text-orange-500" />,
                  title: "Comprehensive Coverage",
                  description: "Complete curriculum coverage with fun"
                }
              ].map((benefit, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                  <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-orange-600">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
