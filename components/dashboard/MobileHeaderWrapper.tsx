"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Suspense } from "react";

function MobileHeaderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobile = searchParams?.get("mobile") === "true";
  const backPath = searchParams?.get("back") || "/mobile/account";

  if (!isMobile) return null;

  return (
    <div className="lg:hidden flex items-center px-4 py-3 bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-white/5 sticky top-0 z-50 text-gray-900 dark:text-white transition-colors">
      <button 
        type="button"
        onClick={() => router.push(backPath)}
        className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-lg text-gray-900 dark:text-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="ml-3 text-sm font-bold">Zurück</span>
    </div>
  );
}

export default function MobileHeaderWrapper() {
  return (
    <Suspense fallback={null}>
      <MobileHeaderContent />
    </Suspense>
  );
}
