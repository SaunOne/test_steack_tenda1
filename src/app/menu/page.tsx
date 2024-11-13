'use client';
import React, { useEffect, useState } from 'react';
import SearchBar from '@/components/searchbar';
import DynamicTable from '@/components/table/transaksi';

type Menu = {
    menu_id?: number;
    nama_menu: string;
    deskripsi_menu: string;
    harga: string;
    stok_menu: string;
    index?: number; // Index field for display order
};

const MenuPage = () => {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [filteredMenus, setFilteredMenus] = useState<Menu[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null); // Selected ID for edit/delete
    const [newMenu, setNewMenu] = useState<Menu>({ nama_menu: '', deskripsi_menu: '', harga: '', stok_menu: '' });
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const menuColumns = [
        { header: "No", accessor: "index" },
        { header: "Nama Menu", accessor: "nama_menu" },
        { header: "Deskripsi Menu", accessor: "deskripsi_menu" },
        { header: "Harga", accessor: "harga" },
        { header: "Stok", accessor: "stok_menu" },
    ];

    const fetchData = async () => {
        const response = await fetch('/api/menu');
        const data: Menu[] = await response.json();
        const menusWithIndex = data.map((item, index) => ({ ...item, index: index + 1 }));
        setMenus(menusWithIndex);
        setFilteredMenus(menusWithIndex);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const filtered = menus.filter(menu =>
            menu.nama_menu.toLowerCase().includes(searchQuery.toLowerCase()) ||
            menu.deskripsi_menu.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredMenus(filtered);
    }, [searchQuery, menus]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleAdd = () => {
        setIsModalOpen(true);
        setIsEditMode(false);
        setNewMenu({ nama_menu: '', deskripsi_menu: '', harga: '', stok_menu: '' });
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
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setNewMenu({ nama_menu: '', deskripsi_menu: '', harga: '', stok_menu: '' });
    };

    const handleModalSubmit = async () => {
        if (isEditMode && selectedId !== null) {
            const response = await fetch('/api/menu', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ menu_id: selectedId, ...newMenu }),
            });
            const updatedMenu = await response.json();
            const updatedMenus = menus.map((menu) => (menu.menu_id === selectedId ? updatedMenu : menu))
                .map((item, index) => ({ ...item, index: index + 1 }));
            setMenus(updatedMenus);
            setFilteredMenus(updatedMenus);
        } else {
            const response = await fetch('/api/menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMenu),
            });
            const newCreatedMenu = await response.json();
            const updatedMenus = [...menus, newCreatedMenu].map((item, index) => ({ ...item, index: index + 1 }));
            setMenus(updatedMenus);
            setFilteredMenus(updatedMenus);
        }
        handleModalClose();
    };

    return (
        <div className="p-6">
            <SearchBar onSearch={handleSearch} onAdd={handleAdd} />
            <DynamicTable columns={menuColumns} data={filteredMenus} onEdit={handleEdit} onDelete={handleDelete} idAccessor="menu_id" />

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg w-[600px] p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">{isEditMode ? 'Edit Menu' : 'Tambah Menu'}</h2>
                            <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-700">
                                &times;
                            </button>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Nama Menu</label>
                            <input
                                type="text"
                                placeholder="Nama Menu"
                                className="border border-gray-300 rounded-md w-full p-2 mb-3"
                                value={newMenu.nama_menu}
                                onChange={(e) => setNewMenu({ ...newMenu, nama_menu: e.target.value })}
                            />
                            <label className="block text-sm font-medium mb-1">Deskripsi Menu</label>
                            <input
                                type="text"
                                placeholder="Deskripsi Menu"
                                className="border border-gray-300 rounded-md w-full p-2 mb-3"
                                value={newMenu.deskripsi_menu}
                                onChange={(e) => setNewMenu({ ...newMenu, deskripsi_menu: e.target.value })}
                            />
                            <label className="block text-sm font-medium mb-1">Harga</label>
                            <input
                                type="text"
                                placeholder="Harga"
                                className="border border-gray-300 rounded-md w-full p-2 mb-3"
                                value={newMenu.harga}
                                onChange={(e) => setNewMenu({ ...newMenu, harga: e.target.value })}
                            />
                            <label className="block text-sm font-medium mb-1">Stok</label>
                            <input
                                type="text"
                                placeholder="Stok"
                                className="border border-gray-300 rounded-md w-full p-2"
                                value={newMenu.stok_menu}
                                onChange={(e) => setNewMenu({ ...newMenu, stok_menu: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button onClick={handleModalClose} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">
                                Cancel
                            </button>
                            <button onClick={handleModalSubmit} className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600">
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
                        <p>Are you sure you want to delete this menu item?</p>
                        <div className="flex justify-end space-x-3 mt-4">
                            <button onClick={() => setIsDeleteConfirmOpen(false)} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600">
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
