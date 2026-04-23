"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { ClipboardCheck, Search, FileDown, Loader2, Calendar, User, PieChart, Info, FileText } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ParentReportPage() {
  const { token } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/wali/my-children`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setChildren(data);
          if (data.length > 0) {
            setSelectedChild(data[0].id);
          }
        }
      } catch (err) {
        console.error("Error fetching children:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchChildren();
  }, [token]);

  useEffect(() => {
    const fetchReport = async () => {
      if (!selectedChild) return;
      setReportLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/wali/report/${selectedChild}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setReportData(data);
      } catch (err) {
        console.error("Error fetching report:", err);
      } finally {
        setReportLoading(false);
      }
    };
    if (token && selectedChild) fetchReport();
  }, [token, selectedChild]);

  const filteredAbsensi = reportData?.absensi?.filter((a: any) => {
    if (!selectedDate) return true;
    return new Date(a.date).toISOString().split('T')[0] === selectedDate;
  }) || [];

  const handleExport = () => {
    if (filteredAbsensi.length === 0) {
      alert("Tidak ada data untuk di-export");
      return;
    }

    const childName = children.find(c => c.id === selectedChild)?.name || "Anak";
    
    const exportData = filteredAbsensi.map((a: any) => ({
      'Tanggal': new Date(a.date).toLocaleDateString('id-ID'),
      'Waktu': new Date(a.date).toLocaleTimeString('id-ID'),
      'Nama Santri': childName,
      'Status': a.status,
      'Keterangan': a.notes || '-'
    }));

    const worksheet = utils.json_to_sheet(exportData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Laporan Absensi");
    
    let filename = `Laporan_Absensi_${childName.replace(/\s+/g, '_')}`;
    if (selectedDate) filename += `_${selectedDate}`;
    
    writeFile(workbook, `${filename}.xlsx`);
  };

  const handleDownloadPDF = () => {
    if (!reportData) return;
    const doc = new jsPDF();
    const childName = children.find(c => c.id === selectedChild)?.name || "Anak";
    const childKelas = children.find(c => c.id === selectedChild)?.kelas.name || "";
    
    doc.setFontSize(18);
    doc.text("LAPORAN ABSENSI SANTRI", 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Nama Santri: ${childName}`, 14, 35);
    doc.text(`Kelas: ${childKelas}`, 14, 42);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 49);

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 55, 196, 55);

    doc.text("Ringkasan Kehadiran:", 14, 65);
    doc.text(`Hadir: ${reportData.stats.HADIR}`, 14, 73);
    doc.text(`Izin: ${reportData.stats.IZIN}`, 60, 73);
    doc.text(`Sakit: ${reportData.stats.SAKIT}`, 106, 73);
    doc.text(`Alpha: ${reportData.stats.ALPHA}`, 152, 73);

    const tableData = filteredAbsensi.map((a: any) => [
      new Date(a.date).toLocaleDateString('id-ID'),
      a.status,
      a.notes || "-"
    ]);

    autoTable(doc, {
      startY: 85,
      head: [['Tanggal', 'Status', 'Keterangan']],
      body: tableData,
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`Laporan_Absensi_${childName.replace(/\s+/g, '_')}.pdf`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Laporan Absensi Anak</h2>
          <p className="text-gray-500">Pantau kehadiran anak Anda di pesantren secara real-time</p>
        </div>
        
        {reportData && (
          <div className="flex gap-2">
            <button 
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-green-600/20 transition-all font-bold"
            >
              <FileDown size={18} />
              Excel
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all font-bold"
            >
              <FileText size={18} />
              PDF
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Pilih Anak</h3>
            <div className="space-y-3">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child.id)}
                  className={"w-full flex items-center gap-3 p-4 rounded-xl transition-all border " + (
                    selectedChild === child.id 
                    ? "bg-primary/5 border-primary text-primary font-bold"
                    : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <div className={"p-2 rounded-lg " + (selectedChild === child.id ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>
                    <User size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm leading-tight">{child.name}</p>
                    <p className="text-[10px] opacity-70 uppercase font-medium">{child.kelas.name}</p>
                  </div>
                </button>
              ))}
              {children.length === 0 && <p className="text-sm text-slate-500">Tidak ada data anak ditemukan.</p>}
            </div>
          </div>

          {reportData?.stats && (
            <div className="card bg-slate-900 text-white border-none shadow-xl shadow-slate-900/20">
              <div className="flex items-center gap-2 mb-6">
                <PieChart size={20} className="text-primary" />
                <h3 className="font-bold">Ringkasan Statistik</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Hadir</p>
                  <p className="text-2xl font-black text-green-400">{reportData.stats.HADIR}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Izin</p>
                  <p className="text-2xl font-black text-blue-400">{reportData.stats.IZIN}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Sakit</p>
                  <p className="text-2xl font-black text-orange-400">{reportData.stats.SAKIT}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Alpha</p>
                  <p className="text-2xl font-black text-red-400">{reportData.stats.ALPHA}</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                <p className="text-xs text-slate-400">Total Kehadiran</p>
                <p className="text-lg font-bold">{reportData.stats.total}</p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="card">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h3 className="text-lg font-bold text-slate-800">Riwayat Kehadiran</h3>
              <div className="relative w-full md:w-64">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="date"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm text-slate-700"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {reportLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-center">Status</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAbsensi.length > 0 ? filteredAbsensi.map((a: any) => (
                      <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-700">
                            {new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                             {new Date(a.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`
                            px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest
                            ${a.status === "HADIR" ? "bg-green-100 text-green-700 border border-green-200" : 
                              a.status === "SAKIT" ? "bg-orange-100 text-orange-700 border border-orange-200" : 
                              a.status === "IZIN" ? "bg-blue-100 text-blue-700 border border-blue-200" : 
                              "bg-red-100 text-red-700 border border-red-200"}
                          `}>
                            {a.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-500 italic">
                            {a.notes || "-"}
                          </p>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-20 text-center">
                          <Info size={48} className="mx-auto text-slate-200 mb-4" />
                          <h3 className="text-slate-500 font-bold">Tidak Ada Data</h3>
                          <p className="text-slate-400 text-sm mt-1">Belum ada catatan absensi untuk kriteria ini.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
