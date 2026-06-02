import TopNavBar from "./components/TopNavBar";
import HeroSection from "./components/HeroSection";
import NovedadesSection from "./components/NovedadesSection";
import CapacidadesSection from "./components/CapacidadesSection";
import TestimoniosSection from "./components/TestimoniosSection";
import NewsletterSection from "./components/NewsletterSection";
import Footer from "./components/Footer";
import { getPageContent } from "@/lib/firebase/contenido-service";

export default async function HomePage() {
  const inicioContent = await getPageContent("inicio");

  return (
    <>
      <TopNavBar />
      <main>
        <HeroSection content={inicioContent} />
        <NovedadesSection content={inicioContent} />
        <CapacidadesSection content={inicioContent} />
        <TestimoniosSection content={inicioContent} />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
