'use client';
import React, { useEffect, useState } from 'react';
import SearchBar from '@/components/searchbar';
import DynamicTable from '@/components/table/transaksi';
import { toast } from "react-hot-toast";

type Menu = {
  menu_id?: number; // Primary Key dari Prisma Schema
  name: string; // Nama Menu
  description: string; // Deskripsi Menu
  stok: number; // Stok Menu (Int)
  price: number; // Harga Menu (Float)
  index?: number; // Untuk keperluan tampilan (No urut)
};

const MenuPage = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newMenu, setNewMenu] = useState<Menu>({ name: '', description: '', stok: 0, price: 0 });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const menuColumns = [
    { header: 'No', accessor: 'index' },
    { header: 'Nama Menu', accessor: 'name' },
    { header: 'Deskripsi Menu', accessor: 'description' },
    { header: 'Stok', accessor: 'stok' },
    { header: 'Harga', accessor: 'price' },
  ];

  // Fetch data dari API
  const fetchData = async () => {
    try {
      const response = await fetch('/api/menu'); // Endpoint API
      const data: Menu[] = await response.json();
      const menusWithIndex = data.map((item, index) => ({ ...item, index: index + 1 }));
      setMenus(menusWithIndex);
      setFilteredMenus(menusWithIndex);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    }
  };

  // Trigger fetch saat komponen di-mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter berdasarkan query pencarian
  useEffect(() => {
    const filtered = menus.filter(
      (menu) =>
        menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        menu.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMenus(filtered);
  }, [searchQuery, menus]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAdd = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setNewMenu({ name: '', description: '', stok: 0, price: 0 });
  };

  const handleEdit = (menu_id: number) => {
    setSelectedId(menu_id);
    const menu = menus.find((m) => m.menu_id === menu_id);
    if (menu) {
      setIsEditMode(true);
      setNewMenu(menu);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (menu_id: number) => {
    setSelectedId(menu_id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedId !== null) {
      try {
        await fetch('/api/menu', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ menu_id: selectedId }),
        });
        const updatedMenus = menus.filter((menu) => menu.menu_id !== selectedId)
          .map((item, index) => ({ ...item, index: index + 1 }));
        setMenus(updatedMenus);
        setFilteredMenus(updatedMenus);
        setIsDeleteConfirmOpen(false);
        setSelectedId(null);
        toast.success('Menu berhasil dihapus!');
      } catch (error) {
        console.error('Failed to delete menu:', error);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewMenu({ name: '', description: '', stok: 0, price: 0 });
    setErrorMessage('');
  };

  const handleModalSubmit = async () => {
    const { name, description, stok, price } = newMenu;

    // Validasi
    if (!name || !description || stok === undefined || price === undefined) {
      setErrorMessage('Semua field harus diisi.');
      return;
    }
    if (stok < 0) {
      setErrorMessage('Stok tidak boleh bernilai negatif.');
      return;
    }
    if (price <= 0) {
      setErrorMessage('Harga harus lebih besar dari 0.');
      return;
    }
    if (description.length < 10) {
      setErrorMessage('Deskripsi harus lebih dari 10 karakter.');
      return;
    }

    try {
      if (isEditMode && selectedId !== null) {
        const response = await fetch('/api/menu', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ menu_id: selectedId, ...newMenu }),
        });
        const updatedMenu = await response.json();
        const updatedMenus = menus.map((menu) =>
          menu.menu_id === selectedId ? updatedMenu : menu
        );
        setMenus(updatedMenus);
        setFilteredMenus(updatedMenus);
        toast.success('Menu berhasil diperbarui!');
      } else {
        const response = await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMenu),
        });
        const newCreatedMenu = await response.json();
        setMenus([...menus, newCreatedMenu]);
        setFilteredMenus([...menus, newCreatedMenu]);
        toast.success('Menu berhasil ditambahkan!');
      }
      handleModalClose();
    } catch (error) {
      console.error('Failed to save menu:', error);
    }
  };

  return (
    <div className="p-6">
      <SearchBar onSearch={handleSearch} onAdd={handleAdd} />
      <DynamicTable
        columns={menuColumns}
        data={filteredMenus}
        onEdit={handleEdit}
        onDelete={handleDelete}
        idAccessor="menu_id"
      />

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[600px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{isEditMode ? 'Edit Menu' : 'Tambah Menu'}</h2>
              <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            {errorMessage && <p className="text-red-500 text-sm mb-3">{errorMessage}</p>}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nama Menu</label>
              <input
                type="text"
                placeholder="Nama Menu"
                className="border border-gray-300 rounded-md w-full p-2 mb-3"
                value={newMenu.name}
                onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
              />
              <label className="block text-sm font-medium mb-1">Deskripsi Menu</label>
              <input
                type="text"
                placeholder="Deskripsi Menu"
                className="border border-gray-300 rounded-md w-full p-2 mb-3"
                value={newMenu.description}
                onChange={(e) => setNewMenu({ ...newMenu, description: e.target.value })}
              />
              <label className="block text-sm font-medium mb-1">Stok</label>
              <input
                type="number"
                placeholder="Stok"
                className="border border-gray-300 rounded-md w-full p-2 mb-3"
                value={newMenu.stok}
                onChange={(e) => setNewMenu({ ...newMenu, stok: parseInt(e.target.value) })}
              />
              <label className="block text-sm font-medium mb-1">Harga</label>
              <input
                type="number"
                placeholder="Harga"
                className="border border-gray-300 rounded-md w-full p-2"
                value={newMenu.price}
                onChange={(e) => setNewMenu({ ...newMenu, price: parseFloat(e.target.value) })}
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
            <p>Are you sure you want to delete this menu?</p>
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

export default MenuPage;
