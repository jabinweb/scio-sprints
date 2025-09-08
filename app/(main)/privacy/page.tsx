import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Scio Labs',
  description: 'Learn how Scio Labs collects, uses, and protects your personal information.',
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
            Last updated: September 9, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <p>We may collect the following personal information when you use our services:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and email address when you create an account</li>
                  <li>School or educational institution information</li>
                  <li>Student grade level and curriculum preferences</li>
                  <li>Payment information for subscription services</li>
                  <li>Communication preferences and feedback</li>
                </ul>

                <h3 className="text-lg font-medium mt-6">Usage Information</h3>
                <p>We automatically collect certain information about your use of our platform:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Game performance and learning progress</li>
                  <li>Time spent on different activities</li>
                  <li>Device information and browser type</li>
                  <li>IP address and location data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>We use the collected information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and improve our educational services</li>
                  <li>Personalize learning experiences and content</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Send important updates and educational content</li>
                  <li>Analyze usage patterns to enhance our platform</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Ensure platform security and prevent fraud</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">3. Information Sharing</h2>
              <div className="space-y-4 text-gray-700">
                <p>We do not sell, trade, or rent your personal information to third parties. We may share information in the following circumstances:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Educational Partners:</strong> With schools and teachers for educational purposes</li>
                  <li><strong>Service Providers:</strong> With trusted partners who help operate our platform</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">4. Data Security</h2>
              <div className="space-y-4 text-gray-700">
                <p>We implement appropriate security measures to protect your information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Limited access to personal information</li>
                  <li>Secure payment processing through trusted providers</li>
                  <li>Regular backups and disaster recovery procedures</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">5. Children's Privacy</h2>
              <div className="space-y-4 text-gray-700">
                <p>We are committed to protecting children's privacy in accordance with COPPA and GDPR:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We do not knowingly collect personal information from children under 13 without parental consent</li>
                  <li>Parents and teachers can review and delete children's information</li>
                  <li>We do not use children's information for marketing purposes</li>
                  <li>Educational data is used solely for learning purposes</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">6. Your Rights</h2>
              <div className="space-y-4 text-gray-700">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and review your personal information</li>
                  <li>Correct or update inaccurate information</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data in a portable format</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Restrict or object to certain data processing</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">7. Cookies and Tracking</h2>
              <div className="space-y-4 text-gray-700">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze platform usage and performance</li>
                  <li>Provide personalized content and recommendations</li>
                  <li>Ensure platform security and functionality</li>
                </ul>
                <p>You can control cookie settings through your browser preferences.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">8. Contact Us</h2>
              <div className="space-y-4 text-gray-700">
                <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Email:</strong> info@sciosprints.com</p>
                  <p><strong>Address:</strong> N-304, Ashiyana, Sector N, Lucknow, UP - 226012, India</p>
                  <p><strong>Phone:</strong> +91 98765 43210</p>
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
