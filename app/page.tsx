import TopNavBar from "./components/TopNavBar";
import HeroSection from "./components/HeroSection";
import NovedadesSection from "./components/NovedadesSection";
import CapacidadesSection from "./components/CapacidadesSection";
import NewsletterSection from "./components/NewsletterSection";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <>
      <TopNavBar />
      <main>
        <HeroSection />
        <NovedadesSection />
        <CapacidadesSection />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
