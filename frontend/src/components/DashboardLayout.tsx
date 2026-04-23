"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  ClipboardCheck, 
  LogOut, 
  Menu, 
  X, 
  UserCircle,
  School,
  Settings
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const getMenuItems = (): SidebarItem[] => {
    const role = user?.role;
    if (role === "ADMIN") {
      return [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Data Guru", href: "/admin/guru", icon: Users },
        { name: "Data Santri", href: "/admin/santri", icon: GraduationCap },
        { name: "Data Kelas", href: "/admin/kelas", icon: School },
        { name: "Laporan", href: "/admin/report", icon: ClipboardCheck },
        { name: "Pengaturan", href: "/settings", icon: Settings },
      ];
    }
    if (role === "GURU") {
      return [
        { name: "Dashboard", href: "/guru", icon: LayoutDashboard },
        { name: "Absensi", href: "/guru/absensi", icon: ClipboardCheck },
        { name: "Riwayat", href: "/guru/history", icon: GraduationCap },
        { name: "Pengaturan", href: "/settings", icon: Settings },
      ];
    }
    if (role === "WALI") {
      return [
        { name: "Dashboard", href: "/parent", icon: LayoutDashboard },
        { name: "Laporan Anak", href: "/parent/report", icon: ClipboardCheck },
        { name: "Pengaturan", href: "/settings", icon: Settings },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Mobile Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-primary text-white p-2 rounded-lg`
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-primary text-white transform transition-transform duration-300
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-6">
          <div className="flex flex-col items-center mb-10">
            <div className="relative w-16 h-16 mb-4">
              <Image 
                src="/logo.png`
                alt="Logo`
                fill
                className="object-contain`
              />
            </div>
            <h2 className="text-xl font-black text-center leading-tight uppercase tracking-tighter">
              E-Absensi <br />
              <span className="text-blue-300 text-sm">AL-MUSTOFA</span>
            </h2>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive ? "bg-white text-primary font-bold shadow-lg" : "hover:bg-white/10 text-blue-100"}
                  `}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-6 border-t border-white/10">
          <button 
            onClick={logout}
            className="flex items-center gap-3 text-blue-200 hover:text-white transition-colors w-full`
          >
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Navbar */}
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800 lg:ml-0 ml-12">
            {menuItems.find(i => i.href === pathname)?.name || "Dashboard"}
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-700">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role.toLowerCase()}</p>
            </div>
            <div className="bg-blue-100 rounded-full text-primary overflow-hidden w-10 h-10 flex items-center justify-center border-2 border-white shadow-sm">
              {user?.image ? (
                <Image 
                  src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${user.image}`} 
                  alt="Profile`
                  width={40} 
                  height={40} 
                  className="object-cover w-full h-full`
                />
              ) : (
                <UserCircle size={28} />
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden`
        />
      )}
    </div>
  );
}
