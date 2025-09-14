'use client';

import React from 'react';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Globe, Palette, Heart, MapPin, BookOpen, Type } from 'lucide-react';

interface GameData {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  icon: React.ReactNode;
  iframe: {
    src: string;
    width: number;
    height: number;
    allow?: string;
  };
  color: string;
}

const gamesData: GameData[] = [
  {
    id: 'countries',
    title: 'Countries & Capitals',
    description: 'Test your geography knowledge with world capitals',
    category: 'Geography',
    difficulty: 'Medium',
    icon: <Globe className="w-5 h-5" />,
    iframe: {
      src: 'https://wordwall.net/embed/play/97069/953/459',
      width: 500,
      height: 380,
    },
    color: 'from-blue-600 to-blue-700',
  },
  {
    id: 'colors',
    title: 'Find the Colours',
    description: 'Discover hidden colors in this word search puzzle',
    category: 'Vocabulary',
    difficulty: 'Easy',
    icon: <Palette className="w-5 h-5" />,
    iframe: {
      src: 'https://www.educaplay.com/game/25247811-color_quest_word_search.html',
      width: 795,
      height: 690,
      allow: 'fullscreen; autoplay; allow-top-navigation-by-user-activation',
    },
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'emotions',
    title: 'Emotions',
    description: 'Learn about different emotions and feelings',
    category: 'Social Learning',
    difficulty: 'Easy',
    icon: <Heart className="w-5 h-5" />,
    iframe: {
      src: 'https://wordwall.net/embed/play/97070/887/112',
      width: 500,
      height: 380,
    },
    color: 'from-blue-500 to-orange-500',
  },
  {
    id: 'cities',
    title: 'Indian Cities',
    description: 'Explore the geography and culture of India',
    category: 'Geography',
    difficulty: 'Medium',
    icon: <MapPin className="w-5 h-5" />,
    iframe: {
      src: 'https://wordwall.net/embed/play/97070/306/355',
      width: 500,
      height: 380,
    },
    color: 'from-orange-600 to-orange-700',
  },
  {
    id: 'verbs',
    title: 'Irregular Verbs',
    description: 'Master English irregular verbs and grammar',
    category: 'Language',
    difficulty: 'Hard',
    icon: <BookOpen className="w-5 h-5" />,
    iframe: {
      src: 'https://wordwall.net/embed/play/97071/185/378',
      width: 500,
      height: 380,
    },
    color: 'from-blue-700 to-blue-800',
  },
  {
    id: 'speech',
    title: 'Parts of Speech',
    description: 'Learn grammar with nouns, adjectives, and adverbs',
    category: 'Language',
    difficulty: 'Medium',
    icon: <Type className="w-5 h-5" />,
    iframe: {
      src: 'https://www.educaplay.com/game/25247848-noun_adjective_adverb_sentences.html',
      width: 795,
      height: 690,
      allow: 'fullscreen; autoplay; allow-top-navigation-by-user-activation',
    },
    color: 'from-orange-500 to-blue-600',
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Hard':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const TryGamesSection: React.FC = () => {
  return (
    <section id="games" className="py-24 bg-gradient-to-b from-slate-50/50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-brand-blue/20 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-brand-orange/20 rounded-full blur-3xl opacity-30" />
      
      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 mb-6">
            <Play className="w-4 h-4 text-brand-blue" />
            <span className="text-sm font-medium text-gray-600">Interactive Learning</span>
          </div>
          
          <h2 className="text-5xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Try Our Games
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Experience hands-on learning with our curated collection of educational games. 
            Each game is designed to make learning engaging and effective.
          </p>
        </div>

        {/* Games Tabs */}
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="countries" className="w-full">
            {/* Tab Content */}
            {gamesData.map((game) => (
              <TabsContent key={game.id} value={game.id} className="mt-8">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className={`bg-gradient-to-r ${game.color} text-white relative overflow-hidden`}>
                    {/* Header background pattern */}
                    <div className="absolute inset-0 bg-white/10 bg-grid-pattern" />
                    
                    <div className="relative">
                      {/* Tab Navigation - Inside the header */}
                      <div className="flex justify-center mb-6">
                        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 bg-white/20 backdrop-blur-sm border border-white/30 shadow-sm rounded-2xl p-2 h-auto">
                          {gamesData.map((gameTab) => (
                            <TabsTrigger
                              key={gameTab.id}
                              value={gameTab.id}
                              className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl data-[state=active]:bg-white/30 data-[state=active]:shadow-sm transition-all duration-200 group min-h-[80px] text-center"
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 group-data-[state=active]:bg-white/40 transition-colors">
                                <div className="text-white/80 group-data-[state=active]:text-white transition-colors">
                                  {gameTab.icon}
                                </div>
                              </div>
                              <span className="text-xs font-medium text-white/80 group-data-[state=active]:text-white leading-tight">
                                {gameTab.title}
                              </span>
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </div>
                      
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl">
                              {game.icon}
                            </div>
                            <div>
                              <CardTitle className="text-2xl font-bold mb-1">
                                {game.title} <Badge variant="secondary" className={`${getDifficultyColor(game.difficulty)} border font-medium`}>
                              {game.difficulty}
                            </Badge>
                              </CardTitle>
                              <p className="text-white/90 text-sm font-medium">
                                {game.category}
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-white/90 text-lg leading-relaxed mb-4">
                            {game.description}
                          </p>
                    
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    <div className="w-full h-[600px]">
                      <iframe
                        src={game.iframe.src}
                        frameBorder="0"
                        allowFullScreen
                        allow={game.iframe.allow}
                        className="w-full h-full"
                        style={{
                          minHeight: '600px',
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Bottom CTA */}

        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">
            Want access to more games and personalized learning paths?
          </p>
            <Link href="/#cta">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-brand-blue to-brand-orange text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group">
              <span className="font-semibold">Explore Demo</span>
                <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
        </div>
      </div>
    </section>
  );
};
