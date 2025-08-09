import Navbar from "@/component/HomeComponent/Navbar";
import Herosection from "@/component/HomeComponent/Herosection";
import AboutSection from "@/component/HomeComponent/AboutSection";
import CountriesSection from "@/component/HomeComponent/CountriesSection";
import FeaturedCategories from "@/component/HomeComponent/FeaturedCategories";
import NewsSection from "@/component/HomeComponent/NewsSection";
import TestimonialSection from "@/component/HomeComponent/TestimonialSection";
import Stats from "@/component/HomeComponent/Stats";
import FAQSection from "@/component/HomeComponent/FAQSection";
import Footer from "@/component/HomeComponent/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Herosection />
      <AboutSection />
      <CountriesSection />
      <FeaturedCategories />
      <NewsSection />
      <TestimonialSection />
      <Stats />
      <FAQSection />
      <Footer />
    </div>
  );
}
