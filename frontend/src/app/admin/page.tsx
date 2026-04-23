"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Users, GraduationCap, School, ClipboardList, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalSantri: 0,
    totalGuru: 0,
    totalKelas: 0,
    hadirToday: 0,
    weeklyData: [] as { day: string, count: number }[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setStats(data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStats();
  }, [token]);

  const statCards = [
    { name: "Total Santri", value: stats.totalSantri, icon: GraduationCap, color: "bg-blue-500" },
    { name: "Total Guru", value: stats.totalGuru, icon: Users, color: "bg-green-500" },
    { name: "Total Kelas", value: stats.totalKelas, icon: School, color: "bg-purple-500" },
    { name: "Hadir Hari Ini", value: stats.hadirToday, icon: ClipboardList, color: "bg-orange-500" },
  ];

  const chartData = {
    labels: stats.weeklyData.map(d => d.day),
    datasets: [
      {
        label: 'Jumlah Kehadiran',
        data: stats.weeklyData.map(d => d.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        }
      }
    }
  };

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
              <div key={stat.name} className="card flex items-center gap-4 hover:shadow-xl transition-shadow">
                <div className={`${stat.color} p-4 rounded-xl text-white`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                  <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-lg font-bold mb-4 text-slate-800">Grafik Kehadiran Mingguan</h3>
              <div className="h-64 flex items-center justify-center">
                {stats.weeklyData.length > 0 ? (
                  <Bar data={chartData} options={chartOptions} />
                ) : (
                  <div className="h-full w-full bg-slate-50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-200">
                    <p className="text-slate-400">Statistik akan muncul setelah data absensi terkumpul</p>
                  </div>
                )}
              </div>
            </div>
            <div className="card">
              <h3 className="text-lg font-bold mb-4 text-slate-800">Aktivitas Terbaru</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-sm">Database Sinkron</p>
                      <p className="text-xs text-slate-500">Sistem absensi berjalan normal</p>
                    </div>
                  </div>
                  <span className="text-blue-600 font-bold text-xs">ONLINE</span>
                </div>
                
                <div className="p-4 border border-slate-100 rounded-xl">
                  <p className="text-sm text-slate-600 italic">Selamat datang di panel Admin E-Absensi Pesantren Digital.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
