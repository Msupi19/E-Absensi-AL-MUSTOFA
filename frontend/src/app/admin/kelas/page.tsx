"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { Plus, Search, Edit, Trash2, School, Loader2, User, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function AdminKelasPage() {
  const { token } = useAuth();
  const [classList, setClassList] = useState<any[]>([]);
  const [gurus, setGurus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", guruId: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resKelas, resGuru] = await Promise.all([
        fetch("http://localhost:5000/api/admin/kelas", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/admin/guru", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const dataKelas = await resKelas.json();
      const dataGuru = await resGuru.json();
      if (resKelas.ok) setClassList(dataKelas);
      if (resGuru.ok) setGurus(dataGuru);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleOpenAdd = () => {
    setEditingKelas(null);
    setFormData({ name: "", guruId: gurus[0]?.id || "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (kelas: any) => {
    setEditingKelas(kelas);
    setFormData({ name: kelas.name, guruId: kelas.guruId });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingKelas 
      ? `http://localhost:5000/api/admin/kelas/${editingKelas.id}`
      : "http://localhost:5000/api/admin/kelas";
    const method = editingKelas ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
        alert(editingKelas ? "Kelas berhasil diperbarui!" : "Kelas berhasil ditambahkan!");
      } else {
        alert("Gagal menyimpan data kelas.");
      }
    } catch (err) {
      alert("Kesalahan koneksi.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kelas ini?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/kelas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setClassList(classList.filter(k => k.id !== id));
        alert("Kelas berhasil dihapus.");
      } else {
        alert(data.message || "Gagal menghapus.");
      }
    } catch (err) {
      alert("Kesalahan koneksi.");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Kelas</h2>
          <p className="text-gray-500">Kelola daftar kelas dan guru pengampu</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Tambah Kelas
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
             <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-2xl text-slate-800">
                  {editingKelas ? "Edit Kelas" : "Tambah Kelas"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={24} />
                </button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 ml-1">Nama Kelas</label>
                   <input 
                      type="text" required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Contoh: 10A, 11B..."
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 ml-1">Guru Pengampu</label>
                   <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                      value={formData.guruId}
                      onChange={e => setFormData({...formData, guruId: e.target.value})}
                   >
                      {gurus.map(g => (
                         <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                   </select>
                </div>
                <button type="submit" className="w-full btn-primary py-4 mt-4 shadow-lg shadow-primary/20 text-lg">
                  {editingKelas ? "Simpan Perubahan" : "Buat Kelas Baru"}
                </button>
             </form>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">Nama Kelas</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">Guru Pengampu</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">Jumlah Santri</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classList.length > 0 ? classList.map((kelas) => (
                  <tr key={kelas.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><School size={18}/></div>
                          {kelas.name}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                       <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400" />
                          {kelas.guru?.name || <span className="text-red-400 italic">Belum ada guru</span>}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                       <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                         {kelas._count?.santri || 0} Santri
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEdit(kelas)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(kelas.id)} 
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">Belum ada data kelas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
