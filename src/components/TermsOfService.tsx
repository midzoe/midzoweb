import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Terms of Service</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. Additionally, when using this website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Services</h2>
            <p className="text-gray-600 mb-4">
              Midzoe provides a platform for:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Educational travel services and student support</li>
              <li>Professional training and job search assistance</li>
              <li>Tourism and travel planning</li>
              <li>Business travel and networking services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Responsibilities</h2>
            <p className="text-gray-600 mb-4">
              Users of the service agree to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of their account</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not interfere with the proper working of the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Payment Terms</h2>
            <p className="text-gray-600">
              Users agree to pay all fees or charges to their account based on the fees, charges, and billing terms in effect at the time a fee or charge is due and payable. All payments are non-refundable unless explicitly stated otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
            <p className="text-gray-600">
              The Service and its original content, features, and functionality are and will remain the exclusive property of Midzoe and its licensors. The Service is protected by copyright, trademark, and other laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-600">
              In no event shall Midzoe, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Changes to Terms</h2>
            <p className="text-gray-600">
              We reserve the right to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this site. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Information</h2>
            <p className="text-gray-600">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 text-gray-600">
              <p>Email: legal@midzoe.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>Address: 123 Travel Street, Global City</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;