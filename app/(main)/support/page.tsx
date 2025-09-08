import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support | Scio Labs',
  description: 'Get help and support for using Scio Labs educational platform.',
};

export default function Support() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">
              Support Center
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            We&apos;re here to help! Find answers to common questions or get in touch with our support team.
          </p>
        </div>

        {/* Quick Help Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-brand-blue mb-2">FAQ</h3>
            <p className="text-gray-600 mb-4">Find quick answers to the most common questions about our platform.</p>
            <button className="text-brand-blue hover:text-brand-orange transition-colors font-medium">
              Browse FAQ →
            </button>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-brand-blue mb-2">User Guides</h3>
            <p className="text-gray-600 mb-4">Step-by-step tutorials for students, teachers, and parents.</p>
            <button className="text-brand-blue hover:text-brand-orange transition-colors font-medium">
              View Guides →
            </button>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-brand-blue mb-2">Contact Us</h3>
            <p className="text-gray-600 mb-4">Get personalized help from our dedicated support team.</p>
            <button className="text-brand-blue hover:text-brand-orange transition-colors font-medium">
              Send Message →
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-semibold text-brand-blue mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium">How do I create a student account?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 p-4 text-gray-600">
                    To create a student account, click the &quot;Sign Up&quot; button on our homepage, select &quot;Student&quot; as your account type, and fill in the required information including your name, email, and grade level. You&apos;ll receive a confirmation email to activate your account.
                  </div>
                </details>

                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium">What subjects and grade levels do you support?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 p-4 text-gray-600">
                    Scio Labs supports multiple subjects including Math, Science, English, Social Studies, and more for grades K-12. Our content is aligned with major curriculum standards including Common Core, NGSS, and international curricula.
                  </div>
                </details>

                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium">How can teachers track student progress?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 p-4 text-gray-600">
                    Teachers have access to comprehensive dashboards showing student progress, time spent on activities, performance analytics, and detailed reports. You can view individual student data or class-wide statistics to inform your instruction.
                  </div>
                </details>

                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium">Is there a mobile app available?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 p-4 text-gray-600">
                    Yes! Scio Labs is available as a mobile app for both iOS and Android devices. You can download it from the App Store or Google Play Store. The mobile app offers full functionality including games, progress tracking, and offline play for select activities.
                  </div>
                </details>

                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium">What payment methods do you accept?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 p-4 text-gray-600">
                    We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for institutional accounts. All payments are processed securely through encrypted payment gateways.
                  </div>
                </details>

                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium">How do I cancel my subscription?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 p-4 text-gray-600">
                    You can cancel your subscription anytime by logging into your account, going to Settings &gt; Subscription, and clicking &quot;Cancel Subscription.&quot; Your access will continue until the end of your current billing period.
                  </div>
                </details>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-brand-blue mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Email Support</h4>
                  <p className="text-gray-600 text-sm mb-1">info@sciosprints.com</p>
                  <p className="text-gray-500 text-xs">Response within 24 hours</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Phone Support</h4>
                  <p className="text-gray-600 text-sm mb-1">+91 98765 43210</p>
                  <p className="text-gray-500 text-xs">Mon-Fri, 9AM-6PM IST</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Address</h4>
                  <p className="text-gray-600 text-sm mb-1">N-304, Ashiyana</p>
                  <p className="text-gray-600 text-sm mb-1">Sector N, Lucknow</p>
                  <p className="text-gray-600 text-sm mb-1">UP - 226012, India</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Live Chat</h4>
                  <p className="text-gray-600 text-sm mb-1">Available on our website</p>
                  <p className="text-gray-500 text-xs">Mon-Fri, 9AM-6PM IST</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-brand-blue mb-4">Quick Links</h3>
              <div className="space-y-3">
                <a href="/getting-started" className="block text-gray-600 hover:text-brand-blue transition-colors">
                  Getting Started Guide
                </a>
                <a href="/teacher-resources" className="block text-gray-600 hover:text-brand-blue transition-colors">
                  Teacher Resources
                </a>
                <a href="/parent-guide" className="block text-gray-600 hover:text-brand-blue transition-colors">
                  Parent Guide
                </a>
                <a href="/system-requirements" className="block text-gray-600 hover:text-brand-blue transition-colors">
                  System Requirements
                </a>
                <a href="/accessibility" className="block text-gray-600 hover:text-brand-blue transition-colors">
                  Accessibility Features
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-r from-brand-blue to-brand-orange rounded-2xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Need Immediate Help?</h3>
              <p className="text-white/90 text-sm mb-4">
                Our support team is standing by to help you get the most out of Scio Labs.
              </p>
              <button className="bg-white text-brand-blue px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Start Live Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
