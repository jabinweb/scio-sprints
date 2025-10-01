import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Return and Refund Policy | ScioSprints',
  description: 'Return & Refund Policy for ScioSprints — subscription validity, refund window, cancellation and contact details.',
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
            Last updated: September 30, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-brand-blue mb-4">Return &amp; Refund Policy</h2>
              <div className="space-y-4 text-gray-700">
                <p>At ScioSprints, we keep things simple and transparent.</p>

                <h3 className="text-lg font-medium mt-4">Subscription Validity</h3>
                <p>All subscriptions are valid until March 31st of the current financial year, which also marks the end of the academic year.</p>

                <h3 className="text-lg font-medium mt-4">7-Day Money Back Guarantee</h3>
                <p>We offer a 7-day no-questions-asked refund policy.</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Try the platform.</li>
                  <li>If you’re not satisfied, email us at <strong>info@sciolabs.in</strong> within 7 days of purchase.</li>
                  <li>You’ll receive your refund through the same payment gateway you used.</li>
                </ul>

                <h3 className="text-lg font-medium mt-4">Plan Details</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Only Academic Year Plans are available.</li>
                  <li>We do not offer monthly subscriptions.</li>
                </ul>

                <h3 className="text-lg font-medium mt-4">Cancellation</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>If you cancel within 7 days of purchase, you will receive a full refund.</li>
                  <li>If you do not cancel within 7 days, your subscription will continue until March 31st of the academic year.</li>
                  <li>Subscriptions are not auto-renewed — they simply end on March 31st.</li>
                </ul>

                <h3 className="text-lg font-medium mt-4">Contact Us</h3>
                <p>For refunds or questions:</p>
                <div className="bg-gray-50 p-4 rounded-lg grid md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Email:</strong> info@sciolabs.in</p>
                    <p><strong>Phone:</strong> +91 9495212484</p>
                    <p><strong>Address:</strong> N-304, Ashiyana, Sector N, Lucknow, UP 226012, India</p>
                  </div>
                  <div>
                    <p><strong>Support Hours:</strong></p>
                    <p>Mon–Fri, 9 AM–6 PM IST</p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
