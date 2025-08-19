import mongoose from "mongoose";

const HomeDataSchema = new mongoose.Schema(
  {
    countryCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    heroSection: {
      bannerText: { type: String },
      bannerCTA: { type: String },
      mainHeading: { type: String },
      subHeading: { type: String },
      thirdHeading: { type: String },
      description: { type: String },
      youtubeVideoId: { type: String },
      mobileVideoId: { type: String },
      ctaButtonText: { type: String },
      ctaButtonLink: { type: String },
    },
    aboutSection: {
      title: { type: String },
      subtitle: { type: String },
      description: { type: String },
      features: [
        {
          title: { type: String },
          description: { type: String },
          icon: { type: String },
        },
      ],
    },
    featuredCategories: {
      title: { type: String },
      categories: [
        {
          id: { type: Number, required: true },
          name: { type: String, required: true },
          image: { type: String, required: true },
          description: { type: String, required: true },
        },
      ],
    },
    newsSection: {
      title: { type: String },
      subtitle: { type: String },
      news: [
        {
          id: { type: Number, required: true },
          title: { type: String, required: true },
          excerpt: { type: String, required: true },
          image: { type: String, required: true },
          date: { type: String, required: true },
          category: { type: String, required: true },
        },
      ],
    },
    testimonialSection: {
      title: { type: String },
      subtitle: { type: String },
      testimonials: [
        {
          id: { type: Number, required: true },
          name: { type: String, required: true },
          company: { type: String, required: true },
          role: { type: String, required: true },
          content: { type: String, required: true },
          image: { type: String, required: true },
          rating: { type: Number, required: true, min: 1, max: 5 },
        },
      ],
    },
    stats: {
      title: { type: String },
      subtitle: { type: String },
      stats: [
        {
          id: { type: Number, required: true },
          number: { type: Number, required: true },
          label: { type: String, required: true },
          suffix: { type: String },
        },
      ],
    },
    faqSection: {
      title: { type: String },
      subtitle: { type: String },
      faqs: [
        {
          id: { type: Number, required: true },
          question: { type: String, required: true },
          answer: { type: String, required: true },
        },
      ],
    },
    subscriptionPlans: {
      title: { type: String, default: "Choose Your Plan" },
      subtitle: {
        type: String,
        default: "Select the perfect plan for your business needs",
      },
      currency: { type: String, default: "USD" },
      yearlyDiscount: { type: Number, default: 17, min: 0, max: 100 },
      plans: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          price: {
            monthly: { type: Number, required: true },
            yearly: { type: Number, required: true },
          },
          description: { type: String, required: true },
          features: [{ type: String }],
          icon: { type: String, default: "🌟" },
          popular: { type: Boolean, default: false },
          color: { type: String, default: "blue" },
        },
      ],
      faqSection: {
        title: { type: String, default: "Frequently Asked Questions" },
        faqs: [
          {
            id: { type: Number, required: true },
            question: { type: String, required: true },
            answer: { type: String, required: true },
          },
        ],
      },
      ctaSection: {
        title: { type: String, default: "Ready to Get Started?" },
        subtitle: {
          type: String,
          default: "Join thousands of businesses already using HSCODE",
        },
        primaryButtonText: { type: String, default: "Start Free Trial" },
        primaryButtonLink: { type: String, default: "/auth" },
        secondaryButtonText: { type: String, default: "Contact Sales" },
        secondaryButtonLink: { type: String, default: "/contact" },
      },
    },
    footer: {
      companyDescription: { type: String },
      contactInfo: {
        email: { type: String },
        phone: { type: String },
        address: { type: String },
      },
      socialLinks: {
        facebook: { type: String },
        twitter: { type: String },
        linkedin: { type: String },
        instagram: { type: String },
      },
    },
  },
  { timestamps: true }
);

const HomeDataModel = mongoose.model("HomeData", HomeDataSchema);
export default HomeDataModel;
