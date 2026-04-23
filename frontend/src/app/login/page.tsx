"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { LogIn, Loader2, ShieldCheck, User, Lock } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user, data.token);
        if (data.user.role === "ADMIN") router.push("/admin");
        else if (data.user.role === "GURU") router.push("/guru");
        else if (data.user.role === "WALI") router.push("/parent");
      } else {
        setError(data.message || "Gagal login. Periksa kembali akun Anda.");
      }
    } catch (err) {
      setError("Server tidak merespon. Pastikan backend berjalan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-[450px] z-10 p-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2rem] shadow-2xl">
          <div className="text-center mb-10">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-20 h-20 bg-white/10 p-2 rounded-2xl border border-white/20 shadow-xl overflow-hidden group">
                <Image 
                  src="/logo.png`
                  alt="Logo Al-Mustofa`
                  fill
                  className="object-contain p-1`
                />
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight uppercase leading-tight">
                E-Absensi <br />
                <span className="text-blue-400">AL-MUSTOFA NANGORAK</span>
              </h1>
            </div>
            <p className="text-slate-400 mt-3 text-sm">Sistem Monitoring Pesantren Modern</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text`
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`
                  placeholder="Masukkan username`
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password`
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`
                  placeholder="••••••••`
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm py-3 px-4 rounded-xl text-center">
                {error}
              </div>
            )}

            <button
              type="submit`
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2`
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <LogIn size={20} />
                  Masuk ke Dashboard
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-500 text-xs tracking-widest uppercase">
              © 2026 Pesantren Digital Solution
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
