import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Scio Labs',
  description: 'Read the terms and conditions for using Scio Labs educational platform.',
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
            Last updated: September 9, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">1. Acceptance of Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p>By accessing and using Scio Labs educational platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
                <p>These Terms of Service apply to all users of the platform, including students, teachers, parents, and educational institutions.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">2. Description of Service</h2>
              <div className="space-y-4 text-gray-700">
                <p>Scio Labs provides an interactive educational platform that offers:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Curriculum-aligned educational games and activities</li>
                  <li>Progress tracking and performance analytics</li>
                  <li>Personalized learning experiences</li>
                  <li>Collaborative learning tools for classrooms</li>
                  <li>Assessment and evaluation features</li>
                  <li>Content creation tools for educators</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">3. User Accounts and Registration</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium">Account Creation</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You must provide accurate and complete information during registration</li>
                  <li>You are responsible for maintaining the security of your account</li>
                  <li>You must notify us immediately of any unauthorized use of your account</li>
                  <li>One person may not maintain multiple accounts</li>
                </ul>

                <h3 className="text-lg font-medium mt-6">Account Types</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Student Accounts:</strong> For individual learners</li>
                  <li><strong>Teacher Accounts:</strong> For educators managing classrooms</li>
                  <li><strong>Parent Accounts:</strong> For monitoring child progress</li>
                  <li><strong>Institution Accounts:</strong> For schools and organizations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">4. Acceptable Use Policy</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium">Permitted Uses</h3>
                <p>You may use our platform for educational purposes, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Accessing educational content and games</li>
                  <li>Tracking learning progress</li>
                  <li>Collaborating with classmates and teachers</li>
                  <li>Creating and sharing educational content</li>
                </ul>

                <h3 className="text-lg font-medium mt-6">Prohibited Uses</h3>
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the platform for any illegal or unauthorized purpose</li>
                  <li>Share inappropriate, offensive, or harmful content</li>
                  <li>Attempt to gain unauthorized access to other accounts</li>
                  <li>Interfere with or disrupt the platform or servers</li>
                  <li>Use automated systems to access the platform</li>
                  <li>Copy, distribute, or modify our content without permission</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">5. Subscription and Payment Terms</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium">Subscription Plans</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Various subscription plans are available for different user types</li>
                  <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                  <li>Free trial periods may be offered for new users</li>
                  <li>Prices may change with 30 days advance notice</li>
                </ul>

                <h3 className="text-lg font-medium mt-6">Payment Processing</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Payments are processed through secure third-party providers</li>
                  <li>All fees are non-refundable except as stated in our refund policy</li>
                  <li>Failed payments may result in service suspension</li>
                  <li>You authorize automatic renewal unless cancelled</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibent text-brand-blue mb-4">6. Intellectual Property Rights</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium">Our Content</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All platform content, games, and materials are owned by Scio Labs</li>
                  <li>You may not reproduce, distribute, or create derivative works</li>
                  <li>Educational use is permitted within the platform only</li>
                  <li>Our trademarks and logos may not be used without permission</li>
                </ul>

                <h3 className="text-lg font-medium mt-6">User Content</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You retain ownership of content you create</li>
                  <li>You grant us license to use your content within the platform</li>
                  <li>You are responsible for ensuring you have rights to uploaded content</li>
                  <li>We may remove content that violates these terms</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">7. Privacy and Data Protection</h2>
              <div className="space-y-4 text-gray-700">
                <p>Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these terms by reference.</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We collect minimal necessary information for educational purposes</li>
                  <li>Student data is protected according to FERPA and COPPA requirements</li>
                  <li>Parents and educators have access to student progress data</li>
                  <li>Data is not used for advertising or non-educational purposes</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">8. Limitation of Liability</h2>
              <div className="space-y-4 text-gray-700">
                <p>To the maximum extent permitted by law:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Scio Labs provides the platform &quot;as is&quot; without warranties</li>
                  <li>We are not liable for any indirect, incidental, or consequential damages</li>
                  <li>Our total liability is limited to the amount paid for services</li>
                  <li>We do not guarantee uninterrupted or error-free service</li>
                  <li>Users are responsible for their own data backup</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">9. Termination</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium">Termination by User</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You may cancel your account at any time</li>
                  <li>Cancellation takes effect at the end of the current billing period</li>
                  <li>You remain responsible for charges incurred before cancellation</li>
                </ul>

                <h3 className="text-lg font-medium mt-6">Termination by Scio Labs</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We may suspend or terminate accounts for terms violations</li>
                  <li>We may discontinue the service with reasonable notice</li>
                  <li>Upon termination, your access to content will cease</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">10. Contact Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>For questions about these Terms of Service, please contact us:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Email:</strong> info@sciolabs.in</p>
                  <p><strong>Address:</strong> N-304, Ashiyana, Sector N, Lucknow, UP - 226012, India</p>
                  <p><strong>Phone:</strong> +91 98765 43210</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
