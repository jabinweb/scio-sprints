import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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
]

export function FAQ() {
  return (
    <section className="py-12 sm:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-foreground">
          Frequently Asked Questions 💭
        </h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border">
                <AccordionTrigger className="text-lg font-semibold text-foreground">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
