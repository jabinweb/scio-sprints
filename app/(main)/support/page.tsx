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

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-semibold text-brand-blue mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium">How do I sign in?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 p-4 text-gray-600">
                    You can log in using Google Sign-In. Or, type your email and we’ll send you a sign-in link — no password to remember.
                  </div>
                </details>

                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium">I forgot my password — what should I do?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 p-4 text-gray-600">
                    No need to reset anything. Just use Google Sign-In or request a new email sign-in link.
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
                    You can pay securely through our payment gateway using cards, UPI, or net banking.
                  </div>
                </details>

                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium">I was charged wrongly. How do I get a refund?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 p-4 text-gray-600">
                    Email us at <a href="mailto:info@sciolabs.in" className="text-brand-blue">info@sciolabs.in</a> or contact us on WhatsApp. If it’s within 7 days of purchase, we’ll refund you — no questions asked.
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
                    Send us an email or a WhatsApp message to cancel. If you cancel within 7 days you’ll get a refund but access stops immediately. After 7 days you’ll keep access until March 31, when it ends automatically.
                  </div>
                </details>

                {/* Keep the Having payment issues block as-is (special highlighted) */}
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border border-orange-200">
                    <span className="font-medium text-orange-800">Having payment issues?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 p-4 text-gray-700">
                    <p className="mb-3">If your payment failed or you&apos;re experiencing subscription issues, we have comprehensive troubleshooting tools to help:</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">Check payment status and verify transactions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">Manual payment verification and retry options</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">Subscription validation and account linking</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <a
                        href="/dashboard/payments"
                        className="inline-flex items-center px-3 py-2 bg-brand-blue text-white rounded-lg text-sm hover:bg-brand-blue/90 transition-colors"
                      >
                        View Payment History
                      </a>
                      <a
                        href="mailto:info@sciolabs.in"
                        className="inline-flex items-center px-3 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm hover:bg-orange-200 transition-colors"
                      >
                        Contact Billing Support
                      </a>
                    </div>
                  </div>
                </details>

                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium">The platform is not working properly. What should I do?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 p-4 text-gray-600">
                    Check your internet and refresh the page. If it still doesn’t work, take a screenshot and send it to us by email or WhatsApp. We’ll fix it as soon as possible.
                  </div>
                </details>

                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium">I found a mistake in the content. How can I report it?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 p-4 text-gray-600">
                    Take a screenshot and share it with us on WhatsApp or email. Our team will correct it quickly.
                  </div>
                </details>

                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium">How can I contact support?</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 p-4 text-gray-600">
                    <p className="mb-1">WhatsApp: <a href="https://wa.me/919876543210" className="text-brand-blue">+91 98765 43210</a> (Mon–Fri, 9 AM–6 PM IST)</p>
                    <p className="mb-1">Email: <a href="mailto:info@sciolabs.in" className="text-brand-blue">info@sciolabs.in</a> (we reply within 24 hours)</p>
                    <p className="mb-1">Phone: +91 98765 43210</p>
                    <p className="mb-0">Live Chat: Available on our website during support hours</p>
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
                  <p className="text-gray-600 text-sm mb-1">info@sciolabs.in</p>
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
          </div>
        </div>
      </div>
    </div>
  );
}
