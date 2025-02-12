import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function CallToAction() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-transparent to-brand-green/10" />
      <div className="container mx-auto px-4 sm:px-6 relative">
        <Card className="bg-white/50 backdrop-blur-sm border border-white/20">
          <CardContent className="text-center py-12 px-6">
            <h2 className="text-4xl font-bold mb-6 ">
              <span className="bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent">Ready to Transform Learning?</span> 🚀
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
              Join thousands of students and teachers who have already made learning more engaging and effective.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://demo.sciolabs.in" target="_blank" rel="noopener noreferrer">
                <Button className="bg-brand-blue hover:bg-brand-blue-dark text-white rounded-full">
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <a href="mailto:info@sciolabs.in?subject=Demo Request">
                <Button variant="outline" className="border-brand-blue text-brand-blue hover:bg-brand-blue/10 rounded-full">
                  Schedule Demo
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
