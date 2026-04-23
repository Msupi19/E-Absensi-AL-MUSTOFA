"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect root to login page
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold mb-4 animate-pulse">E-Absensi Pesantren</h1>
        <p className="text-blue-100">Menyiapkan halaman...</p>
      </div>
    </div>
  );
}
