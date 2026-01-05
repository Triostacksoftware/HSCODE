"use client";

import React from "react";
import { MdArrowBack } from "react-icons/md";
import { useRouter } from "next/navigation";

const CookiePolicyPage = () => {
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
              Cookie Policy
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
                1. What Are Cookies?
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                Cookies are small text files that are placed on your computer
                or mobile device when you visit a website. They are widely used
                to make websites work more efficiently and provide information to
                the website owners. Cookies allow a website to recognize your
                device and store some information about your preferences or past
                actions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                2. How We Use Cookies
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                HS CODES PRIVATE LIMITED uses cookies and similar tracking
                technologies to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm md:text-base text-gray-700">
                <li>Remember your preferences and settings</li>
                <li>Keep you signed in to your account</li>
                <li>Understand how you use our website</li>
                <li>Improve our services and user experience</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Provide personalized content and advertisements</li>
                <li>Ensure website security and prevent fraud</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                3. Types of Cookies We Use
              </h2>
              
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                3.1 Essential Cookies
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4">
                These cookies are necessary for the website to function
                properly. They enable core functionality such as security, network
                management, and accessibility. You cannot opt-out of these
                cookies.
              </p>

              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                3.2 Performance Cookies
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4">
                These cookies help us understand how visitors interact with our
                website by collecting and reporting information anonymously. They
                help us improve the way our website works.
              </p>

              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                3.3 Functionality Cookies
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4">
                These cookies allow the website to remember choices you make
                (such as your username, language, or region) and provide
                enhanced, personalized features.
              </p>

              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                3.4 Targeting/Advertising Cookies
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4">
                These cookies may be set through our site by our advertising
                partners. They may be used to build a profile of your interests
                and show you relevant advertisements on other sites.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                4. Third-Party Cookies
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                In addition to our own cookies, we may also use various
                third-party cookies to report usage statistics of the service,
                deliver advertisements, and so on. These third parties may
                include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm md:text-base text-gray-700">
                <li>Analytics providers (e.g., Google Analytics)</li>
                <li>Advertising networks</li>
                <li>Social media platforms</li>
                <li>Payment processors</li>
                <li>Other service providers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                5. Managing Cookies
              </h2>
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                5.1 Browser Settings
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                Most web browsers allow you to control cookies through their
                settings preferences. You can:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm md:text-base text-gray-700">
                <li>Block all cookies</li>
                <li>Block third-party cookies</li>
                <li>Delete cookies when you close your browser</li>
                <li>Delete existing cookies</li>
                <li>Be notified before cookies are placed</li>
              </ul>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4">
                However, please note that blocking or deleting cookies may
                impact your experience on our website, as some features may not
                function properly.
              </p>

              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                5.2 Cookie Consent
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                When you first visit our website, you may be presented with a
                cookie consent banner. You can choose to accept or reject
                non-essential cookies. Your preferences will be saved and
                remembered for future visits.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                6. Specific Cookies We Use
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm md:text-base border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Cookie Name
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Purpose
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">
                        session_id
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Maintains your session and keeps you logged in
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Session
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">
                        preferences
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Stores your website preferences
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        1 year
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">
                        analytics
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Tracks website usage and analytics
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        2 years
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                7. Do Not Track Signals
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                Some browsers incorporate a "Do Not Track" (DNT) feature that
                signals to websites you visit that you do not want to have your
                online activity tracked. Currently, there is no standard for how
                DNT signals should be interpreted. As a result, we do not
                currently respond to DNT browser signals or mechanisms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                8. Updates to This Cookie Policy
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                We may update this Cookie Policy from time to time to reflect
                changes in our practices or for other operational, legal, or
                regulatory reasons. We will notify you of any material changes
                by posting the new Cookie Policy on this page and updating the
                "Last Updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                9. Contact Us
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                If you have any questions about our use of cookies or this
                Cookie Policy, please contact us:
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
                  K.P.H.B.Colony, Kukatpally, Hyderabad-500072. Telangana State,
                  INDIA
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;

