"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { ClipboardCheck, Clock, Users, Loader2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export default function GuruDashboard() {
  const { token } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/guru/my-classes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setClasses(data);
      } catch (err) {
        console.error("Error fetching classes:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchClasses();
  }, [token]);

  const totalSantri = classes.reduce((acc, curr) => acc + curr._count.santri, 0);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-blue-600 text-white shadow-blue-600/30">
          <div className="flex justify-between items-start mb-4">
            <ClipboardCheck size={32} className="opacity-50" />
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">LIVE</span>
          </div>
          <h3 className="text-xl font-bold">Input Absensi</h3>
          <p className="text-blue-100 text-sm mt-2">Segera catat kehadiran santri untuk hari ini.</p>
          <Link href="/guru/absensi" className="mt-6 flex items-center justify-center gap-2 w-full bg-white text-blue-600 text-center font-bold py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg">
            Mulai Sekarang
            <ChevronRight size={18} />
          </Link>
        </div>

        <div className="card flex flex-col justify-center border-l-4 border-green-500">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 text-green-600 p-4 rounded-2xl">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Santri Ampuan</p>
              <h3 className="text-3xl font-extrabold text-slate-800">{totalSantri}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">Kelas Anda</h3>
          <span className="text-sm text-slate-500">{classes.length} Kelas Terdaftar</span>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((kelas) => (
              <div key={kelas.id} className="card group hover:border-primary/50 transition-all cursor-pointer bg-white border border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors">{kelas.name}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <Users size={14} className="text-slate-400" />
                      <p className="text-sm text-slate-500">{kelas._count.santri} Santri</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                   <Link href="/guru/absensi" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">
                     Input Absensi
                   </Link>
                   <span className="text-[10px] text-slate-300 font-bold uppercase">TA 2025/2026</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
