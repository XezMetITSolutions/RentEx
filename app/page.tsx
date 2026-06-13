import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import CarFleetPreview from "@/components/home/CarFleetPreview";
import HomeTrustAndSteps from "@/components/home/HomeTrustAndSteps";
import Footer from "@/components/home/Footer";
import { getGoogleReviews } from "@/app/actions";

export default async function Home() {
  const reviewsData = await getGoogleReviews();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white relative selection:bg-red-500/30">
      <Navbar />

      <main>
        <Hero />
        <Features />
        <CarFleetPreview />
        <HomeTrustAndSteps reviewsData={reviewsData} />
      </main>

      <Footer />
    </div>
  );
}
