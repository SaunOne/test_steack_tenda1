'use client';
import React, { useEffect, useState } from 'react';
import SearchBar from '@/components/searchbar';
import DynamicTable from '@/components/table/transaksi';

type Pelanggan = {
    pelanggan_id?: number;
    level_id: number;
    nama_pelanggan: string;
    level_member?: {
        nama_level: string;
    };
    index?: number;
};

type LevelMember = {
    level_id: number;
    nama_level: string;
};

const CustomerPage = () => {
    const [pelangganData, setPelangganData] = useState<Pelanggan[]>([]);
    const [filteredData, setFilteredData] = useState<Pelanggan[]>([]);
    const [levels, setLevels] = useState<LevelMember[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [newPelanggan, setNewPelanggan] = useState<Pelanggan>({ level_id: 0, nama_pelanggan: '' });
    const [searchQuery, setSearchQuery] = useState('');

    const pelangganColumns = [
        { header: "ID", accessor: "index" },
        { header: "Nama Pelanggan", accessor: "nama_pelanggan" },
        {
            header: "Level",
            accessor: "level_id",
            render: (row: Pelanggan) => row.level_member ? row.level_member.nama_level : "No Level"
        },
    ];

    const fetchPelangganData = async () => {
        const response = await fetch('/api/pelanggan');
        const data = await response.json();
        const dataWithIndex = data.map((item: Pelanggan, idx: number) => ({
            ...item,
            index: idx + 1,
        }));

        setPelangganData(dataWithIndex);
        setFilteredData(dataWithIndex);
    };

    const fetchLevels = async () => {
        const response = await fetch('/api/level_members');
        const data = await response.json();
        setLevels(data);
    };

    useEffect(() => {
        fetchPelangganData();
        fetchLevels();
    }, []);

    useEffect(() => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        const filtered = pelangganData.filter((pelanggan) =>
            pelanggan.nama_pelanggan.toLowerCase().includes(lowerCaseQuery) ||
            pelanggan.level_member?.nama_level?.toLowerCase().includes(lowerCaseQuery)
        );
        setFilteredData(filtered);
    }, [searchQuery, pelangganData]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleAdd = () => {
        setIsModalOpen(true);
        setIsEditMode(false);
        setNewPelanggan({ level_id: levels[0]?.level_id || 0, nama_pelanggan: '' });
    };

    const handleEdit = (pelanggan_id: number) => {
        const pelanggan = pelangganData.find((p) => p.pelanggan_id === pelanggan_id);
        if (pelanggan) {
            setIsEditMode(true);
            setEditId(pelanggan_id);
            setNewPelanggan({ level_id: pelanggan.level_id, nama_pelanggan: pelanggan.nama_pelanggan });
            setIsModalOpen(true);
        }
    };

    const handleDelete = (pelanggan_id: number) => {
        setDeleteId(pelanggan_id);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId !== null) {
            await fetch('/api/pelanggan', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pelanggan_id: deleteId }),
            });
            setPelangganData(pelangganData.filter((p) => p.pelanggan_id !== deleteId));
            setIsDeleteConfirmOpen(false);
            setDeleteId(null);
        }
    };

    const handleModalSubmit = async () => {
        if (isEditMode && editId !== null) {
            const response = await fetch('/api/pelanggan', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pelanggan_id: editId, ...newPelanggan }),
            });
            const updatedPelanggan = await response.json();

            const updatedLevel = levels.find(level => level.level_id === newPelanggan.level_id);

            setPelangganData(prevData =>
                prevData
                    .map((p) => (p.pelanggan_id === editId
                        ? { ...updatedPelanggan, level_member: updatedLevel }
                        : p))
                    .map((item, idx) => ({ ...item, index: idx + 1 }))
            );
        } else {
            const response = await fetch('/api/pelanggan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPelanggan),
            });
            const createdPelanggan = await response.json();

            const createdLevel = levels.find(level => level.level_id === newPelanggan.level_id);

            setPelangganData(prevData =>
                [...prevData, { ...createdPelanggan, level_member: createdLevel }]
                    .map((item, idx) => ({ ...item, index: idx + 1 }))
            );
        }
        setIsModalOpen(false);
    };

    return (
        <div className="p-6">
            <SearchBar onSearch={handleSearch} onAdd={handleAdd} />
            <DynamicTable columns={pelangganColumns} data={filteredData} onEdit={handleEdit} onDelete={handleDelete} idAccessor="pelanggan_id" />

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg w-[400px] p-6">
                        <h2 className="text-lg font-semibold">{isEditMode ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Nama Pelanggan</label>
                            <input
                                type="text"
                                placeholder="Nama Pelanggan"
                                className="border border-gray-300 rounded-md w-full p-2 mb-3"
                                value={newPelanggan.nama_pelanggan}
                                onChange={(e) => setNewPelanggan({ ...newPelanggan, nama_pelanggan: e.target.value })}
                            />
                            <label className="block text-sm font-medium mb-1">Level</label>
                            <select
                                className="border border-gray-300 rounded-md w-full p-2"
                                value={newPelanggan.level_id}
                                onChange={(e) => setNewPelanggan({ ...newPelanggan, level_id: parseInt(e.target.value) })}
                            >
                                {levels.map((level) => (
                                    <option key={level.level_id} value={level.level_id}>
                                        {level.nama_level}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">
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
                        <p>Are you sure you want to delete this pelanggan?</p>
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

export default CustomerPage;
