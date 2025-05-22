import Header from '@/components/HomePage/Header';
import HeroSection from '@/components/HomePage/HeroSection';
import FeaturesSection from '@/components/HomePage/FeaturesSection';
import Footer from '@/components/HomePage/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header/>
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
}