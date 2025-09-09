import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Return and Refund Policy | Scio Labs',
  description: 'Learn about our return and refund policy for Scio Labs subscriptions and services.',
};

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">
              Return &amp; Refund Policy
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Our commitment to customer satisfaction includes a fair and transparent refund policy.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: September 9, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">1. Refund Eligibility</h2>
              <div className="space-y-4 text-gray-700">
                <p>We offer refunds under the following circumstances:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Free Trial Period:</strong> Cancel within the trial period for no charge</li>
                  <li><strong>Technical Issues:</strong> When we cannot resolve platform accessibility problems</li>
                  <li><strong>Billing Errors:</strong> Incorrect charges or duplicate payments</li>
                  <li><strong>Service Interruption:</strong> Extended outages affecting your subscription</li>
                  <li><strong>Satisfaction Guarantee:</strong> 30-day money-back guarantee for new subscribers</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">2. Refund Process</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium">How to Request a Refund</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Contact our support team at info@sciolabs.in</li>
                  <li>Provide your account information and reason for refund</li>
                  <li>Include any relevant documentation or screenshots</li>
                  <li>Allow 5-7 business days for review and processing</li>
                </ol>

                <h3 className="text-lg font-medium mt-6">Required Information</h3>
                <p>When requesting a refund, please include:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Account email address</li>
                  <li>Subscription or transaction ID</li>
                  <li>Date of purchase</li>
                  <li>Detailed reason for refund request</li>
                  <li>Any supporting documentation</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">3. Refund Timeframes</h2>
              <div className="space-y-4 text-gray-700">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-medium text-brand-blue mb-2">Individual Subscriptions</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Monthly Plans:</strong> Full refund if cancelled within 30 days</li>
                    <li><strong>Annual Plans:</strong> Prorated refund based on unused time</li>
                    <li><strong>Free Trials:</strong> No charge if cancelled before trial ends</li>
                  </ul>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="text-lg font-medium text-brand-orange mb-2">Institutional Subscriptions</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>School Plans:</strong> 60-day satisfaction guarantee</li>
                    <li><strong>District Plans:</strong> Custom refund terms based on contract</li>
                    <li><strong>Enterprise Plans:</strong> Negotiated refund policy in agreement</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibent text-brand-blue mb-4">4. Non-Refundable Items</h2>
              <div className="space-y-4 text-gray-700">
                <p>The following items are generally not eligible for refunds:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Subscriptions cancelled after the guarantee period</li>
                  <li>Partial months of service already consumed</li>
                  <li>Third-party content or premium game access</li>
                  <li>Custom content creation services</li>
                  <li>Training and professional development sessions</li>
                  <li>Accounts terminated for terms of service violations</li>
                </ul>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-6">
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">⚠️ Important Note</h3>
                  <p className="text-yellow-700">
                    Refunds are not available for subscriptions where significant usage has occurred 
                    (more than 50% of content accessed) unless due to technical issues on our end.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">5. Processing Time and Method</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium">Processing Timeframes</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Review Process:</strong> 3-5 business days</li>
                  <li><strong>Approval Notification:</strong> Within 24 hours of approval</li>
                  <li><strong>Credit Card Refunds:</strong> 5-10 business days</li>
                  <li><strong>PayPal Refunds:</strong> 3-5 business days</li>
                  <li><strong>Bank Transfer Refunds:</strong> 7-14 business days</li>
                </ul>

                <h3 className="text-lg font-medium mt-6">Refund Methods</h3>
                <p>Refunds will be processed using the same payment method used for the original purchase:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Credit card refunds to the original card</li>
                  <li>PayPal refunds to the original PayPal account</li>
                  <li>Bank transfers for institutional payments</li>
                  <li>Account credits for specific circumstances</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">6. Cancellation vs. Refund</h2>
              <div className="space-y-4 text-gray-700">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-brand-blue mb-2">Cancellation</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Stops future billing</li>
                      <li>• Access continues until period ends</li>
                      <li>• No refund for current period</li>
                      <li>• Can be done anytime</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-brand-orange mb-2">Refund</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Returns payment for current period</li>
                      <li>• Immediate loss of access</li>
                      <li>• Subject to eligibility requirements</li>
                      <li>• Requires approval process</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">7. Special Circumstances</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium">Educational Hardship</h3>
                <p>We understand that circumstances can change. If you&apos;re experiencing financial hardship, please contact us to discuss:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Payment plan options</li>
                  <li>Temporary account suspension</li>
                  <li>Reduced pricing programs</li>
                  <li>Alternative refund arrangements</li>
                </ul>

                <h3 className="text-lg font-medium mt-6">Technical Issues</h3>
                <p>If you&apos;re experiencing technical problems:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Contact support first for troubleshooting</li>
                  <li>Document any ongoing issues</li>
                  <li>We may extend your subscription for service disruptions</li>
                  <li>Refunds available if issues cannot be resolved</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">8. Contact Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>For refund requests or questions about this policy:</p>
                <div className="bg-gray-50 p-4 rounded-lg grid md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Refund Requests:</strong></p>
                    <p>Email: info@sciolabs.in</p>
                    <p>Phone: +91 98765 43210</p>
                    <p>Address: N-304, Ashiyana, Sector N, Lucknow, UP - 226012, India</p>
                  </div>
                  <div>
                    <p><strong>General Support:</strong></p>
                    <p>Email: info@sciolabs.in</p>
                    <p>Live Chat: Available on website</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-medium text-brand-blue mb-2">📞 Need Help?</h3>
                  <p className="text-blue-700">
                    Our customer service team is available Monday-Friday, 9AM-6PM IST. 
                    We&apos;re committed to resolving any issues quickly and fairly.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
