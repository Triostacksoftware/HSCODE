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
      question: "What payment methods are supported?",
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

  const toggleItem = (id) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <section className="bg-white py-20 md:py-28 relative overflow-hidden montserrat">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-6 tracking-wide">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light">
              {subtitle}
            </p>
          )}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200 rounded-lg"
              >
                <h3 className="text-lg font-medium text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openItems.has(faq.id) ? (
                    <HiMinus className="w-5 h-5 text-blue-600" />
                  ) : (
                    <HiPlus className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {openItems.has(faq.id) && (
                <div className="px-6 pb-4">
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-600 leading-relaxed font-light">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 md:mt-20">
          <div className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-300 cursor-pointer group">
            <span className="text-lg font-medium">Still have questions?</span>
            <svg
              className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
