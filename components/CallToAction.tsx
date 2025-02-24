import { Button } from "@/components/ui/button";
import { Users, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { SignupForm } from './SignupForm';

export function CallToAction() {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const router = useRouter();

  const handleEducatorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSignupOpen(true);
  };

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-transparent to-brand-green/10" />
      <div className="container mx-auto px-4 sm:px-6 relative">
        <Card className="bg-white/50 backdrop-blur-sm border border-white/20">
          <CardContent className="text-center py-12 px-6">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent">Choose Your Path</span> 🚀
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
              Whether you&apos;re a parent or an educator, we have the perfect solution for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => router.push('/demo')}
                className="bg-brand-blue hover:bg-brand-blue-dark text-white rounded-full px-8 py-6 text-lg"
              >
                <Users className="mr-2 h-5 w-5" />
                I am a Parent
              </Button>
              <Button 
                onClick={handleEducatorClick}
                variant="outline"
                className="border-brand-blue text-brand-blue hover:bg-brand-blue/10 rounded-full px-8 py-6 text-lg"
              >
                <GraduationCap className="mr-2 h-5 w-5" />
                I am an Educator
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Signup Form Dialog */}
      <SignupForm 
        open={isSignupOpen} 
        onOpenChange={setIsSignupOpen}
      />
    </section>
  );
}
