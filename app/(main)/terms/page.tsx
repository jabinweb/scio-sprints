import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | ScioSprints',
  description: 'Terms of Service for ScioSprints interactive educational platform. Please read carefully before using the service.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">
              Terms of Service
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Please read these terms carefully before using our educational platform.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: September 30, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">1. Who These Terms Apply To</h2>
              <div className="space-y-4 text-gray-700">
                <p>These Terms apply to all users: students, teachers, and parents.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">2. What We Provide</h2>
              <div className="space-y-4 text-gray-700">
                <p>ScioSprints is an interactive educational platform offering:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Curriculum-aligned games and activities</li>
                  <li>Progress tracking and analytics</li>
                  <li>Personalized and classroom learning tools</li>
                  <li>Assessment and evaluation features</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">3. Accounts</h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>You must provide accurate information when creating an account.</li>
                  <li>You are responsible for keeping your login secure.</li>
                  <li>Notify us immediately of unauthorized account use.</li>
                  <li>One person = one account.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">4. Acceptable Use</h2>
              <div className="space-y-4 text-gray-700">
                <p>You may use the platform only for educational purposes. Do not:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Share harmful, offensive, or illegal content</li>
                  <li>Break into or misuse other accounts</li>
                  <li>Disrupt the platform or use bots to access it</li>
                  <li>Copy or distribute our content outside the platform without permission</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">5. Subscription & Payment</h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>All subscriptions run until March 31st of the current financial year (end of academic year).</li>
                  <li>We only offer Academic Year Plans — no monthly plans.</li>
                  <li>Subscriptions are not auto-renewed; they simply end on March 31.</li>
                  <li>Payments are made in advance and are non-refundable, except under our 7-day Money Back Guarantee.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">6. Intellectual Property</h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>All games, content, and materials belong to ScioLabs.</li>
                  <li>You may not reproduce or distribute them outside the platform.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">7. Privacy & Data</h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>We collect only the minimum information needed for educational purposes.</li>
                  <li>Student data is protected and shared only with parents.</li>
                  <li>We do not use personal data for advertising.</li>
                  <li>See our Privacy Policy for details.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">8. Limitation of Liability</h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>The platform is provided “as is.”</li>
                  <li>While we cannot guarantee uninterrupted service, we ensure the lowest downtime possible.</li>
                  <li>In case of major disruptions due to third-party software, we will provide prior notice.</li>
                  <li>Our liability is limited to the subscription amount paid.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">9. Termination</h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>You may cancel anytime; access will continue until March 31.</li>
                  <li>If you cancel within 7 days, you’ll get a full refund, but access will be revoked immediately.</li>
                  <li>We may suspend or terminate accounts that violate these terms.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">10. Contact Us</h2>
              <div className="space-y-4 text-gray-700">
                <p>For questions:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Email:</strong> info@sciolabs.in</p>
                  <p><strong>Phone:</strong> +91 9495212484</p>
                  <p><strong>Address:</strong> N-304, Ashiyana, Sector N, Lucknow, UP 226012, India</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
