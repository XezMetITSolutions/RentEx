import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import CarFleetPreview from "@/components/home/CarFleetPreview";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white relative selection:bg-red-500/30">
      <Navbar />

      <main>
        <Hero />
        <Features />
        <CarFleetPreview />
      </main>

      <Footer />
    </div>
  );
}
