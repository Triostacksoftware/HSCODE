"use client";
import React from "react";
import {
  HiOutlineGlobe,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
} from "react-icons/hi";

const Footer = ({
  companyName = "HSCODE",
  companyDescription = "Global Trade Plaza is an ISO 9001:2015 certified online B2B marketplace. We provide various opportunities for businesses including manufacturers, exporters, and wholesalers to connect with other businesses and companies across the globe. We are the much-needed bridge between B2B sellers and buyers. We have clients from different industries such as textile and apparel, consumer electronics, medical supplies, agriculture and food, home supplies, heavy machinery, industrial tools, etc.",
  contactInfo = {
    email: "support@hscode.com",
    phone: "+1 (555) 123-4567",
    address: "New York, NY 10001, United States",
  },
  socialLinks = {
    facebook: "#",
    twitter: "#",
    linkedin: "#",
    instagram: "#",
  },
  footerLinks = {
    "Customer support": [
      { name: "Contact us", href: "/contact" },
      { name: "Privacy policy", href: "/privacy" },
      { name: "Advertise with us", href: "/advertise" },
      { name: "Tradeshows", href: "/tradeshows" },
      { name: "Blogs", href: "/blogs" },
      { name: "News & events", href: "/news", isHighlighted: true },
    ],
    "About Us": [
      { name: "About GlobalTradePlaza", href: "/about" },
      { name: "Success stories", href: "/success-stories" },
      { name: "FAQ", href: "/faq" },
      { name: "Career with us", href: "/careers" },
    ],
    "For buyers": [
      { name: "Exporters directory", href: "/exporters" },
      { name: "All categories", href: "/categories" },
      { name: "Sellers", href: "/sellers" },
      { name: "Feedback", href: "/feedback" },
      { name: "Regions", href: "/regions" },
    ],
    "For sellers": [
      { name: "Buyers", href: "/buyers" },
      { name: "GTP Trade Assurance", href: "/trade-assurance" },
      { name: "Customer Testimonials", href: "/testimonials" },
      { name: "Terms & conditions", href: "/terms" },
      { name: "Complaint", href: "/complaint" },
    ],
    Pricing: [
      { name: "Subscription Plans", href: "/subscription" },
      { name: "Free Trial", href: "/auth" },
      { name: "Enterprise", href: "/contact" },
    ],
  },
}) => {
  const contactInfoArray = [
    {
      icon: HiOutlineLocationMarker,
      text: contactInfo.address,
      href: null,
    },
    {
      icon: HiOutlineMail,
      text: contactInfo.email,
      href: `mailto:${contactInfo.email}`,
    },
    {
      icon: HiOutlinePhone,
      text: contactInfo.phone,
      href: `tel:${contactInfo.phone.replace(/\s+/g, "")}`,
    },
    {
      icon: HiOutlineGlobe,
      text: "www.hscode.com",
      href: "https://hscode.com",
    },
  ];

  return (
    <footer
      id="footer"
      className="text-white py-16 montserrat"
      style={{ backgroundColor: "var(--cobalt-blue)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-6  gap-8 lg:gap-12">
          {/* Company Info Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <img
                src="/logohome.png"
                alt="HS CODES - Linking EXIM World"
                className="h-40 w-auto mb-4"
              />
            </div>

            <p
              className="text-sm leading-relaxed mb-8 font-light"
              style={{ color: "rgba(255, 255, 255, 0.8)" }}
            >
              {companyDescription}
            </p>

            {/* Contact Information */}
            <div className="space-y-4 ">
              {contactInfoArray.map((contact, index) => {
                const IconComponent = contact.icon;
                const content = (
                  <div
                    className="flex items-center space-x-3 transition-colors duration-200"
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                    onMouseEnter={(e) =>
                      (e.target.style.color = "var(--brand-white)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.color = "rgba(255, 255, 255, 0.8)")
                    }
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                      style={{ backgroundColor: "var(--leaf-green)" }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "var(--trade-orange)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "var(--leaf-green)")
                      }
                    >
                      <IconComponent
                        className="w-4 h-4"
                        style={{ color: "var(--brand-white)" }}
                      />
                    </div>
                    <span className="text-sm font-light">{contact.text}</span>
                  </div>
                );

                return contact.href ? (
                  <a key={index} href={contact.href} className="block">
                    {content}
                  </a>
                ) : (
                  <div key={index}>{content}</div>
                );
              })}
            </div>

            {/* Social Media Links */}
            <div className="mt-8 ">
              <div className="flex space-x-4">
                <a
                  href={socialLinks.facebook}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{ backgroundColor: "var(--leaf-green)" }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "var(--trade-orange)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "var(--leaf-green)")
                  }
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href={socialLinks.twitter}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{ backgroundColor: "var(--leaf-green)" }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "var(--trade-orange)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "var(--leaf-green)")
                  }
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href={socialLinks.linkedin}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{ backgroundColor: "var(--leaf-green)" }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "var(--trade-orange)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "var(--leaf-green)")
                  }
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href={socialLinks.instagram}
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className=" lg:col-span-1 ">
              <h3 className="text-lg font-semibold text-white mb-6 tracking-wide">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className={`text-gray-300 hover:text-white transition-colors duration-200 text-sm font-light ${
                        link.isHighlighted
                          ? "text-blue-400 hover:text-blue-300"
                          : ""
                      }`}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* App Store Download Buttons */}
        <div className="mt-8">
          <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">
            Download Our App
          </h4>
          <div className="flex flex-row justify-center   space-x-3">
            {/* Google Play Store Button */}
            <a
              href="#"
              className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)")
              }
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--leaf-green)" }}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-300">GET IT ON</span>
                <span className="text-sm font-semibold text-white">
                  Google Play
                </span>
              </div>
            </a>

            {/* Apple App Store Button */}
            <a
              href="#"
              className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)")
              }
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--leaf-green)" }}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-300">Download on the</span>
                <span className="text-sm font-semibold text-white">
                  App Store
                </span>
              </div>
            </a>
          </div>
        </div>
        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div
              className="text-sm font-light mb-4 md:mb-0"
              style={{ color: "rgba(255, 255, 255, 0.6)" }}
            >
              © 2025 HS CODES. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a
                href="/privacy"
                className="transition-colors duration-200 font-light"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
                onMouseEnter={(e) =>
                  (e.target.style.color = "var(--trade-orange)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.color = "rgba(255, 255, 255, 0.7)")
                }
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="transition-colors duration-200 font-light"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
                onMouseEnter={(e) =>
                  (e.target.style.color = "var(--trade-orange)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.color = "rgba(255, 255, 255, 0.7)")
                }
              >
                Terms of Service
              </a>
              <a
                href="/cookies"
                className="transition-colors duration-200 font-light"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
                onMouseEnter={(e) =>
                  (e.target.style.color = "var(--trade-orange)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.color = "rgba(255, 255, 255, 0.7)")
                }
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
