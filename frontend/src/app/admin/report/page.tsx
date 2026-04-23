"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { ClipboardCheck, Search, Filter, FileDown, Loader2, School, Calendar } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { utils, writeFile } from "xlsx";

export default function AdminReportPage() {
  const { token } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedKelas, setSelectedKelas] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch classes and santri (with attendance)
      const [resKelas, resSantri] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/kelas`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/santri`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const dataKelas = await resKelas.json();
      const dataSantri = await resSantri.json();
      
      if (resKelas.ok) setClasses(dataKelas);
      
      if (resSantri.ok) {
        const allAbsensi: any[] = [];
        dataSantri.forEach((s: any) => {
          s.absensi?.forEach((a: any) => {
            allAbsensi.push({
              ...a,
              santriName: s.name,
              santriNis: s.nis,
              kelasName: s.kelas.name,
              kelasId: s.kelas.id
            });
          });
        });
        setReports(allAbsensi.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    } catch (err) {
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const filteredReports = reports.filter(r => {
    const matchKelas = selectedKelas === "all" || r.kelasId === selectedKelas;
    const matchSearch = r.santriName.toLowerCase().includes(searchTerm.toLowerCase()) || r.santriNis.includes(searchTerm);
    
    // Date matching logic
    let matchDate = true;
    if (selectedDate) {
      const reportDate = new Date(r.date).toISOString().split('T')[0];
      matchDate = reportDate === selectedDate;
    }
    
    return matchKelas && matchSearch && matchDate;
  });

  const handleExport = () => {
    if (filteredReports.length === 0) {
      alert("Tidak ada data untuk di-export");
      return;
    }

    const exportData = filteredReports.map(r => ({
      'Tanggal': new Date(r.date).toLocaleDateString('id-ID'),
      'Waktu': new Date(r.date).toLocaleTimeString('id-ID'),
      'Nama Santri': r.santriName,
      'NIS': r.santriNis,
      'Kelas': r.kelasName,
      'Status': r.status,
      'Keterangan': r.notes || '-'
    }));

    const worksheet = utils.json_to_sheet(exportData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Laporan Absensi");
    
    let filename = "Laporan_Absensi";
    if (selectedKelas !== "all") {
      const className = classes.find(c => c.id === selectedKelas)?.name || "";
      filename += `_${className.replace(/\s+/g, '_')}`;
    }
    if (selectedDate) filename += `_${selectedDate}`;
    
    writeFile(workbook, `${filename}.xlsx`);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Laporan Absensi Pesantren</h2>
          <p className="text-gray-500">Monitoring kehadiran santri per kelas secara berkala</p>
        </div>
        
        <button 
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-green-600/20 transition-all font-bold`
        >
          <FileDown size={18} />
          Export Ke Excel
        </button>
      </div>

      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Filter Berdasarkan Kelas</label>
            <div className="relative">
              <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-medium text-slate-700`
              >
                <option value="all">Semua Kelas</option>
                {classes.map(k => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Cari Santri</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text`
                placeholder="Ketik nama atau NIS santri...`
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all`
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Pilih Tanggal</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="date`
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-700`
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              {selectedDate && (
                <button 
                  onClick={() => setSelectedDate("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded-md font-bold transition-colors`
                >
                  RESET
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Santri</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Keterangan/Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.length > 0 ? filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                       <p className="text-sm font-bold text-slate-700">
                         {new Date(report.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                       </p>
                       <p className="text-[10px] text-slate-400 font-mono">
                         {new Date(report.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                       </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {report.santriName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm leading-tight">{report.santriName}</p>
                          <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">{report.santriNis}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-100">
                        {report.kelasName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`
                        px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest
                        ${report.status === "HADIR" ? "bg-green-100 text-green-700 border border-green-200" : 
                          report.status === "SAKIT" ? "bg-orange-100 text-orange-700 border border-orange-200" : 
                          report.status === "IZIN" ? "bg-blue-100 text-blue-700 border border-blue-200" : 
                          "bg-red-100 text-red-700 border border-red-200"}
                      `}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500 italic max-w-xs truncate">
                        {report.notes || <span className="text-slate-300">-</span>}
                      </p>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <ClipboardCheck size={48} className="mx-auto text-slate-200 mb-4" />
                      <h3 className="text-slate-500 font-bold">Tidak Ada Data Ditemukan</h3>
                      <p className="text-slate-400 text-sm mt-1">Gunakan filter atau pencarian lain untuk menemukan data.</p>
                    </td>
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
