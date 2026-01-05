"use client";

import React from "react";
import { MdArrowBack } from "react-icons/md";
import { useRouter } from "next/navigation";

const PrivacyPolicyPage = () => {
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
              Privacy Policy
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
                1. Introduction
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4">
                HS CODES PRIVATE LIMITED ("we," "our," or "us") is committed to
                protecting your privacy. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you
                visit our website and use our services.
              </p>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                By using our services, you agree to the collection and use of
                information in accordance with this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                2. Information We Collect
              </h2>
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                2.1 Personal Information
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                We may collect personal information that you provide directly to
                us, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm md:text-base text-gray-700">
                <li>Name and contact information (email, phone number)</li>
                <li>Company name and business details</li>
                <li>Billing and payment information</li>
                <li>Account credentials and profile information</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                2.2 Automatically Collected Information
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                When you use our services, we automatically collect certain
                information, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm md:text-base text-gray-700">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent on pages</li>
                <li>Referring website addresses</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                We use the collected information for various purposes:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm md:text-base text-gray-700">
                <li>To provide, maintain, and improve our services</li>
                <li>To process transactions and send related information</li>
                <li>To send you updates, newsletters, and marketing communications</li>
                <li>To respond to your inquiries and provide customer support</li>
                <li>To monitor and analyze usage patterns and trends</li>
                <li>To detect, prevent, and address technical issues</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                4. Information Sharing and Disclosure
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                We do not sell your personal information. We may share your
                information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm md:text-base text-gray-700">
                <li>
                  <strong>Service Providers:</strong> With third-party vendors
                  who perform services on our behalf
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with any
                  merger, sale, or acquisition
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or
                  to protect our rights
                </li>
                <li>
                  <strong>With Your Consent:</strong> For any other purpose
                  disclosed with your consent
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                5. Data Security
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                We implement appropriate technical and organizational security
                measures to protect your personal information. However, no method
                of transmission over the Internet or electronic storage is 100%
                secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                6. Your Rights
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                Depending on your location, you may have the following rights
                regarding your personal information:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm md:text-base text-gray-700">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your personal information</li>
                <li>Objection to processing of your information</li>
                <li>Data portability</li>
                <li>Withdrawal of consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                7. Cookies and Tracking Technologies
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                We use cookies and similar tracking technologies to track
                activity on our website and store certain information. You can
                instruct your browser to refuse all cookies or to indicate when
                a cookie is being sent. For more information, please see our{" "}
                <a
                  href="/cookies"
                  className="text-[#004b87] hover:text-[#3e9c35] underline"
                >
                  Cookie Policy
                </a>
                .
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                8. Third-Party Links
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                Our website may contain links to third-party websites. We are
                not responsible for the privacy practices of these external
                sites. We encourage you to review the privacy policies of any
                third-party sites you visit.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                9. Children's Privacy
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                Our services are not intended for individuals under the age of
                18. We do not knowingly collect personal information from
                children. If you believe we have collected information from a
                child, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                10. Changes to This Privacy Policy
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last Updated" date. You are advised
                to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                11. Contact Us
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                If you have any questions about this Privacy Policy, please
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

export default PrivacyPolicyPage;

