"use client";
import React, { useState } from "react";
import { HiPlus, HiMinus } from "react-icons/hi";

const FAQSection = ({
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know about our B2B marketplace platform",
  faqs = [
    {
      id: 1,
      question: "How do I verify my business on the platform?",
      answer:
        "Business verification involves submitting your company registration documents, tax certificates, and trade licenses. Our verification team reviews submissions within 2-3 business days. Verified businesses receive a blue checkmark and access to premium features.",
    },
    {
      id: 2,
      question: "What are the fees for using the platform?",
      answer:
        "We offer flexible pricing plans including a free tier for basic access, professional plans starting at $99/month for enhanced features, and enterprise solutions with custom pricing. Transaction fees apply only on successful deals completed through our platform.",
    },
    {
      id: 3,
      question: "How secure are the transactions on your platform?",
      answer:
        "All transactions are protected by bank-level encryption and our secure escrow service. We use SSL certificates, two-factor authentication, and compliance with international trade regulations to ensure maximum security for all business dealings.",
    },
    {
      id: 4,
      question: "Can I connect with suppliers from specific countries?",
      answer:
        "Yes, our platform supports global trade with suppliers and buyers from over 45 countries. You can filter searches by location, use our country-specific groups, and access local market insights to find the right business partners.",
    },
    {
      id: 5,
      question: "What types of products can I trade?",
      answer:
        "Our marketplace supports over 500 product categories including manufacturing goods, raw materials, technology products, consumer goods, and industrial equipment. We do not allow prohibited items such as weapons, illegal substances, or counterfeit products.",
    },
    {
      id: 6,
      question: "How does the lead generation system work?",
      answer:
        "Our AI-powered system matches your business profile with relevant opportunities. You can post your requirements, browse active leads, and receive notifications for matching opportunities. Premium members get priority access and advanced filtering options.",
    },
    {
      id: 7,
      question: "Is there customer support available?",
      answer:
        "We provide 24/7 customer support through multiple channels including live chat, email, and phone. Our support team includes trade specialists who can assist with technical issues, business inquiries, and dispute resolution.",
    },
    {
      id: 8,
      question: "How do I join industry-specific groups?",
      answer:
        "After completing your business verification, you can browse and join relevant industry groups. These groups facilitate networking, knowledge sharing, and exclusive trading opportunities within your sector.",
    },
    {
      id: 9,
      question: "What documents do I need for international trade?",
      answer:
        "Required documents vary by country and product type but typically include commercial invoices, packing lists, certificates of origin, and relevant permits. Our platform provides document templates and guidance for smooth international transactions.",
    },
    {
      id: 10,
      question: "How do I track my orders and shipments?",
      answer:
        "Our integrated tracking system provides real-time updates on order status, payment processing, and shipment tracking. You'll receive notifications at each milestone and can communicate directly with your trading partners through our secure messaging system.",
    },
    {
      id: 11,
      question: "Can I negotiate prices directly with suppliers?",
      answer:
        "Absolutely. Our platform includes built-in negotiation tools, secure messaging for price discussions, and the ability to request custom quotes. All negotiations are recorded for transparency and future reference.",
    },
    {
      id: 12,
      question: "What happens if there's a dispute?",
      answer:
        "We offer comprehensive dispute resolution services including mediation, arbitration, and escrow protection. Our trade specialists work with both parties to find fair solutions, and we provide legal support when necessary.",
    },
    {
      id: 13,
      question: "How do I increase my visibility on the platform?",
      answer:
        "Premium memberships, complete business profiles, customer reviews, transaction history, and active participation in groups all boost your visibility. We also offer promotional tools and featured listing options.",
    },
    {
      id: 14,
      question: "Are there minimum order requirements?",
      answer:
        "Minimum orders vary by supplier and product category. Our platform allows both bulk wholesale orders and smaller quantities for testing purposes. You can filter searches based on your preferred order quantities.",
    },
    {
      id: 15,
      question: "How do I request samples before placing large orders?",
      answer:
        "Most suppliers offer sample orders at reduced costs. You can request samples directly through the platform, negotiate sample pricing, and even arrange for quality inspections before committing to larger purchases.",
    },
    {
      id: 16,
      question: "What payment methods are accepted?",
      answer:
        "We support multiple payment methods including bank transfers, letters of credit, trade finance, and digital payments. All transactions go through our secure payment gateway with fraud protection and compliance monitoring.",
    },
    {
      id: 17,
      question: "How do I access market insights and analytics?",
      answer:
        "Premium members have access to comprehensive market analytics including price trends, demand forecasting, competitor analysis, and industry reports. These insights help inform your trading decisions and strategy.",
    },
    {
      id: 18,
      question: "Can I integrate the platform with my existing systems?",
      answer:
        "Yes, we offer API integrations for ERP systems, inventory management, and accounting software. Our technical team provides support for custom integrations and data synchronization.",
    },
    {
      id: 19,
      question: "What are the benefits of premium membership?",
      answer:
        "Premium members enjoy priority support, advanced search filters, unlimited messaging, detailed analytics, promotional tools, early access to new features, and reduced transaction fees.",
    },
    {
      id: 20,
      question: "How do I get started on the platform?",
      answer:
        "Simply create an account, complete your business profile, submit verification documents, and start exploring opportunities. Our onboarding team provides guided setup assistance and training for new users.",
    },
  ],
}) => {
  const [openItems, setOpenItems] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const toggleItem = (id) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 py-12 md:py-16 montserrat">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 mb-4 tracking-wide">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light">
              {subtitle}
            </p>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 font-light tracking-wide"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-1">
          {filteredFaqs.map((faq, index) => (
            <div
              key={faq.id}
              className="border border-gray-200 bg-white transition-all duration-300 hover:shadow-md"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-400 group"
              >
                <h3 className="text-base md:text-lg font-medium text-gray-900 leading-relaxed tracking-wide group-hover:text-gray-700 transition-colors duration-200">
                  {faq.question}
                </h3>
                <div className="ml-4 flex-shrink-0">
                  {openItems.has(faq.id) ? (
                    <HiMinus className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" />
                  ) : (
                    <HiPlus className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" />
                  )}
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openItems.has(faq.id)
                    ? "max-h-64 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed font-light text-sm md:text-base">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredFaqs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-base font-light">
              No questions found matching "{searchTerm}". Try a different search
              term.
            </p>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <div className="border border-gray-300 bg-white p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-light text-gray-900 mb-4 tracking-wide">
              Still Have Questions?
            </h3>
            <p className="text-gray-600 text-base leading-relaxed mb-6 font-light max-w-2xl mx-auto">
              Our expert team is available 24/7 to help you with any questions
              about our B2B marketplace platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-medium rounded-sm transition-all duration-300 hover:bg-gray-800 hover:scale-105 tracking-wide uppercase text-sm"
              >
                Contact Support
              </a>
              <a
                href="/userchat"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-400 text-gray-900 font-medium rounded-sm hover:border-gray-600 hover:bg-gray-50 transition-all duration-300 tracking-wide uppercase text-sm"
              >
                Live Chat
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
