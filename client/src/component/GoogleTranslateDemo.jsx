"use client";

import GoogleTranslate from "./GoogleTranslate";

const GoogleTranslateDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Google Translate Integration
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Beautiful, responsive, and accessible translation widget for your
            Next.js application
          </p>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Fixed Position Demo */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
              Fixed Position Widget
            </h3>
            <p className="text-gray-600 mb-6">
              The main translate widget appears in the top-right corner of every
              page. It's already integrated into your layout and will be visible
              site-wide.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
              <p className="text-sm text-gray-500 text-center">
                Widget appears in top-right corner →
              </p>
            </div>
          </div>

          {/* Navbar Integration Demo */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
              Navbar Integration
            </h3>
            <p className="text-gray-600 mb-6">
              Compact translate widget integrated into your navigation bar.
              Available on both desktop and mobile versions.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
              <p className="text-sm text-gray-500 text-center">
                Integrated in navbar components
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            ✨ Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                40+ Languages
              </h3>
              <p className="text-gray-600">
                Support for major world languages including Hindi, French,
                Spanish, and more
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Responsive Design
              </h3>
              <p className="text-gray-600">
                Perfect on all devices - desktop, tablet, and mobile
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl">
              <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-600">
                Client-side only, no SSR issues, instant translation
              </p>
            </div>
          </div>
        </div>

        {/* Customization Examples */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            🎨 Customization Examples
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Positioning Options
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <code className="text-sm text-blue-600 font-mono">
                    &lt;GoogleTranslate position="fixed" top="20px" right="20px"
                    /&gt;
                  </code>
                  <p className="text-sm text-gray-600 mt-2">
                    Fixed position in top-right corner
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <code className="text-sm text-blue-600 font-mono">
                    &lt;GoogleTranslate position="absolute" bottom="20px"
                    left="20px" /&gt;
                  </code>
                  <p className="text-sm text-gray-600 mt-2">
                    Absolute position in bottom-left
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <code className="text-sm text-blue-600 font-mono">
                    &lt;GoogleTranslate position="static" /&gt;
                  </code>
                  <p className="text-sm text-gray-600 mt-2">
                    Inline positioning in content flow
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Styling Options
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <code className="text-sm text-blue-600 font-mono">
                    &lt;GoogleTranslate style={{ backgroundColor: "#f0f0f0" }}{" "}
                    /&gt;
                  </code>
                  <p className="text-sm text-gray-600 mt-2">
                    Custom background color
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <code className="text-sm text-blue-600 font-mono">
                    &lt;GoogleTranslate className="my-custom-class" /&gt;
                  </code>
                  <p className="text-sm text-gray-600 mt-2">
                    Custom CSS classes
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <code className="text-sm text-blue-600 font-mono">
                    &lt;GoogleTranslate style={{ borderRadius: "20px" }} /&gt;
                  </code>
                  <p className="text-sm text-gray-600 mt-2">
                    Custom border radius
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-6 text-center">
            🚀 Ready to Use!
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-xl mb-6 text-center text-blue-50">
              The Google Translate integration is already active on your site!
              Users can now translate your entire website into their preferred
              language.
            </p>
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4">
                What's Already Working:
              </h3>
              <ul className="space-y-2 text-blue-50">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Fixed translate widget in top-right corner
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Navbar integration on desktop and mobile
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Support for 40+ world languages
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Beautiful, modern UI with animations
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Fully responsive design
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleTranslateDemo;
