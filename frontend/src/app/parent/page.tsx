"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Calendar, TrendingUp, AlertCircle, FileText, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ParentDashboard() {
  const { token } = useAuth();
  const [childData, setChildData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        // 1. Get my children
        const childrenRes = await fetch("http://localhost:5000/api/wali/my-children", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const children = await childrenRes.json();
        
        if (childrenRes.ok && children.length > 0) {
          const childId = children[0].id;
          // 2. Get report for first child
          const reportRes = await fetch(`http://localhost:5000/api/wali/report/${childId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const report = await reportRes.json();
          if (reportRes.ok) {
            setChildData({ ...children[0], ...report });
          }
        }
      } catch (err) {
        console.error("Error fetching child data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchChildData();
  }, [token]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      </DashboardLayout>
    );
  }

  if (!childData) {
    return (
      <DashboardLayout>
        <div className="card text-center p-12">
          <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-800">Data Tidak Ditemukan</h3>
          <p className="text-slate-500">Belum ada data santri yang terhubung dengan akun Anda.</p>
        </div>
      </DashboardLayout>
    );
  }

  const percentage = Math.round((childData.stats.HADIR / childData.stats.total) * 100) || 0;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("LAPORAN ABSENSI SANTRI", 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Nama Santri: ${childData.name}`, 14, 35);
    doc.text(`NIS: ${childData.nis}`, 14, 42);
    doc.text(`Kelas: ${childData.kelas.name}`, 14, 49);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 56);

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 62, 196, 62);

    doc.text("Ringkasan Kehadiran:", 14, 72);
    doc.text(`Hadir: ${childData.stats.HADIR}`, 14, 80);
    doc.text(`Izin: ${childData.stats.IZIN}`, 60, 80);
    doc.text(`Sakit: ${childData.stats.SAKIT}`, 106, 80);
    doc.text(`Alpha: ${childData.stats.ALPHA}`, 152, 80);
    doc.text(`Tingkat Kehadiran: ${percentage}%`, 14, 88);

    const tableData = childData.absensi.map((a: any) => [
      new Date(a.date).toLocaleDateString('id-ID'),
      a.status,
      a.notes || "-"
    ]);

    autoTable(doc, {
      startY: 95,
      head: [['Tanggal', 'Status', 'Keterangan']],
      body: tableData,
      headStyles: { fillColor: [37, 99, 235] }, // Blue-600
    });

    doc.save(`Laporan_Absensi_${childData.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8">
          <div className="card bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-100 mb-1">Status Kehadiran Anak</p>
                <h2 className="text-3xl font-bold">{childData.name}</h2>
                <p className="text-blue-100 mt-2">Kelas {childData.kelas.name}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{percentage}%</div>
                <p className="text-blue-100 text-sm">Tingkat Kehadiran</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card text-center border-b-4 border-green-500">
              <p className="text-gray-500 text-sm mb-1">Hadir</p>
              <h3 className="text-2xl font-bold text-green-600">{childData.stats.HADIR}</h3>
            </div>
            <div className="card text-center border-b-4 border-blue-500">
              <p className="text-gray-500 text-sm mb-1">Izin</p>
              <h3 className="text-2xl font-bold text-blue-600">{childData.stats.IZIN}</h3>
            </div>
            <div className="card text-center border-b-4 border-orange-500">
              <p className="text-gray-500 text-sm mb-1">Sakit</p>
              <h3 className="text-2xl font-bold text-orange-600">{childData.stats.SAKIT}</h3>
            </div>
            <div className="card text-center border-b-4 border-red-500">
              <p className="text-gray-500 text-sm mb-1">Alpha</p>
              <h3 className="text-2xl font-bold text-red-600">{childData.stats.ALPHA}</h3>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-primary" />
              Riwayat Absensi Terakhir
            </h3>
            <div className="space-y-4">
              {childData.absensi.length > 0 ? (
                childData.absensi.map((abs: any, i: number) => (
                  <div key={abs.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="text-center w-12 bg-white rounded-lg p-2 shadow-sm border border-slate-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                          {new Date(abs.date).toLocaleDateString('id-ID', { month: 'short' })}
                        </p>
                        <p className="font-bold text-lg text-gray-700 leading-none">
                          {new Date(abs.date).getDate()}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {new Date(abs.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500">{abs.notes || "Absensi Harian"}</p>
                      </div>
                    </div>
                    <span className={`
                      px-4 py-1.5 rounded-full text-xs font-bold shadow-sm
                      ${abs.status === "HADIR" ? "bg-green-100 text-green-700" : 
                        abs.status === "SAKIT" ? "bg-orange-100 text-orange-700" : 
                        abs.status === "IZIN" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}
                    `}>
                      {abs.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-slate-400 italic">Belum ada riwayat absensi.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:w-80 space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              Progress Kehadiran
            </h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    Sangat Baik
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {percentage}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div style={{ width: `${percentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500 text-center">
              Anak Anda telah hadir sebanyak {childData.stats.HADIR} hari dari total {childData.stats.total} hari belajar.
            </p>
          </div>

          <div className="card bg-blue-50 border border-blue-100 p-6">
            <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-2">
              <AlertCircle size={16} />
              Informasi Penting
            </h3>
            <p className="text-xs text-blue-700 leading-relaxed">
              Pastikan Anda memberikan surat keterangan dokter jika anak tidak hadir karena sakit lebih dari 3 hari.
            </p>
          </div>

          <button 
            onClick={handleDownloadPDF}
            className="w-full btn-primary flex items-center justify-center gap-2 py-4 shadow-blue-600/20 shadow-lg"
          >
            <FileText size={18} />
            Unduh Laporan Lengkap (PDF)
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
