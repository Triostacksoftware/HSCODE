import HomeData from "../models/HomeData.js";

// Get home data by country code (public endpoint)
export const getHomeDataByCountry = async (req, res) => {
  try {
    const { countryCode } = req.params;

    if (!countryCode) {
      return res.status(400).json({ message: "Country code is required" });
    }

    // First try to get home data for the requested country
    let homeData = await HomeData.findOne({
      countryCode: countryCode.toUpperCase(),
    });

    // If no data found for the requested country, fallback to India (IN)
    if (!homeData) {
      console.log(
        `No home data found for country: ${countryCode}, falling back to India (IN)`
      );

      // Try to get India's home data as fallback
      const indiaHomeData = await HomeData.findOne({ countryCode: "IN" });

      if (indiaHomeData) {
        console.log(
          `Using India home data as fallback for country: ${countryCode}`
        );
        return res.status(200).json({
          success: true,
          data: indiaHomeData,
          fallback: true,
          originalCountry: countryCode,
          fallbackCountry: "IN",
        });
      } else {
        // If even India doesn't have data, return 404
        return res.status(404).json({
          message:
            "Home data not found for this country and no fallback available",
          requestedCountry: countryCode,
          fallbackAttempted: "IN",
        });
      }
    }

    res.status(200).json({ success: true, data: homeData });
  } catch (error) {
    console.error("Error fetching home data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get home data for admin's country
export const getAdminHomeData = async (req, res) => {
  try {
    const Countrycode = req.user.countryCode;

    let homeData = await HomeData.findOne({ countryCode: Countrycode });

    if (!homeData) {
      // Return empty data structure instead of creating defaults
      return res.status(200).json({
        success: true,
        data: {
          countryCode: Countrycode,
          adminId: req.user.id,
          heroSection: {},
          aboutSection: { features: [] },
          featuredCategories: { categories: [] },
          newsSection: { news: [] },
          testimonialSection: { testimonials: [] },
          stats: { stats: [] },
          faqSection: { faqs: [] },
          footer: { contactInfo: {}, socialLinks: {} },
        },
      });
    }

    res.status(200).json({ success: true, data: homeData });
  } catch (error) {
    console.error("Error fetching admin home data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create or update home data
export const upsertHomeData = async (req, res) => {
  try {
    const Countrycode = req.user.countryCode;
    const updateData = req.body;

    // Find existing home data or create new one
    let homeData = await HomeData.findOne({ countryCode: Countrycode });

    if (homeData) {
      // Update existing data
      const updatedData = await HomeData.findOneAndUpdate(
        { countryCode: Countrycode },
        { ...updateData, adminId: req.user.id },
        { new: true, runValidators: true }
      );
      res.status(200).json({
        success: true,
        data: updatedData,
        message: "Home data updated successfully",
      });
    } else {
      // Create new data
      const newHomeData = new HomeData({
        ...updateData,
        countryCode: Countrycode,
        adminId: req.user.id,
      });
      const savedData = await newHomeData.save();
      res.status(201).json({
        success: true,
        data: savedData,
        message: "Home data created successfully",
      });
    }
  } catch (error) {
    console.error("Error upserting home data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete home data
export const deleteHomeData = async (req, res) => {
  try {
    const Countrycode = req.user.countryCode;

    const deletedData = await HomeData.findOneAndDelete({
      countryCode: Countrycode,
    });

    if (!deletedData) {
      return res.status(404).json({ message: "Home data not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Home data deleted successfully" });
  } catch (error) {
    console.error("Error deleting home data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reset home data to defaults
export const saveDummyData = async (req, res) => {
  try {
    const Countrycode = req.user.countryCode;

    // Check if data already exists
    let existingData = await HomeData.findOne({ countryCode: Countrycode });

    if (existingData) {
      return res.status(400).json({
        success: false,
        message:
          "Home data already exists for this country. Delete it first to save dummy data.",
      });
    }

    // Create dummy data with all the default values
    const dummyData = new HomeData({
      countryCode: Countrycode,
      adminId: req.user.id,
      heroSection: {
        bannerText:
          "Join the ultimate B2B marketplace where buyers and sellers connect for high-value leads",
        bannerCTA: "Join Now >",
        mainHeading: "Connect Buyers & Sellers",
        subHeading: "in the Ultimate B2B",
        thirdHeading: "Marketplace Platform",
        description:
          "Connect with verified buyers and sellers in our exclusive groups. Post leads, find opportunities, and grow your business in the most trusted B2B marketplace platform.",
        youtubeVideoId: "YHadvEgNruU",
        mobileVideoId: "39HqTUNw8MU",
        ctaButtonText: "Start Trading",
        ctaButtonLink: "/auth",
      },
      aboutSection: {
        title: "About HSCODE",
        subtitle: "Empowering Global Trade",
        description:
          "HSCODE is a revolutionary B2B marketplace platform that connects buyers and sellers worldwide. Our platform facilitates high-value lead generation and business opportunities across diverse industries.",
        features: [
          {
            title: "Global Reach",
            description: "Connect with businesses from around the world",
            icon: "🌍",
          },
          {
            title: "Verified Partners",
            description:
              "All businesses are thoroughly verified for your safety",
            icon: "✅",
          },
          {
            title: "High-Value Leads",
            description: "Access premium business opportunities and leads",
            icon: "💎",
          },
        ],
      },
      featuredCategories: {
        title: "FEATURED CATEGORIES",
        categories: [
          {
            id: 1,
            name: "Electronics",
            image: "/electronics.jpg",
            description: "Latest electronic devices and components",
          },
          {
            id: 2,
            name: "Textiles",
            image: "/textiles.jpg",
            description: "Premium fabrics and clothing materials",
          },
          {
            id: 3,
            name: "Machinery",
            image: "/machinery.jpg",
            description: "Industrial machinery and equipment",
          },
        ],
      },
      newsSection: {
        title: "LATEST NEWS & UPDATES",
        subtitle: "Stay informed with the latest industry insights",
        news: [
          {
            id: 1,
            title: "New Features Launched",
            excerpt: "Discover our latest platform enhancements",
            image: "/news1.jpg",
            date: "2024-01-15",
            category: "Platform Updates",
          },
          {
            id: 2,
            title: "Success Stories",
            excerpt: "Learn from our top-performing businesses",
            image: "/news2.jpg",
            date: "2024-01-10",
            category: "Business Insights",
          },
        ],
      },
      testimonialSection: {
        title: "WHAT OUR USERS SAY",
        subtitle: "Success stories from our community",
        testimonials: [
          {
            id: 1,
            name: "John Smith",
            company: "TechCorp Inc",
            role: "CEO",
            content:
              "HSCODE has transformed our business. We've connected with amazing partners worldwide.",
            image: "/testimonial1.jpg",
            rating: 5,
          },
          {
            id: 2,
            name: "Sarah Johnson",
            company: "Global Traders",
            role: "Founder",
            content:
              "The platform is incredibly user-friendly and the leads are high-quality.",
            image: "/testimonial2.jpg",
            rating: 5,
          },
        ],
      },
      stats: {
        title: "OUR IMPACT IN NUMBERS",
        subtitle: "Growing together with our community",
        stats: [
          {
            id: 1,
            number: 10000,
            label: "Active Users",
            suffix: "+",
          },
          {
            id: 2,
            number: 50000,
            label: "Successful Deals",
            suffix: "+",
          },
          {
            id: 3,
            number: 150,
            label: "Countries",
            suffix: "+",
          },
        ],
      },
      faqSection: {
        title: "FREQUENTLY ASKED QUESTIONS",
        subtitle: "Everything you need to know about HSCODE",
        faqs: [
          {
            id: 1,
            question: "How do I get started on HSCODE?",
            answer:
              "Simply sign up, complete your profile, and start connecting with businesses worldwide.",
          },
          {
            id: 2,
            question: "Is HSCODE free to use?",
            answer:
              "We offer both free and premium plans to suit different business needs.",
          },
          {
            id: 3,
            question: "How do you verify businesses?",
            answer:
              "We have a comprehensive verification process including document checks and business validation.",
          },
        ],
      },
      footer: {
        companyDescription:
          "HSCODE is your trusted partner in global B2B trade, connecting businesses worldwide for mutual growth and success.",
        contactInfo: {
          email: "info@hscode.com",
          phone: "+1 (555) 123-4567",
          address: "123 Business Street, Trade City, TC 12345",
        },
        socialLinks: {
          facebook: "#",
          twitter: "#",
          linkedin: "#",
          instagram: "#",
        },
      },
    });

    const savedData = await dummyData.save();

    res.status(201).json({
      success: true,
      data: savedData,
      message: "Dummy data saved successfully",
    });
  } catch (error) {
    console.error("Error saving dummy data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
