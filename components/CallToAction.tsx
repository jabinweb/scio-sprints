import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CallToAction() {
  return (
    <section className="bg-orange-50 py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-6 text-orange-900" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
          Ready to Transform Learning? 🚀
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of students and teachers who have already made learning more engaging and effective.
        </p>
        <div className="flex gap-4 justify-center">
          <a 
            href="https://demo.sciolabs.in"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button 
              size="lg" 
              variant="default"
              className="bg-orange-500 hover:bg-orange-600"
            >
              Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
          <a 
            href="mailto:info@sciolabs.in?subject=Demo Request"
          >
            <Button 
              size="lg" 
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-50"
            >
              Schedule Demo
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}
