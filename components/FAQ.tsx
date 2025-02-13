'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from "@/components/ui/card";

const faqs = [
  {
    question: "What age groups is ScioLabs suitable for?",
    answer: "ScioLabs is designed for students from grades 6-12, with content tailored to different academic levels and curricula."
  },
  {
    question: "How does the gamification system work?",
    answer: "Students earn points, badges, and rewards while completing lessons and quizzes. They can compete with classmates and track their progress on leaderboards."
  },
  {
    question: "Is ScioLabs aligned with school curriculum?",
    answer: "Yes, our content is fully aligned with CBSE and ICSE curricula, ensuring that students learn exactly what they need for their academic success."
  },
  {
    question: "Can teachers customize the content?",
    answer: "Absolutely! Teachers can create custom quizzes, modify existing content, and track student progress through our comprehensive dashboard."
  },
  {
    question: "What platforms does ScioLabs support?",
    answer: "ScioLabs works seamlessly across multiple platforms including web browsers, tablets, and mobile devices, with integration support for various learning tools."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-12 sm:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12">
          <span className="bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent">
            Frequently Asked Questions
          </span> 💭
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {faqs.map((faq, index) => (
            <Card 
              key={index}
              className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-md
                ${openIndex === index ? 'ring-2 ring-brand-blue/20 shadow-lg' : 'hover:bg-accent/50'}
              `}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-heading text-lg font-semibold mb-2 text-foreground">
                    {faq.question}
                  </h3>
                  <div className={`
                    overflow-hidden transition-all duration-200
                    ${openIndex === index ? 'max-h-48 opacity-100 mt-2' : 'max-h-0 opacity-0'}
                  `}>
                    <p className="text-foreground/70">
                      {faq.answer}
                    </p>
                  </div>
                </div>
                <div className="text-brand-blue">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
