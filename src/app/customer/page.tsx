'use client';
import React, { useEffect, useState } from 'react';
import SearchBar from '@/components/searchbar';
import DynamicTable from '@/components/table/transaksi';
import { toast } from "react-hot-toast";

type Customer = {
  pelanggan_id?: number; // Primary Key dari Prisma Schema
  name: string; // Nama Pelanggan
  points: number; // Poin Pelanggan
  index?: number; // Untuk keperluan tampilan (No urut)
};

const CustomerPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newCustomer, setNewCustomer] = useState<Customer>({ name: '', points: 0 });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const customerColumns = [
    { header: 'No', accessor: 'index' },
    { header: 'Nama Pelanggan', accessor: 'name' },
    { header: 'Poin', accessor: 'points' },
  ];

  // Fetch data dari API
  const fetchData = async () => {
    try {
      const response = await fetch('/api/pelanggan'); // Endpoint API
      const data: Customer[] = await response.json();
      const customersWithIndex = data.map((item, index) => ({ ...item, index: index + 1 }));
      setCustomers(customersWithIndex);
      setFilteredCustomers(customersWithIndex);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  // Trigger fetch saat komponen di-mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter berdasarkan query pencarian
  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAdd = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setNewCustomer({ name: '', points: 0 });
  };

  const handleEdit = (pelanggan_id: number) => {
    setSelectedId(pelanggan_id);
    const customer = customers.find((c) => c.pelanggan_id === pelanggan_id);
    if (customer) {
      setIsEditMode(true);
      setNewCustomer(customer);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (pelanggan_id: number) => {
    setSelectedId(pelanggan_id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedId !== null) {
      try {
        await fetch('/api/pelanggan', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pelanggan_id: selectedId }),
        });
        const updatedCustomers = customers.filter((customer) => customer.pelanggan_id !== selectedId)
          .map((item, index) => ({ ...item, index: index + 1 }));
        setCustomers(updatedCustomers);
        setFilteredCustomers(updatedCustomers);
        setIsDeleteConfirmOpen(false);
        setSelectedId(null);
        toast.success('Pelanggan berhasil dihapus!');
      } catch (error) {
        console.error('Failed to delete customer:', error);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewCustomer({ name: '', points: 0 });
    setErrorMessage('');
  };

  const handleModalSubmit = async () => {
    const { name, points } = newCustomer;

    // Validasi
    if (!name) {
      setErrorMessage('Nama pelanggan harus diisi.');
      return;
    }
    if (points < 0) {
      setErrorMessage('Poin tidak boleh bernilai negatif.');
      return;
    }

    try {
      if (isEditMode && selectedId !== null) {
        const response = await fetch('/api/pelanggan', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pelanggan_id: selectedId, ...newCustomer }),
        });
        const updatedCustomer = await response.json();
        const updatedCustomers = customers.map((customer) =>
          customer.pelanggan_id === selectedId ? updatedCustomer : customer
        );
        setCustomers(updatedCustomers);
        setFilteredCustomers(updatedCustomers);
        toast.success('Pelanggan berhasil diperbarui!');
      } else {
        const response = await fetch('/api/pelanggan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCustomer),
        });
        if(response.status === 409) {
            toast.error('Nama Pelangga Harus Unik!');
            return;
        }
        const newCreatedCustomer = await response.json();
        setCustomers([...customers, newCreatedCustomer]);
        setFilteredCustomers([...customers, newCreatedCustomer]);
        toast.success('Pelanggan berhasil ditambahkan!');
      }
      handleModalClose();
    } catch (error) {
      console.error('Failed to save customer:', error);
    }
  };

  return (
    <div className="p-6">
      <SearchBar onSearch={handleSearch} onAdd={handleAdd} />
      <DynamicTable
        columns={customerColumns}
        data={filteredCustomers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        idAccessor="pelanggan_id"
      />

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[600px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{isEditMode ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</h2>
              <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            {errorMessage && <p className="text-red-500 text-sm mb-3">{errorMessage}</p>}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nama Pelanggan</label>
              <input
                type="text"
                placeholder="Nama Pelanggan"
                className="border border-gray-300 rounded-md w-full p-2 mb-3"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              />
       
              <input
                type="hidden"
                placeholder="Poin"
                className="border border-gray-300 rounded-md w-full p-2"
                value={0}
                onChange={(e) => setNewCustomer({ ...newCustomer, points: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
              >
                {isEditMode ? 'Update' : 'Tambah'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[400px] p-6">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this customer?</p>
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPage;
