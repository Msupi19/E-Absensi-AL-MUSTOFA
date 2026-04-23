"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { Plus, Search, User, Edit, Trash2, GraduationCap, School, Loader2, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function AdminSantriPage() {
  const { token } = useAuth();
  const [santriList, setSantriList] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSantri, setNewSantri] = useState({
    name: "", nis: "", kelasId: "", parentUsername: "", parentPassword: ""
  });

  const fetchSantri = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/santri", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setSantriList(data);
    } catch (err) {
      console.error("Error fetching santri:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/kelas", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setClasses(data);
        if (data.length > 0) setNewSantri(prev => ({...prev, kelasId: data[0].id}));
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (token) {
      fetchSantri();
      fetchClasses();
    }
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data santri ini?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/santri/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSantriList(santriList.filter(s => s.id !== id));
      }
    } catch (err) {
      alert("Gagal menghapus data.");
    }
  };

  const handleAddSantri = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/admin/santri", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newSantri)
      });
      if (res.ok) {
        alert("Santri berhasil ditambahkan!");
        setIsModalOpen(false);
        setNewSantri({ name: "", nis: "", kelasId: classes[0]?.id || "", parentUsername: "", parentPassword: "" });
        fetchSantri();
      } else {
        alert("Gagal menambahkan santri.");
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    }
  };

  const filteredSantri = santriList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.nis.includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Santri</h2>
          <p className="text-gray-500">Kelola data santri dan akun orang tua</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Tambah Santri Baru
        </button>
      </div>

      {/* Modal Add Santri */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-slate-800">Tambah Santri Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddSantri} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-sm font-semibold text-slate-600">Nama Lengkap Santri</label>
                  <input 
                    type="text" required
                    className="w-full bg-slate-50 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/20"
                    value={newSantri.name}
                    onChange={e => setNewSantri({...newSantri, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-600">NIS</label>
                  <input 
                    type="text" required
                    className="w-full bg-slate-50 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/20"
                    value={newSantri.nis}
                    onChange={e => setNewSantri({...newSantri, nis: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-600">Pilih Kelas</label>
                  <select 
                    className="w-full bg-slate-50 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/20"
                    value={newSantri.kelasId}
                    onChange={e => setNewSantri({...newSantri, kelasId: e.target.value})}
                  >
                    {classes.map(k => (
                      <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 border-t pt-4 mt-2 col-span-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Akun Orang Tua (Wali)
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-600">Username Wali</label>
                  <input 
                    type="text" required
                    className="w-full bg-slate-50 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/20"
                    value={newSantri.parentUsername}
                    onChange={e => setNewSantri({...newSantri, parentUsername: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-600">Password Wali</label>
                  <input 
                    type="password" required
                    className="w-full bg-slate-50 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/20"
                    value={newSantri.parentPassword}
                    onChange={e => setNewSantri({...newSantri, parentPassword: e.target.value})}
                  />
                </div>
              </div>
              <button type="submit" className="w-full btn-primary py-4 mt-4 shadow-lg shadow-primary/20">
                Simpan Data Santri
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari santri berdasarkan nama atau NIS..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">Nama Santri</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">NIS</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">Kelas</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">Wali Santri</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSantri.map((santri) => (
                  <tr key={santri.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
                          {santri.name.charAt(0)}
                        </div>
                        <p className="font-semibold text-slate-800">{santri.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{santri.nis}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-slate-700">
                        <School size={14} className="text-primary" />
                        {santri.kelas.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-bold">@{santri.parent?.username || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(santri.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
