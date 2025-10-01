import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | ScioSprints',
  description: 'Privacy policy for ScioSprints: what we collect, how we use it, and how we protect student and user data.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">
              Privacy Policy
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: September 30, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name, email, and school details</li>
                  <li>Student grade level and curriculum preferences</li>
                  <li>Payment information for subscriptions</li>
                  <li>Communication preferences and feedback</li>
                </ul>

                <h3 className="text-lg font-medium mt-6">Usage Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Learning progress and activity performance</li>
                  <li>Time spent on different activities</li>
                  <li>Device/browser details, IP address, and location data</li>
                  <li>Cookies and similar tracking tools</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Deliver and improve our educational services</li>
                  <li>Personalize learning experiences</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Share important updates and resources</li>
                  <li>Analyze usage for platform improvements</li>
                  <li>Provide customer support and ensure security</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">3. Information Sharing</h2>
              <div className="space-y-4 text-gray-700">
                <p>We do not sell your data. We may share information only when necessary:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>With schools/teachers for educational purposes</li>
                  <li>To comply with legal requirements</li>
                  <li>In case of a merger or business transfer</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">4. Data Security</h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption during transfer and storage</li>
                  <li>Limited access controls</li>
                  <li>Secure payment processing</li>
                  <li>Regular security checks and backups</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">5. Children’s Privacy</h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>We do not collect personal data from children under 13 without parental consent.</li>
                  <li>Parents/teachers can access or delete children’s data anytime.</li>
                  <li>Children’s data is used only for learning — never for marketing.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">6. Your Rights</h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access, review, or update your information</li>
                  <li>Delete your account and data</li>
                  <li>Export your data in a portable format</li>
                  <li>Opt out of marketing emails</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">7. Cookies & Tracking</h2>
              <div className="space-y-4 text-gray-700">
                <p>We use cookies to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Remember your preferences</li>
                  <li>Improve platform performance</li>
                  <li>Provide personalized content</li>
                  <li>Ensure security</li>
                </ul>
                <p>You can adjust cookie settings in your browser.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">8. Changes to This Policy</h2>
              <div className="space-y-4 text-gray-700">
                <p>We may update this policy from time to time. If changes are significant, we will:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Post updates on our website</li>
                  <li>Notify users by email</li>
                  <li>Display notices on the platform</li>
                </ul>
                <p>Continued use after updates means you accept the revised policy.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">9. Contact Us</h2>
              <div className="space-y-4 text-gray-700">
                <p>For privacy questions or requests:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Email:</strong> info@sciolabs.in</p>
                  <p><strong>Phone:</strong> +91 9495212484</p>
                  <p><strong>Address:</strong> N-304, Ashiyana, Sector N, Lucknow, UP 226012, India</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">9. Changes to This Policy</h2>
              <div className="space-y-4 text-gray-700">
                <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Posting the updated policy on our website</li>
                  <li>Sending email notifications to registered users</li>
                  <li>Displaying prominent notices on our platform</li>
                </ul>
                <p>Your continued use of our services after changes become effective constitutes acceptance of the updated policy.</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
