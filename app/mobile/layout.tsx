import type { Metadata } from "next";
import BottomNav from "@/components/mobile/BottomNav";
import { getCurrentCustomer } from "@/lib/dashboardAuth";

export const metadata: Metadata = {
  title: "RENT-EX Mobile",
  description: "Premium Fahrzeugvermietung in Vorarlberg",
  themeColor: "#0A0A0A",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default async function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await getCurrentCustomer();
  const isLoggedIn = !!customer;

  return (
    <div className="bg-gray-100 dark:bg-black min-h-screen font-sans selection:bg-[#E53935]/30 transition-colors">
      {/* Mobile App Container constraint for desktop viewing */}
      <div className="max-w-md mx-auto bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white min-h-screen relative shadow-2xl border-x border-gray-250 dark:border-white/5 pb-16 transition-colors animate-in fade-in duration-200">
        {children}
        <BottomNav isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
