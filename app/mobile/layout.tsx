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
    <div className="bg-black min-h-screen font-sans selection:bg-[#E53935]/30">
      {/* Mobile App Container constraint for desktop viewing */}
      <div className="max-w-md mx-auto bg-[#0A0A0A] min-h-screen relative shadow-2xl border-x border-white/5 pb-16">
        {children}
        <BottomNav isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
