"use client";

import BarChart from "@/components/chart/chart";
import ProtectedRoute from "@/components/protectedRoutes";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function LaporanPenjualan() {
  const [data, setData] = useState<any>(null);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState<boolean>(false);

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  ); // Generate last 10 years
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/report/penjualan?month=${month}&year=${year}`
      );

      const result = await response.json();
      console.log(result);
      setData(result);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!data) {
      alert("Tidak ada data untuk diekspor!");
      return;
    }

    // Prepare data for Excel
    const excelData = [
      ["Steak Tenda"], // Nama bisnis
      ["Jl. Dummy Street, No. 123, Kota Dummy, 12345"], // Alamat
      [],
      ["Laporan Penjualan Bulanan"], // Judul laporan
      [],
      ["Bulan", months[month - 1]],
      ["Tahun", year],
      [],
      ["Ringkasan"], // Section Ringkasan
      ["Total Transaksi", data.totalTransactions],
      ["Total Pendapatan", `Rp ${data.totalRevenue}`],
      ["Total Diskon", `Rp ${data.totalDiscount}`],
      [],
      ["Detail Penjualan"], // Section Detail Penjualan
      ["Item", "Jumlah", "Pendapatan"], // Header tabel
      ...Object.values(data.items).map((item: any) => [
        item.name,
        item.amount,
        `Rp ${item.revenue}`,
      ]),
    ];

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Add column widths
    worksheet["!cols"] = [
      { wch: 30 }, // Kolom "Item"
      { wch: 15 }, // Kolom "Jumlah"
      { wch: 20 }, // Kolom "Pendapatan"
    ];

    // Merge cells (tidak menambahkan style karena SheetJS tidak mendukung runtime styling)
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Merge untuk nama bisnis
      { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }, // Merge untuk alamat bisnis
      { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } }, // Merge untuk judul laporan
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");

    // Export Excel file
    XLSX.writeFile(
      workbook,
      `Laporan_Penjualan_${months[month - 1]}_${year}.xlsx`
    );
  };

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  return (
    <ProtectedRoute allowedRoles={["owner"]}>
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "30px",
            fontSize: "24px",
          }}
        >
          Laporan Penjualan Bulanan
        </h1>

        {/* Filter */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div>
            <label>Bulan:</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              style={{ padding: "10px", fontSize: "16px", marginLeft: "10px" }}
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Tahun:</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{ padding: "10px", fontSize: "16px", marginLeft: "10px" }}
            >
              {Array.from(
                { length: 10 },
                (_, i) => new Date().getFullYear() - i
              ).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchReport}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Tampilkan Laporan
          </button>
        </div>

        {/* Export Button */}
        <button
          onClick={exportToExcel}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            marginBottom: "30px",
          }}
        >
          Export ke Excel
        </button>
        {/* Loading & Report */}
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : data ? (
          <div>
            {/* Ringkasan */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
                marginBottom: "30px",
              }}
            >
              <div
                style={{
                  border: "1px solid #ddd",
                  padding: "20px",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <h3>Total Transaksi</h3>
                <p>{data.totalTransactions}</p>
              </div>
              <div
                style={{
                  border: "1px solid #ddd",
                  padding: "20px",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <h3>Total Pendapatan</h3>
                <p>Rp {data.totalRevenue}</p>
              </div>
              <div
                style={{
                  border: "1px solid #ddd",
                  padding: "20px",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <h3>Total Diskon</h3>
                <p>Rp {data.totalDiscount}</p>
              </div>
            </div>

            {/* Detail Penjualan */}
            <h2 style={{ marginBottom: "20px" }}>Detail Penjualan</h2>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.1)",
                marginBottom: "20px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "10px",
                      textAlign: "left",
                      backgroundColor: "#f8f8f8",
                    }}
                  >
                    Item
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "10px",
                      textAlign: "left",
                      backgroundColor: "#f8f8f8",
                    }}
                  >
                    Jumlah
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "10px",
                      textAlign: "left",
                      backgroundColor: "#f8f8f8",
                    }}
                  >
                    Pendapatan
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.values(data.items).map((item: any, index) => (
                  <tr key={index}>
                    <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                      {item.name}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                      {item.amount}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                      Rp {item.revenue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: "center" }}>Data tidak tersedia.</p>
        )}
        <div className="h-12"></div>
        <BarChart items={data?.items || []} />
      </div>
    </ProtectedRoute>
  );
}
