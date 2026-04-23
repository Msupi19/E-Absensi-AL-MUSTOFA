"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { Check, Save, Info, Loader2, Calendar } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

interface Santri {
  id: string;
  name: string;
  nis: string;
}

interface Kelas {
  id: string;
  name: string;
}

export default function AbsensiPage() {
  const { token } = useAuth();
  const [classes, setClasses] = useState<Kelas[]>([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [absensiData, setAbsensiData] = useState<Record<string, string>>({});
  const [notesData, setNotesData] = useState<Record<string, string>>({});
  const [isAlreadyFilled, setIsAlreadyFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch classes on load
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/guru/my-classes", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setClasses(data);
          if (data.length > 0) setSelectedKelas(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    if (token) fetchClasses();
  }, [token]);

  // Fetch santri and existing attendance when class or date changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedKelas || !selectedDate) return;
      setLoading(true);
      try {
        // 1. Fetch santri list
        const resSantri = await fetch(`http://localhost:5000/api/guru/class/${selectedKelas}/santri`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataSantri = await resSantri.json();
        
        // 2. Fetch existing attendance for this date
        const resHistory = await fetch(`http://localhost:5000/api/guru/history/${selectedKelas}?date=${selectedDate}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataHistory = await resHistory.json();

        if (resSantri.ok) {
          setSantriList(dataSantri);
          
          if (dataHistory.length > 0) {
            setIsAlreadyFilled(true);
            // Map existing data to state
            const existingData: Record<string, string> = {};
            const existingNotes: Record<string, string> = {};
            dataHistory.forEach((h: any) => {
              existingData[h.santriId] = h.status;
              existingNotes[h.santriId] = h.notes || "";
            });
            setAbsensiData(existingData);
            setNotesData(existingNotes);
          } else {
            setIsAlreadyFilled(false);
            const initialData: Record<string, string> = {};
            const initialNotes: Record<string, string> = {};
            dataSantri.forEach((s: Santri) => {
              initialData[s.id] = "HADIR";
              initialNotes[s.id] = "";
            });
            setAbsensiData(initialData);
            setNotesData(initialNotes);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token && selectedKelas) fetchData();
  }, [token, selectedKelas, selectedDate]);

  const handleStatusChange = (santriId: string, status: string) => {
    if (isAlreadyFilled) return;
    setAbsensiData(prev => ({ ...prev, [santriId]: status }));
  };

  const handleNoteChange = (santriId: string, note: string) => {
    if (isAlreadyFilled) return;
    setNotesData(prev => ({ ...prev, [santriId]: note }));
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const records = santriList.map(s => ({
        santriId: s.id,
        status: absensiData[s.id],
        notes: notesData[s.id]
      }));

      const res = await fetch("http://localhost:5000/api/guru/absensi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ records, date: selectedDate })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Absensi berhasil disimpan!");
        setIsAlreadyFilled(true);
      } else {
        alert(data.message || "Gagal menyimpan absensi.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Input Absensi Harian</h2>
          <p className="text-gray-500">Silakan pilih tanggal dan kelas terlebih dahulu</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <div className="relative group flex-1 md:flex-none">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={18} />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none w-full"
            />
          </div>

          <select 
            value={selectedKelas} 
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none flex-1 md:flex-none"
          >
            {classes.map(k => (
              <option key={k.id} value={k.id}>{k.name}</option>
            ))}
          </select>

          <button 
            onClick={handleSave}
            disabled={submitting || loading || isAlreadyFilled}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg
              ${isAlreadyFilled 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                : "bg-primary text-white hover:bg-blue-600 shadow-primary/20"}
            `}
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isAlreadyFilled ? "Sudah Diisi" : "Simpan Absensi"}
          </button>
        </div>
      </div>

      {isAlreadyFilled && (
        <div className="mb-6 bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-center gap-3 text-amber-700 shadow-sm animate-in slide-in-from-top-2">
          <Info size={20} className="text-amber-500" />
          <p className="text-sm font-medium">Data absensi untuk tanggal <strong>{new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> sudah tersedia dan tidak dapat diubah.</p>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
               <Loader2 className="animate-spin text-primary" size={40} />
               <p className="text-slate-400 font-medium">Menyiapkan daftar santri...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 text-sm font-bold text-slate-600 uppercase tracking-wider">Santri</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-600 text-center uppercase tracking-wider">Hadir</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-600 text-center uppercase tracking-wider">Izin</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-600 text-center uppercase tracking-wider">Sakit</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-600 text-center uppercase tracking-wider">Alpha</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-600 uppercase tracking-wider">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {santriList.map((santri) => (
                  <tr key={santri.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold border border-blue-100">
                          {santri.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{santri.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">NIS: {santri.nis}</p>
                        </div>
                      </div>
                    </td>
                    {["HADIR", "IZIN", "SAKIT", "ALPHA"].map((status) => (
                      <td key={status} className="px-6 py-4 text-center">
                        <label className={`relative ${isAlreadyFilled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                          <input 
                            type="radio" 
                            name={`status-${santri.id}`} 
                            className="sr-only peer"
                            checked={absensiData[santri.id] === status}
                            onChange={() => handleStatusChange(santri.id, status)}
                            disabled={isAlreadyFilled}
                          />
                          <div className={`
                            w-7 h-7 rounded-full border-2 mx-auto flex items-center justify-center transition-all duration-200
                            ${absensiData[santri.id] === status 
                              ? "bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/30" 
                              : "border-slate-200 bg-white hover:border-slate-300"}
                          `}>
                            {absensiData[santri.id] === status && <Check size={16} strokeWidth={4} />}
                          </div>
                        </label>
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <input 
                        type="text" 
                        placeholder="Tambahkan catatan..."
                        disabled={isAlreadyFilled}
                        className={`
                          w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all
                          ${isAlreadyFilled ? 'bg-slate-50 border-slate-100 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'}
                        `}
                        value={notesData[santri.id] || ""}
                        onChange={(e) => handleNoteChange(santri.id, e.target.value)}
                      />
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
