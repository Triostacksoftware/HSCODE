"use client";

import React from "react";
import { MdArrowBack } from "react-icons/md";
import { useRouter } from "next/navigation";

const TermsOfServicePage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 montserrat">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-gray-700 hover:text-[#004b87] transition-colors group"
            >
              <MdArrowBack className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs md:text-sm font-medium">Back</span>
            </button>
            <h1 className="text-base md:text-lg lg:text-xl font-bold text-gray-900">
              Terms of Service
            </h1>
            <div className="w-12 md:w-16"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="prose prose-sm md:prose-base max-w-none">
            <p className="text-xs md:text-sm text-gray-500 mb-6">
              Last Updated: January 2025
            </p>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                By accessing and using the services provided by HS CODES
                PRIVATE LIMITED ("we," "our," or "us"), you accept and agree to
                be bound by the terms and provision of this agreement. If you
                do not agree to abide by the above, please do not use this
                service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                2. Description of Service
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                HS CODES provides a B2B marketplace platform that connects
                businesses, including manufacturers, exporters, and
                wholesalers, with other businesses and companies across the
                globe. Our services include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm md:text-base text-gray-700">
                <li>Business directory and listings</li>
                <li>Trade facilitation services</li>
                <li>Subscription-based premium features</li>
                <li>Communication and networking tools</li>
                <li>Other related services as may be offered from time to time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                3. User Accounts
              </h2>
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                3.1 Registration
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                To access certain features, you must register for an account.
                You agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm md:text-base text-gray-700">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>

              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                3.2 Account Termination
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                We reserve the right to suspend or terminate your account at any
                time for violation of these terms or for any other reason we
                deem necessary.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                4. Subscription Plans and Payments
              </h2>
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                4.1 Subscription Terms
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                Some features require a paid subscription. By subscribing, you
                agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm md:text-base text-gray-700">
                <li>Pay all fees associated with your subscription</li>
                <li>Automatic renewal unless cancelled</li>
                <li>No refunds for partial subscription periods</li>
                <li>Price changes with 30 days notice</li>
              </ul>

              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                4.2 Payment Processing
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                Payments are processed through third-party payment processors.
                We are not responsible for any issues arising from payment
                processing.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                5. User Conduct
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm md:text-base text-gray-700">
                <li>Use the service for any illegal purpose</li>
                <li>Violate any laws or regulations</li>
                <li>Infringe upon intellectual property rights</li>
                <li>Transmit harmful code, viruses, or malware</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Impersonate any person or entity</li>
                <li>Collect user information without consent</li>
                <li>Interfere with or disrupt the service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                6. Intellectual Property
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                All content, features, and functionality of the service are owned
                by HS CODES and are protected by international copyright,
                trademark, and other intellectual property laws.
              </p>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                You retain ownership of content you submit but grant us a
                worldwide, non-exclusive, royalty-free license to use,
                reproduce, and distribute your content in connection with the
                service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                7. Disclaimers
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                The service is provided "as is" and "as available" without
                warranties of any kind, either express or implied, including but
                not limited to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm md:text-base text-gray-700">
                <li>Warranties of merchantability</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement</li>
                <li>Accuracy, reliability, or completeness of information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                8. Limitation of Liability
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                To the maximum extent permitted by law, HS CODES shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages, or any loss of profits or revenues, whether
                incurred directly or indirectly, or any loss of data, use,
                goodwill, or other intangible losses resulting from your use of
                the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                9. Indemnification
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                You agree to indemnify and hold harmless HS CODES, its
                officers, directors, employees, and agents from any claims,
                damages, losses, liabilities, and expenses (including legal
                fees) arising out of your use of the service or violation of
                these terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                10. Modifications to Service
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                We reserve the right to modify, suspend, or discontinue the
                service (or any part thereof) at any time with or without
                notice. We shall not be liable to you or any third party for any
                modification, suspension, or discontinuation of the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                11. Governing Law
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance
                with the laws of India, without regard to its conflict of law
                provisions. Any disputes arising under these terms shall be
                subject to the exclusive jurisdiction of the courts in Hyderabad,
                Telangana, India.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                12. Changes to Terms
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                We reserve the right to modify these terms at any time. We will
                notify users of any material changes by posting the new Terms
                of Service on this page and updating the "Last Updated" date.
                Your continued use of the service after such changes constitutes
                acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                13. Contact Information
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                If you have any questions about these Terms of Service, please
                contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg text-sm md:text-base text-gray-700">
                <p className="mb-2">
                  <strong>HS CODES PRIVATE LIMITED</strong>
                </p>
                <p className="mb-2">
                  Email:{" "}
                  <a
                    href="mailto:info@hscodes.com"
                    className="text-[#004b87] hover:text-[#3e9c35] underline"
                  >
                    info@hscodes.com
                  </a>
                </p>
                <p>
                  Address: HIG-135, Flat no 201, Sri godha Nilayam, VI phase,
                  K.P.H.B.Colony, Kukatpally, Hyderabad-500072. Telangana
                  State, INDIA
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;

