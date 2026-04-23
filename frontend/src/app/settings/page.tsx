"use client";

import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { KeyRound, ShieldCheck, AlertCircle, Loader2, Save, User, Camera, Upload } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Image from "next/image";

export default function SettingsPage() {
  const { token, user, updateUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: "error", text: "Ukuran file maksimal 2MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      handleUploadProfile(file);
    }
  };

  const handleUploadProfile = async (file: File) => {
    setUploading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5000/api/auth/upload-profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        setMessage({ type: "success", text: "Foto profil berhasil diperbarui!" });
      } else {
        setMessage({ type: "error", text: data.message || "Gagal mengunggah foto" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan saat mengunggah" });
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Konfirmasi password baru tidak cocok" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password baru minimal 6 karakter" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Password berhasil diubah!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: data.message || "Gagal mengubah password" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan koneksi" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto pb-20">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Pengaturan Akun</h2>
          <p className="text-gray-500">Kelola profil dan keamanan akun Anda.</p>
        </div>

        {/* Profile Picture Section */}
        <div className="card mb-8">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl">
              <User size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Foto Profil</h3>
              <p className="text-xs text-slate-400">Pilih foto profil untuk mempersonalisasi akun Anda</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center relative">
                {previewImage || user?.image ? (
                  <Image 
                    src={previewImage || `http://localhost:5000${user?.image}`} 
                    alt="Profile Preview" 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User size={64} className="text-slate-300" />
                )}
                
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" size={32} />
                  </div>
                )}
              </div>
              
              <label className="absolute bottom-1 right-1 bg-primary text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform active:scale-95">
                <Camera size={20} />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  disabled={uploading}
                />
              </label>
            </div>
            
            <div className="text-center">
              <p className="font-bold text-slate-800">{user?.name}</p>
              <p className="text-sm text-slate-500 capitalize">{user?.role.toLowerCase()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <KeyRound size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Ganti Password</h3>
              <p className="text-xs text-slate-400">Gunakan password yang kuat untuk keamanan ekstra</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
            {message.text && (
              <div className={`p-4 rounded-xl flex items-center gap-3 ${
                message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
              }`}>
                {message.type === "success" ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
                <p className="text-sm font-bold">{message.text}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Password Saat Ini</label>
              <input 
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Password Baru</label>
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Konfirmasi Password Baru</label>
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Simpan Perubahan Password
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="flex gap-4">
            <ShieldCheck size={40} className="text-slate-300" />
            <div>
              <h4 className="font-bold text-slate-700 text-sm">Informasi Keamanan</h4>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Jangan pernah membagikan password Anda kepada siapapun. Pastikan password baru Anda terdiri dari kombinasi huruf, angka, dan karakter khusus untuk perlindungan maksimal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
