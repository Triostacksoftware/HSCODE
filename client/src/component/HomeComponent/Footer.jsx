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
    <footer id="footer" className="text-white py-16 montserrat" style={{ backgroundColor: 'var(--cobalt-blue)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Company Info Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-light tracking-wider text-white">
                {companyName}
              </h2>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed mb-8 font-light">
              {companyDescription}
            </p>

            {/* Contact Information */}
            <div className="space-y-4 ">
              {contactInfoArray.map((contact, index) => {
                const IconComponent = contact.icon;
                const content = (
                  <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200">
                    <IconComponent className="w-5 h-5 text-gray-400" />
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
            <div className="mt-8">
              <div className="flex space-x-4">
                <a
                  href={socialLinks.facebook}
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
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
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors duration-200"
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
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200"
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
            <div key={category} className="lg:col-span-1">
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

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm font-light mb-4 md:mb-0">
              © 2024 {companyName}. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a
                href="/privacy"
                className="text-gray-400 hover:text-white transition-colors duration-200 font-light"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors duration-200 font-light"
              >
                Terms of Service
              </a>
              <a
                href="/cookies"
                className="text-gray-400 hover:text-white transition-colors duration-200 font-light"
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
