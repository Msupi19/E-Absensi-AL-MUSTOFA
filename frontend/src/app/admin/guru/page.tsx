"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { Plus, Search, Edit, Trash2, Phone, User as UserIcon, Loader2, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function AdminGuruPage() {
  const { token } = useAuth();
  const [gurus, setGurus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGuru, setNewGuru] = useState({
    name: "", nip: "", phone: "", username: "", password: "`
  });

  const fetchGurus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/guru`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setGurus(data);
    } catch (err) {
      console.error("Error fetching gurus:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchGurus();
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data guru ini?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/guru/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setGurus(gurus.filter(g => g.id !== id));
        alert("Data guru berhasil dihapus.");
      } else {
        alert(data.message || "Gagal menghapus data.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    }
  };

  const handleAddGuru = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/guru`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newGuru)
      });
      if (res.ok) {
        alert("Guru berhasil ditambahkan!");
        setIsModalOpen(false);
        setNewGuru({ name: "", nip: "", phone: "", username: "", password: "" });
        fetchGurus();
      } else {
        const data = await res.json();
        alert(data.message || "Gagal menambahkan guru.");
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    }
  };

  const filteredGurus = gurus.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.nip.includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Guru</h2>
          <p className="text-gray-500">Kelola data ustadz dan ustadzah pengampu kelas</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2`
        >
          <Plus size={18} />
          Tambah Guru Baru
        </button>
      </div>

      {/* Modal Add Guru */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-slate-800">Tambah Guru Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddGuru} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-sm font-semibold text-slate-600">Nama Lengkap</label>
                  <input 
                    type="text" required
                    className="w-full bg-slate-50 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/20`
                    value={newGuru.name}
                    onChange={e => setNewGuru({...newGuru, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-600">NIP</label>
                  <input 
                    type="text" required
                    className="w-full bg-slate-50 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/20`
                    value={newGuru.nip}
                    onChange={e => setNewGuru({...newGuru, nip: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-600">No. WhatsApp</label>
                  <input 
                    type="text`
                    className="w-full bg-slate-50 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/20`
                    value={newGuru.phone}
                    onChange={e => setNewGuru({...newGuru, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-1 border-t pt-4 mt-2 col-span-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Akun Login Sistem
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-600">Username</label>
                  <input 
                    type="text" required
                    className="w-full bg-slate-50 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/20`
                    value={newGuru.username}
                    onChange={e => setNewGuru({...newGuru, username: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-600">Password</label>
                  <input 
                    type="password" required
                    className="w-full bg-slate-50 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/20`
                    value={newGuru.password}
                    onChange={e => setNewGuru({...newGuru, password: e.target.value})}
                  />
                </div>
              </div>
              <button type="submit" className="w-full btn-primary py-4 mt-4 shadow-lg shadow-primary/20">
                Simpan Data Guru
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text`
            placeholder="Cari guru berdasarkan nama atau NIP...`
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">Nama Guru</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">NIP</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">Kontak</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">Username</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGurus.map((guru) => (
                  <tr key={guru.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold">
                          {guru.name.charAt(0)}
                        </div>
                        <p className="font-semibold text-slate-800">{guru.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{guru.nip}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Phone size={14} className="text-slate-400" />
                        {guru.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-bold tracking-tight">@{guru.user?.username}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(guru.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors`
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
