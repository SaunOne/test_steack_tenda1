'use client';

import React, { useEffect, useState } from 'react';
import SearchBar from '@/components/searchbar';
import DynamicTable from '@/components/table/transaksi';
import { toast } from "react-hot-toast";

type MenuItem = {
  id_menu: number;
  name: string;
  amount: number;
  price: number;
  subtotal: number;
};

type Transaction = {
  transaksi_id?: number;
  pelanggan_id: number;
  pelanggan_name?: string;
  tanggal_transaksi?: string;
  total_harga?: number;
  menu: MenuItem[];
};

const TransactionPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Transaction>({
    pelanggan_id: 0,
    menu: [],
  });
  const [customers, setCustomers] = useState<{ pelanggan_id: number; name: string; points: number }[]>([]);
  const [menus, setMenus] = useState<{ menu_id: number; name: string; price: number; description: string }[]>([]);
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([]);
  const [diskonRate, setDiskonRate] = useState<number>(0); // Diskon dalam bentuk desimal
  const [totalDiskon, setTotalDiskon] = useState<number>(0); // Total diskon
  const [totalHarga, setTotalHarga] = useState<number>(0); // Total harga setelah diskon
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);


  const transactionColumns = [
    { header: 'No', accessor: 'index' },
    { header: 'Pelanggan', accessor: 'pelanggan_name' },
    { header: 'Tanggal', accessor: 'tanggal_transaksi' },
    { header: 'Total Harga', accessor: 'total_harga' },
    { header: 'Action', accessor: 'actions' },
  ];

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transaksi');
      const data: Transaction[] = await response.json();
      const transactionsWithIndex = data.map((item, index) => ({ ...item, index: index + 1 }));
      setTransactions(transactionsWithIndex);
      setFilteredTransactions(transactionsWithIndex);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/pelanggan');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      setMenus(data);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    }
  };

  const fetchDiskon = async (pelangganId: number) => {
    try {
      const pelanggan = customers.find((c) => c.pelanggan_id === pelangganId);
      if (!pelanggan) return;

      const response = await fetch(`/api/level_member`);
      const levelMembers = await response.json();

      const applicableDiskon = levelMembers
        .filter((lm: any) => lm.minimum_point <= pelanggan.points)
        .sort((a: any, b: any) => b.minimum_point - a.minimum_point)[0];

      setDiskonRate(((applicableDiskon?.diskon ?? 0 * 1.0)  / 100.0)); // Diskon dalam desimal
    } catch (error) {
      console.error('Failed to fetch diskon:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchCustomers();
    fetchMenus();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = transactions.filter(
      (transaction) =>
        transaction.pelanggan_name?.toLowerCase().includes(query.toLowerCase()) ||
        transaction.tanggal_transaksi?.includes(query)
    );
    setFilteredTransactions(filtered);
  };

  const handleAddTransaction = () => {
    setNewTransaction({ pelanggan_id: 0, menu: [] });
    setSelectedMenuIds([]);
    setDiskonRate(0);
    setTotalDiskon(0);
    setTotalHarga(0);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewTransaction({ pelanggan_id: 0, menu: [] });
    setSelectedMenuIds([]);
    setDiskonRate(0);
    setTotalDiskon(0);
    setTotalHarga(0);
  };

  const handlePelangganChange = async (pelangganId: number) => {
    setNewTransaction((prev) => ({ ...prev, pelanggan_id: pelangganId }));
    await fetchDiskon(pelangganId);
  };

  const handleAddMenuItem = (menu: { menu_id: number; name: string; price: number }) => {
    setNewTransaction((prev) => {
      const existingMenuIndex = prev.menu.findIndex((m) => m.id_menu === menu.menu_id);

      if (existingMenuIndex > -1) {
        const updatedMenu = [...prev.menu];
        updatedMenu[existingMenuIndex].amount += 1;
        updatedMenu[existingMenuIndex].subtotal = updatedMenu[existingMenuIndex].amount * menu.price;
        return { ...prev, menu: updatedMenu };
      }

      setSelectedMenuIds((prevIds) => [...prevIds, menu.menu_id]);

      return {
        ...prev,
        menu: [
          ...prev.menu,
          { id_menu: menu.menu_id, name: menu.name, amount: 1, price: menu.price, subtotal: menu.price },
        ],
      };
    });
  };

  const handleDelete = (transaksi_id: number) => {
    setSelectedId(transaksi_id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedId !== null) {
      try {
        const response = await fetch('/api/transaksi', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transaksi_id: selectedId }),
        });
        if (!response.ok) throw new Error('Failed to delete transaction');
        const updatedTransactions = transactions.filter((transaction) => transaction.transaksi_id !== selectedId);
        setTransactions(updatedTransactions);
        setFilteredTransactions(updatedTransactions);
        setIsDeleteConfirmOpen(false);
        setSelectedId(null);
        toast.success('Transaksi berhasil dihapus!');
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        toast.error('Gagal menghapus transaksi');
      }
    }
  };

  const handlePrintReceipt = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsReceiptModalOpen(true);
  };

  const handleModalSubmit = async () => {
    const { pelanggan_id, menu } = newTransaction;
  
    if (!pelanggan_id || menu.length === 0) {
      toast.error('Pilih pelanggan dan menu untuk transaksi.');
      return;
    }
  
    try {
      // Hit API untuk membuat transaksi
      const response = await fetch('/api/transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pelanggan_id,
          menu: menu.map((item) => ({
            id_menu: item.id_menu,
            amount: item.amount,
          })),
        }),
      });
  
      if (!response.ok) {
        throw new Error('Gagal membuat transaksi');
      }
  
      toast.success('Transaksi berhasil dibuat');
      fetchTransactions(); // Perbarui daftar transaksi setelah berhasil
      handleModalClose(); // Tutup modal
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Gagal membuat transaksi');
    }
  };
  

  useEffect(() => {
    const totalHarga = newTransaction.menu.reduce((sum, item) => sum + item.subtotal, 0);
    const totalDiskon = totalHarga * diskonRate;
    setTotalDiskon(totalDiskon);
    setTotalHarga(totalHarga - totalDiskon);
  }, [newTransaction.menu, diskonRate]);

  return (
    <div className="p-6">
      <SearchBar onSearch={handleSearch} onAdd={handleAddTransaction} />
      <DynamicTable
        onDelete={handleDelete}
        idAccessor="transaksi_id"
        columns={transactionColumns}
        data={filteredTransactions.map((transaction) => ({
          ...transaction,
          actions: (
            <button
              onClick={() => handlePrintReceipt(transaction)}
              className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600"
            >
              Cetak Nota
            </button>
          ),
        }))}
      />

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[800px] p-6">
            <h2 className="text-lg font-semibold mb-4">Tambah Transaksi</h2>
            <select
              className="w-full p-2 mb-4 border rounded"
              value={newTransaction.pelanggan_id}
              onChange={(e) => handlePelangganChange(parseInt(e.target.value))}
            >
              <option value="">Pilih Pelanggan</option>
              {customers.map((customer) => (
                <option key={customer.pelanggan_id} value={customer.pelanggan_id}>
                  {customer.name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-4">
              {menus.map((menu) => (
                <div
                  key={menu.menu_id}
                  className={`border rounded-md p-4 shadow ${
                    selectedMenuIds.includes(menu.menu_id) ? 'bg-blue-100 border-blue-500' : ''
                  } hover:shadow-lg cursor-pointer`}
                  onClick={() => handleAddMenuItem(menu)}
                >
                  <h3 className="font-semibold">{menu.name}</h3>
                  <p>{menu.description}</p>
                  <p className="text-green-500">Rp{menu.price.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <h3 className="mt-6 mb-2">Keranjang</h3>
            <ul className="list-disc pl-6">
              {newTransaction.menu.map((item) => (
                <li key={item.id_menu} className="flex justify-between">
                  <span>{item.name}</span>
                  <div>
                    <span>{item.amount}x</span> = <span>Rp{item.subtotal.toLocaleString()}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 text-right">
              <p>Total Harga: Rp{newTransaction.menu.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString()}</p>
              <p>Diskon: Rp{totalDiskon.toLocaleString()}</p>
              <p className="font-bold">Total Setelah Diskon: Rp{totalHarga.toLocaleString()}</p>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={handleModalClose} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">
                Cancel
              </button>
              <button onClick={() => handleModalSubmit()} className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
        {isReceiptModalOpen && selectedTransaction && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-[600px] p-6">
            <h2 className="text-lg font-semibold mb-4">Nota Transaksi</h2>
            <p>
                <strong>Pelanggan:</strong> {selectedTransaction.pelanggan_name}
            </p>
            <p>
                <strong>Tanggal:</strong> {selectedTransaction.tanggal_transaksi}
            </p>
            <hr className="my-4" />
            <h3 className="text-md font-semibold mb-2">Detail Pesanan</h3>
            {/* <ul className="list-disc pl-6">
                {selectedTransaction.menu.map((item) => (
                <li key={item.id_menu} className="flex justify-between">
                    <span>
                    {item.name} x{item.amount}
                    </span>
                    <span>Rp{item.subtotal.toLocaleString()}</span>
                </li>
                ))}
            </ul> */}
            <hr className="my-4" />
            <div className="text-right">
                <p>
                <strong>Total Harga:</strong> Rp{selectedTransaction.total_harga?.toLocaleString()}
                </p>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
                <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                >
                Tutup
                </button>
                <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                >
                Cetak
                </button>
            </div>
            </div>
        </div>
        )}
         {isDeleteConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[400px] p-6">
            <h2 className="text-lg font-semibold mb-4">Konfirmasi Hapus</h2>
            <p>Apakah Anda yakin ingin menghapus transaksi ini?</p>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionPage;
