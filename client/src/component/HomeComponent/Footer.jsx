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
  contactInfo = [
    {
      icon: HiOutlineLocationMarker,
      text: "New York, NY 10001, United States",
      href: null,
    },
    {
      icon: HiOutlineMail,
      text: "support@hscode.com",
      href: "mailto:support@hscode.com",
    },
    {
      icon: HiOutlinePhone,
      text: "+1 (555) 123-4567",
      href: "tel:+15551234567",
    },
    {
      icon: HiOutlineGlobe,
      text: "www.hscode.com",
      href: "https://hscode.com",
    },
  ],
}) => {
  return (
    <footer className="bg-slate-800 text-white py-16 montserrat">
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
              {contactInfo.map((contact, index) => {
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
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([sectionTitle, links]) => (
              <div key={sectionTitle}>
                <h4 className="text-base font-medium text-gray-300 mb-4 tracking-wide">
                  {sectionTitle}
                </h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className={`text-sm font-light leading-relaxed transition-colors duration-200 hover:text-white ${
                          link.isHighlighted
                            ? "text-red-400 hover:text-red-300"
                            : "text-gray-400"
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
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 font-light mb-4 md:mb-0">
              © {new Date().getFullYear()} {companyName}. All rights reserved.
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-gray-400">
              <a
                href="/privacy"
                className="hover:text-white transition-colors duration-200 font-light"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="hover:text-white transition-colors duration-200 font-light"
              >
                Terms of Service
              </a>
              <a
                href="/cookies"
                className="hover:text-white transition-colors duration-200 font-light"
              >
                Cookie Policy
              </a>
              <a
                href="/sitemap"
                className="hover:text-white transition-colors duration-200 font-light"
              >
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
