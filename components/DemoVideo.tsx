'use client';

import { PlayCircle } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DemoVideo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-orange-900" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            See ScioLabs in Action ✨
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Watch how our platform makes learning interactive and engaging for students
          </p>
        </div>

        {/* Video Preview */}
        <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
          <div className="aspect-video bg-orange-100 relative group cursor-pointer"
               onClick={() => setIsOpen(true)}>
            {/* Thumbnail Image */}
            <div className="relative w-full h-full">
              <Image
                src="https://images.unsplash.com/photo-1610484826967-09c5720778c7"
                alt="Platform demo"
                fill
                priority
                className="object-cover group-hover:brightness-75 transition-all"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1100px"
              />
            </div>
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button 
                variant="ghost"
                size="lg"
                className="w-20 h-20 rounded-full bg-white/90 hover:bg-white group"
              >
                <PlayCircle className="w-12 h-12 text-orange-500 group-hover:scale-110 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Features List */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex justify-center gap-8 text-white">
              {["Interactive Quizzes", "Real-time Progress", "Gamified Learning"].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Video Modal */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-4xl p-0 bg-black overflow-hidden">
            <DialogHeader>
              <DialogTitle className="sr-only">
                ScioLabs Platform Demo Video
              </DialogTitle>
            </DialogHeader>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/aKKIdJNU6TI"
                title="ScioLabs Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="border-0"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
